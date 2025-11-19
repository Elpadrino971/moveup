-- Migration: Referral System (Programme de Parrainage)
-- Created: 2025-01-19

-- Table des liens de parrainage
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL, -- Code court type "ALEX2K"
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index pour recherche rapide par code
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_user ON referral_codes(user_id);

-- Table des parrainages (qui a parrainé qui)
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Le parrain
  referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Le filleul
  referral_code TEXT REFERENCES referral_codes(code),
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'rewarded', 'fraud'
  completed_at TIMESTAMP, -- Quand le filleul a fait sa 1ère session
  rewarded_at TIMESTAMP, -- Quand les récompenses ont été données
  fraud_flags JSONB DEFAULT '[]'::jsonb, -- Flags anti-fraude
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);
CREATE INDEX idx_referrals_status ON referrals(status);

-- Table des récompenses de parrainage
CREATE TABLE referral_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL, -- 'moovcoins', 'premium_days', 'commission'
  amount INT NOT NULL, -- Montant (coins, jours, centimes €)
  description TEXT,
  claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_referral_rewards_user ON referral_rewards(user_id, created_at DESC);
CREATE INDEX idx_referral_rewards_referral ON referral_rewards(referral_id);

-- Table des commissions Premium (30% récurrent)
CREATE TABLE referral_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE,
  subscription_id UUID, -- Référence à l'abonnement Premium
  month DATE NOT NULL, -- Mois concerné
  amount_cents INT NOT NULL, -- Montant en centimes (ex: 300 = 3€)
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(referral_id, month) -- Une commission par mois par parrainage
);

-- Index
CREATE INDEX idx_referral_commissions_referrer ON referral_commissions(referrer_id, month DESC);
CREATE INDEX idx_referral_commissions_status ON referral_commissions(status);

-- Table des paliers de parrainage (badges)
CREATE TABLE referral_tiers (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  tier TEXT DEFAULT 'none', -- 'none', 'bronze', 'silver', 'gold', 'diamond', 'elite'
  total_referrals INT DEFAULT 0, -- Total filleuls
  active_referrals INT DEFAULT 0, -- Filleuls actifs (≥1 session/mois)
  premium_referrals INT DEFAULT 0, -- Filleuls Premium
  tier_reached_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table stats de parrainage
CREATE TABLE referral_stats (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_clicks INT DEFAULT 0, -- Clics sur le lien
  total_signups INT DEFAULT 0, -- Inscriptions via lien
  total_active INT DEFAULT 0, -- Activations (≥1 session)
  conversion_rate DECIMAL(5,2) DEFAULT 0, -- % signups/clicks
  activation_rate DECIMAL(5,2) DEFAULT 0, -- % active/signups
  total_moovcoins_earned INT DEFAULT 0,
  total_premium_days_earned INT DEFAULT 0,
  total_commission_cents INT DEFAULT 0, -- Total commissions gagnées
  last_referral_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Fonction: Générer code de parrainage unique
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID, p_username TEXT)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  -- Essayer username + nombre aléatoire
  FOR i IN 1..10 LOOP
    v_code := UPPER(SUBSTRING(p_username FROM 1 FOR 5) || FLOOR(RANDOM() * 1000)::TEXT);

    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = v_code) INTO v_exists;

    IF NOT v_exists THEN
      INSERT INTO referral_codes (user_id, code) VALUES (p_user_id, v_code);
      RETURN v_code;
    END IF;
  END LOOP;

  -- Fallback: UUID court
  v_code := UPPER(SUBSTRING(MD5(p_user_id::TEXT || NOW()::TEXT) FROM 1 FOR 8));
  INSERT INTO referral_codes (user_id, code) VALUES (p_user_id, v_code);
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Fonction: Calculer stats parrainage
CREATE OR REPLACE FUNCTION update_referral_stats(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO referral_stats (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO UPDATE SET
    total_signups = (
      SELECT COUNT(*) FROM referrals WHERE referrer_id = p_user_id
    ),
    total_active = (
      SELECT COUNT(*) FROM referrals WHERE referrer_id = p_user_id AND status = 'completed'
    ),
    conversion_rate = CASE
      WHEN (SELECT total_clicks FROM referral_stats WHERE user_id = p_user_id) > 0 THEN
        ((SELECT COUNT(*)::DECIMAL FROM referrals WHERE referrer_id = p_user_id) /
         (SELECT total_clicks FROM referral_stats WHERE user_id = p_user_id) * 100)
      ELSE 0
    END,
    activation_rate = CASE
      WHEN (SELECT COUNT(*) FROM referrals WHERE referrer_id = p_user_id) > 0 THEN
        ((SELECT COUNT(*)::DECIMAL FROM referrals WHERE referrer_id = p_user_id AND status = 'completed') /
         (SELECT COUNT(*) FROM referrals WHERE referrer_id = p_user_id) * 100)
      ELSE 0
    END,
    total_moovcoins_earned = (
      SELECT COALESCE(SUM(amount), 0) FROM referral_rewards
      WHERE user_id = p_user_id AND reward_type = 'moovcoins'
    ),
    total_premium_days_earned = (
      SELECT COALESCE(SUM(amount), 0) FROM referral_rewards
      WHERE user_id = p_user_id AND reward_type = 'premium_days'
    ),
    total_commission_cents = (
      SELECT COALESCE(SUM(amount_cents), 0) FROM referral_commissions
      WHERE referrer_id = p_user_id AND status = 'paid'
    ),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction: Mettre à jour le palier (tier)
CREATE OR REPLACE FUNCTION update_referral_tier(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_referrals INT;
  v_new_tier TEXT;
BEGIN
  -- Compter les filleuls actifs
  SELECT COUNT(*) INTO v_total_referrals
  FROM referrals
  WHERE referrer_id = p_user_id AND status = 'completed';

  -- Déterminer le palier
  IF v_total_referrals >= 100 THEN
    v_new_tier := 'elite';
  ELSIF v_total_referrals >= 50 THEN
    v_new_tier := 'diamond';
  ELSIF v_total_referrals >= 25 THEN
    v_new_tier := 'gold';
  ELSIF v_total_referrals >= 10 THEN
    v_new_tier := 'silver';
  ELSIF v_total_referrals >= 3 THEN
    v_new_tier := 'bronze';
  ELSE
    v_new_tier := 'none';
  END IF;

  -- Insérer ou mettre à jour
  INSERT INTO referral_tiers (user_id, tier, total_referrals, tier_reached_at)
  VALUES (p_user_id, v_new_tier, v_total_referrals, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    tier = CASE WHEN referral_tiers.tier != v_new_tier THEN v_new_tier ELSE referral_tiers.tier END,
    total_referrals = v_total_referrals,
    tier_reached_at = CASE WHEN referral_tiers.tier != v_new_tier THEN NOW() ELSE referral_tiers.tier_reached_at END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-créer code parrainage à l'inscription
CREATE OR REPLACE FUNCTION create_referral_code_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM generate_referral_code(NEW.id, NEW.username);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_referral_code
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_referral_code_on_signup();

-- RLS (Row Level Security)
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_stats ENABLE ROW LEVEL SECURITY;

-- Policies: Tout le monde peut voir son propre code
CREATE POLICY "Users can view own referral code"
  ON referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can view own rewards"
  ON referral_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own commissions"
  ON referral_commissions FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view own tier"
  ON referral_tiers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own stats"
  ON referral_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE referral_codes IS 'Codes de parrainage uniques par utilisateur';
COMMENT ON TABLE referrals IS 'Historique des parrainages (qui a parrainé qui)';
COMMENT ON TABLE referral_rewards IS 'Récompenses de parrainage (coins, premium, etc.)';
COMMENT ON TABLE referral_commissions IS 'Commissions 30% récurrentes sur Premium filleuls';
COMMENT ON TABLE referral_tiers IS 'Paliers de parrainage (Bronze, Silver, Gold, etc.)';
COMMENT ON TABLE referral_stats IS 'Statistiques de performance parrainage par user';

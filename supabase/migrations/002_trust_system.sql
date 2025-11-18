-- MoovUp Now - Trust System Migration
-- Système de confiance progressif pour la sécurité

-- ============================================================================
-- AJOUT DE COLONNES AU PROFIL UTILISATEUR
-- ============================================================================

-- Ajouter le niveau de confiance au profil
ALTER TABLE profiles
ADD COLUMN trust_level INTEGER DEFAULT 1 CHECK (trust_level >= 1 AND trust_level <= 5),
ADD COLUMN same_gender_sessions INTEGER DEFAULT 0,
ADD COLUMN opposite_gender_sessions INTEGER DEFAULT 0,
ADD COLUMN group_sessions INTEGER DEFAULT 0,
ADD COLUMN average_rating DECIMAL DEFAULT 0.0 CHECK (average_rating >= 0 AND average_rating <= 5),
ADD COLUMN account_age_days INTEGER DEFAULT 0;

-- Index pour performance
CREATE INDEX idx_profiles_trust_level ON profiles(trust_level);
CREATE INDEX idx_profiles_average_rating ON profiles(average_rating);

-- ============================================================================
-- TABLE DES AVERTISSEMENTS (WARNINGS)
-- ============================================================================

CREATE TABLE warnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  type TEXT NOT NULL CHECK (type IN (
    'inappropriate-behavior',
    'harassment',
    'no-show',
    'sexual-content',
    'fake-profile',
    'unsafe-location'
  )),

  reason TEXT NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'confirmed', 'dismissed')),

  -- Actions taken
  level_degraded BOOLEAN DEFAULT false,
  previous_level INTEGER,
  new_level INTEGER,

  -- Review
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_warnings_user ON warnings(user_id);
CREATE INDEX idx_warnings_status ON warnings(status);
CREATE INDEX idx_warnings_type ON warnings(type);
CREATE INDEX idx_warnings_created_at ON warnings(created_at);

-- ============================================================================
-- TABLE DES PARRAINAGES (SPONSORSHIPS)
-- ============================================================================

CREATE TABLE sponsorships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sponsored_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'rejected')),

  -- Rewards
  bonus_sessions_for_sponsored INTEGER DEFAULT 2,
  bonus_points_for_sponsor INTEGER DEFAULT 50,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CHECK (sponsor_id != sponsored_user_id)
);

-- Indexes
CREATE INDEX idx_sponsorships_sponsor ON sponsorships(sponsor_id);
CREATE INDEX idx_sponsorships_sponsored ON sponsorships(sponsored_user_id);
CREATE INDEX idx_sponsorships_status ON sponsorships(status);

-- ============================================================================
-- TABLE DES RESTRICTIONS DE MATCHING
-- ============================================================================

CREATE TABLE matching_restrictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  restricted_type TEXT NOT NULL CHECK (restricted_type IN (
    'opposite-gender-one-on-one',
    'opposite-gender-group',
    'all-matching',
    'private-locations'
  )),

  reason TEXT NOT NULL,
  applied_by TEXT DEFAULT 'system' CHECK (applied_by IN ('system', 'admin', 'report')),

  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_matching_restrictions_user ON matching_restrictions(user_id);
CREATE INDEX idx_matching_restrictions_active ON matching_restrictions(is_active);

-- ============================================================================
-- TABLE DES LOGS DE CHANGEMENT DE NIVEAU
-- ============================================================================

CREATE TABLE trust_level_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  previous_level INTEGER NOT NULL,
  new_level INTEGER NOT NULL,

  reason TEXT NOT NULL CHECK (reason IN (
    'progression',      -- Normal progression
    'degradation',      -- Warning/report
    'manual-admin',     -- Manual by admin
    'sponsorship',      -- Sponsored by Legend
    'verification',     -- Completed verification
    'inactivity'        -- Downgrade for inactivity
  )),

  trigger_event_id UUID, -- Session ID, Warning ID, etc.
  notes TEXT,

  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_trust_history_user ON trust_level_history(user_id);
CREATE INDEX idx_trust_history_changed_at ON trust_level_history(changed_at);

-- ============================================================================
-- FONCTIONS DE CALCUL DU NIVEAU DE CONFIANCE
-- ============================================================================

-- Fonction pour calculer le niveau de confiance
CREATE OR REPLACE FUNCTION calculate_trust_level(
  p_sessions_completed INTEGER,
  p_average_rating DECIMAL,
  p_warnings_count INTEGER,
  p_is_verified BOOLEAN,
  p_account_age_days INTEGER
) RETURNS INTEGER AS $$
BEGIN
  -- Niveau 1 : Débutant (0-4 sessions)
  IF p_sessions_completed < 5 THEN
    RETURN 1;
  END IF;

  -- Niveau 2 : Confirmé (5-9 sessions, note >= 4.0, 0 warnings)
  IF p_sessions_completed < 10 OR p_average_rating < 4.0 OR p_warnings_count > 0 THEN
    RETURN 2;
  END IF;

  -- Niveau 3 : Vérifié (10-19 sessions, note >= 4.5, vérifié)
  IF p_sessions_completed < 20 OR p_average_rating < 4.5 OR NOT p_is_verified THEN
    RETURN 3;
  END IF;

  -- Niveau 4 : Expert (20-49 sessions, max 1 warning)
  IF p_sessions_completed < 50 OR p_warnings_count > 1 THEN
    RETURN 4;
  END IF;

  -- Niveau 5 : Legend (50+ sessions, note >= 4.8, 0 warnings, 3+ mois)
  IF p_sessions_completed >= 50
     AND p_average_rating >= 4.8
     AND p_warnings_count = 0
     AND p_account_age_days >= 90 THEN
    RETURN 5;
  END IF;

  -- Default
  RETURN 3;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- FONCTION POUR VÉRIFIER LES PERMISSIONS DE MATCHING
-- ============================================================================

CREATE OR REPLACE FUNCTION can_match_opposite_gender(
  p_user_trust_level INTEGER,
  p_user_gender TEXT,
  p_target_gender TEXT,
  p_session_type TEXT -- 'one-on-one' or 'group'
) RETURNS BOOLEAN AS $$
BEGIN
  -- Same gender always allowed
  IF p_user_gender = p_target_gender THEN
    RETURN true;
  END IF;

  -- Groups always allowed
  IF p_session_type = 'group' THEN
    RETURN true;
  END IF;

  -- Opposite gender one-on-one requires Level 3+
  IF p_session_type = 'one-on-one' AND p_user_trust_level >= 3 THEN
    RETURN true;
  END IF;

  -- Otherwise not allowed
  RETURN false;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- TRIGGER POUR MISE À JOUR AUTOMATIQUE DU NIVEAU
-- ============================================================================

-- Fonction trigger pour recalculer le niveau de confiance
CREATE OR REPLACE FUNCTION update_trust_level()
RETURNS TRIGGER AS $$
DECLARE
  new_level INTEGER;
  old_level INTEGER;
BEGIN
  -- Calculer le nouveau niveau
  new_level := calculate_trust_level(
    NEW.sessions_completed,
    NEW.average_rating,
    NEW.warnings_count,
    NEW.is_verified,
    NEW.account_age_days
  );

  old_level := NEW.trust_level;

  -- Si le niveau a changé, mettre à jour et logger
  IF new_level != old_level THEN
    NEW.trust_level := new_level;

    -- Logger le changement dans l'historique
    INSERT INTO trust_level_history (
      user_id,
      previous_level,
      new_level,
      reason
    ) VALUES (
      NEW.id,
      old_level,
      new_level,
      CASE
        WHEN new_level > old_level THEN 'progression'
        ELSE 'degradation'
      END
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
CREATE TRIGGER trigger_update_trust_level
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (
    OLD.sessions_completed IS DISTINCT FROM NEW.sessions_completed OR
    OLD.average_rating IS DISTINCT FROM NEW.average_rating OR
    OLD.warnings_count IS DISTINCT FROM NEW.warnings_count OR
    OLD.is_verified IS DISTINCT FROM NEW.is_verified OR
    OLD.account_age_days IS DISTINCT FROM NEW.account_age_days
  )
  EXECUTE FUNCTION update_trust_level();

-- ============================================================================
-- TRIGGER POUR WARNINGS
-- ============================================================================

-- Fonction trigger pour appliquer les warnings
CREATE OR REPLACE FUNCTION apply_warning()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- Incrémenter le compte de warnings
    UPDATE profiles
    SET warnings_count = warnings_count + 1
    WHERE id = NEW.user_id;

    -- Si 3 warnings confirmés, dégrader au niveau 1
    IF (SELECT warnings_count FROM profiles WHERE id = NEW.user_id) >= 3 THEN
      UPDATE profiles
      SET
        trust_level = 1,
        warnings_count = warnings_count
      WHERE id = NEW.user_id;

      -- Logger la dégradation
      NEW.level_degraded := true;
      NEW.previous_level := (SELECT trust_level FROM profiles WHERE id = NEW.user_id);
      NEW.new_level := 1;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
CREATE TRIGGER trigger_apply_warning
  BEFORE UPDATE ON warnings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION apply_warning();

-- ============================================================================
-- TRIGGER POUR MISE À JOUR DES STATS APRÈS SESSION
-- ============================================================================

-- Fonction pour mettre à jour les stats de sessions
CREATE OR REPLACE FUNCTION update_session_stats()
RETURNS TRIGGER AS $$
DECLARE
  participant_record RECORD;
  creator_gender TEXT;
  participant_gender TEXT;
  participant_count INTEGER;
BEGIN
  -- Si la session passe à "completed"
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN

    -- Récupérer le genre du créateur
    SELECT gender INTO creator_gender FROM profiles WHERE id = NEW.creator_id;

    -- Compter les participants
    SELECT COUNT(*) INTO participant_count FROM session_participants WHERE session_id = NEW.id;

    -- Parcourir tous les participants
    FOR participant_record IN
      SELECT sp.user_id, p.gender
      FROM session_participants sp
      JOIN profiles p ON p.id = sp.user_id
      WHERE sp.session_id = NEW.id
    LOOP
      participant_gender := participant_record.gender;

      -- Incrémenter sessions_completed
      UPDATE profiles
      SET sessions_completed = sessions_completed + 1
      WHERE id = participant_record.user_id;

      -- Déterminer le type de session et incrémenter
      IF participant_count >= 3 THEN
        -- Groupe
        UPDATE profiles
        SET group_sessions = group_sessions + 1
        WHERE id = participant_record.user_id;
      ELSIF creator_gender = participant_gender THEN
        -- Même sexe
        UPDATE profiles
        SET same_gender_sessions = same_gender_sessions + 1
        WHERE id = participant_record.user_id;
      ELSE
        -- Sexe opposé
        UPDATE profiles
        SET opposite_gender_sessions = opposite_gender_sessions + 1
        WHERE id = participant_record.user_id;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
CREATE TRIGGER trigger_update_session_stats
  AFTER UPDATE ON sessions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_session_stats();

-- ============================================================================
-- TRIGGER POUR CALCUL DE LA NOTE MOYENNE
-- ============================================================================

-- Fonction pour recalculer la note moyenne après un rating
CREATE OR REPLACE FUNCTION update_average_rating()
RETURNS TRIGGER AS $$
DECLARE
  new_avg DECIMAL;
BEGIN
  -- Calculer la nouvelle moyenne pour l'utilisateur noté
  SELECT AVG(score) INTO new_avg
  FROM session_ratings
  WHERE rated_user_id = NEW.rated_user_id;

  -- Mettre à jour le profil
  UPDATE profiles
  SET average_rating = COALESCE(new_avg, 0)
  WHERE id = NEW.rated_user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
CREATE TRIGGER trigger_update_average_rating
  AFTER INSERT OR UPDATE ON session_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_average_rating();

-- ============================================================================
-- FONCTION POUR CALCULER L'ÂGE DU COMPTE
-- ============================================================================

-- Fonction à exécuter quotidiennement (via cron job ou scheduled function)
CREATE OR REPLACE FUNCTION update_account_ages()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET account_age_days = EXTRACT(DAY FROM (NOW() - created_at));
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) pour nouvelles tables
-- ============================================================================

-- Warnings
ALTER TABLE warnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own warnings"
  ON warnings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage warnings"
  ON warnings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND user_level >= 4 -- Only experts and legends can review
    )
  );

-- Sponsorships
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sponsorships involving them"
  ON sponsorships FOR SELECT
  USING (auth.uid() IN (sponsor_id, sponsored_user_id));

CREATE POLICY "Level 5 users can create sponsorships"
  ON sponsorships FOR INSERT
  WITH CHECK (
    auth.uid() = sponsor_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND trust_level = 5
    )
  );

-- Trust level history
ALTER TABLE trust_level_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trust history"
  ON trust_level_history FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================

COMMENT ON TABLE warnings IS 'Avertissements et signalements utilisateurs';
COMMENT ON TABLE sponsorships IS 'Parrainages par les utilisateurs Niveau 5';
COMMENT ON TABLE trust_level_history IS 'Historique des changements de niveau de confiance';
COMMENT ON TABLE matching_restrictions IS 'Restrictions temporaires de matching';

COMMENT ON COLUMN profiles.trust_level IS 'Niveau de confiance (1=Débutant, 5=Legend)';
COMMENT ON COLUMN profiles.same_gender_sessions IS 'Nombre de sessions avec même sexe';
COMMENT ON COLUMN profiles.opposite_gender_sessions IS 'Nombre de sessions avec sexe opposé';
COMMENT ON COLUMN profiles.group_sessions IS 'Nombre de sessions en groupe';
COMMENT ON COLUMN profiles.average_rating IS 'Note moyenne reçue';
COMMENT ON COLUMN profiles.account_age_days IS 'Âge du compte en jours';

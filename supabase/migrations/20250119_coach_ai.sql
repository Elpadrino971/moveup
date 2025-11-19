-- Migration: Coach IA "Moov"
-- Created: 2025-01-19

-- Table des conversations avec le Coach IA
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  message TEXT NOT NULL,
  is_user BOOLEAN NOT NULL, -- true = message de l'user, false = réponse de Moov

  -- Métadonnées
  tokens_used INT, -- Tokens consommés (coût tracking)
  model TEXT DEFAULT 'gpt-4-turbo', -- Modèle utilisé
  temperature DECIMAL(2, 1),

  -- Function calling
  function_called TEXT, -- Nom de la fonction appelée si applicable
  function_args JSONB, -- Arguments de la fonction

  -- Contexte
  context_snapshot JSONB, -- Snapshot du contexte user au moment du message

  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id, created_at DESC);
CREATE INDEX idx_ai_conversations_function ON ai_conversations(function_called) WHERE function_called IS NOT NULL;

-- Table des actions IA (function calls exécutées)
CREATE TABLE ai_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  action_type TEXT NOT NULL, -- 'book_session', 'create_objective', 'award_moovcoins', 'send_glucose_alert', etc.
  action_data JSONB, -- Données de l'action

  success BOOLEAN DEFAULT true,
  error_message TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_ai_actions_user ON ai_actions(user_id, created_at DESC);
CREATE INDEX idx_ai_actions_type ON ai_actions(action_type);
CREATE INDEX idx_ai_actions_conversation ON ai_actions(conversation_id);

-- Table des préférences IA par user
CREATE TABLE ai_user_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  response_style TEXT DEFAULT 'motivating', -- 'motivating', 'analytical', 'friendly', 'professional'
  tone TEXT DEFAULT 'casual', -- 'casual', 'formal'

  -- Features activées
  proactive_messages BOOLEAN DEFAULT true, -- Messages proactifs (série en danger, etc.)
  voice_enabled BOOLEAN DEFAULT false, -- Mode vocal
  nutrition_tracking BOOLEAN DEFAULT false, -- Scan assiette
  glucose_tracking BOOLEAN DEFAULT false, -- Pour diabétiques

  -- Limites
  daily_message_limit INT DEFAULT 10, -- Free: 10/jour, Premium: illimité
  messages_today INT DEFAULT 0,
  last_message_date DATE DEFAULT CURRENT_DATE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des notifications proactives envoyées
CREATE TABLE ai_proactive_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  message_type TEXT NOT NULL, -- 'streak_risk', 'weather_alert', 'new_record', 'partner_struggling', 'glucose_alert', etc.
  message_content TEXT NOT NULL,

  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'

  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,

  -- Actions suggérées
  suggested_actions JSONB, -- Boutons d'action rapide

  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_ai_proactive_user ON ai_proactive_messages(user_id, created_at DESC);
CREATE INDEX idx_ai_proactive_type ON ai_proactive_messages(message_type);
CREATE INDEX idx_ai_proactive_sent ON ai_proactive_messages(sent, priority);

-- Table des insights générés (analyse IA)
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  insight_type TEXT NOT NULL, -- 'performance_trend', 'sleep_recommendation', 'nutrition_tip', 'injury_risk', 'glucose_pattern', etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Données support
  data_points JSONB, -- Données utilisées pour générer l'insight
  confidence_score DECIMAL(3, 2), -- 0.0 à 1.0 (confiance dans l'insight)

  -- Actionnable
  actionable BOOLEAN DEFAULT false,
  suggested_action TEXT,

  -- Status
  shown_to_user BOOLEAN DEFAULT false,
  shown_at TIMESTAMP,
  dismissed BOOLEAN DEFAULT false,

  valid_until TIMESTAMP, -- Insights peuvent expirer

  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_ai_insights_user ON ai_insights(user_id, created_at DESC);
CREATE INDEX idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX idx_ai_insights_shown ON ai_insights(shown_to_user, valid_until);

-- Table des coûts API (tracking budget)
CREATE TABLE ai_usage_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Volumétrie
  total_messages INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  total_function_calls INT DEFAULT 0,

  -- Par modèle
  gpt4_tokens INT DEFAULT 0,
  gpt4_cost_usd DECIMAL(10, 4) DEFAULT 0,
  gpt35_tokens INT DEFAULT 0,
  gpt35_cost_usd DECIMAL(10, 4) DEFAULT 0,

  -- Total
  total_cost_usd DECIMAL(10, 4) DEFAULT 0,

  -- Par type d'utilisation
  chat_messages INT DEFAULT 0,
  proactive_messages INT DEFAULT 0,
  insights_generated INT DEFAULT 0,

  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(date)
);

-- Index
CREATE INDEX idx_ai_costs_date ON ai_usage_costs(date DESC);

-- Fonction: Vérifier limite messages quotidiens
CREATE OR REPLACE FUNCTION check_daily_message_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_prefs RECORD;
  v_is_premium BOOLEAN;
BEGIN
  -- Récupérer préférences
  SELECT * INTO v_prefs
  FROM ai_user_preferences
  WHERE user_id = p_user_id;

  -- Si pas de préférences, créer avec défaut
  IF v_prefs.user_id IS NULL THEN
    INSERT INTO ai_user_preferences (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    v_prefs.daily_message_limit := 10;
    v_prefs.messages_today := 0;
  END IF;

  -- Vérifier si Premium
  SELECT subscription_tier = 'premium' OR subscription_tier = 'legend'
  INTO v_is_premium
  FROM profiles
  WHERE id = p_user_id;

  -- Premium = illimité
  IF v_is_premium THEN
    RETURN true;
  END IF;

  -- Reset compteur si nouveau jour
  IF v_prefs.last_message_date < CURRENT_DATE THEN
    UPDATE ai_user_preferences
    SET messages_today = 0,
        last_message_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    RETURN true;
  END IF;

  -- Vérifier limite
  IF v_prefs.messages_today >= v_prefs.daily_message_limit THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Fonction: Incrémenter compteur messages
CREATE OR REPLACE FUNCTION increment_message_count(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO ai_user_preferences (user_id, messages_today, last_message_date)
  VALUES (p_user_id, 1, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE SET
    messages_today = CASE
      WHEN ai_user_preferences.last_message_date < CURRENT_DATE THEN 1
      ELSE ai_user_preferences.messages_today + 1
    END,
    last_message_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Fonction: Logger coût API
CREATE OR REPLACE FUNCTION log_ai_cost(
  p_model TEXT,
  p_tokens INT,
  p_cost_usd DECIMAL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO ai_usage_costs (date)
  VALUES (CURRENT_DATE)
  ON CONFLICT (date) DO UPDATE SET
    total_messages = ai_usage_costs.total_messages + 1,
    total_tokens = ai_usage_costs.total_tokens + p_tokens,
    gpt4_tokens = CASE WHEN p_model LIKE 'gpt-4%' THEN ai_usage_costs.gpt4_tokens + p_tokens ELSE ai_usage_costs.gpt4_tokens END,
    gpt4_cost_usd = CASE WHEN p_model LIKE 'gpt-4%' THEN ai_usage_costs.gpt4_cost_usd + p_cost_usd ELSE ai_usage_costs.gpt4_cost_usd END,
    gpt35_tokens = CASE WHEN p_model LIKE 'gpt-3.5%' THEN ai_usage_costs.gpt35_tokens + p_tokens ELSE ai_usage_costs.gpt35_tokens END,
    gpt35_cost_usd = CASE WHEN p_model LIKE 'gpt-3.5%' THEN ai_usage_costs.gpt35_cost_usd + p_cost_usd ELSE ai_usage_costs.gpt35_cost_usd END,
    total_cost_usd = ai_usage_costs.total_cost_usd + p_cost_usd,
    chat_messages = ai_usage_costs.chat_messages + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction: Construire contexte utilisateur pour IA
CREATE OR REPLACE FUNCTION get_user_context_for_ai(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_context JSONB;
BEGIN
  SELECT jsonb_build_object(
    'profile', (
      SELECT jsonb_build_object(
        'username', username,
        'age', EXTRACT(YEAR FROM AGE(birth_date)),
        'gender', gender,
        'trust_level', trust_level,
        'subscription_tier', subscription_tier,
        'has_diabetes', bio LIKE '%diabète%' OR bio LIKE '%diabetes%' -- À améliorer avec flag dédié
      )
      FROM profiles
      WHERE id = p_user_id
    ),
    'recent_sessions', (
      SELECT json_agg(
        json_build_object(
          'sport', sport_id,
          'date', scheduled_at,
          'type', session_type
        )
      )
      FROM sessions
      WHERE creator_id = p_user_id
        AND scheduled_at > NOW() - INTERVAL '30 days'
      ORDER BY scheduled_at DESC
      LIMIT 10
    ),
    'active_objectives', (
      SELECT json_agg(
        json_build_object(
          'title', title,
          'status', status
        )
      )
      FROM objectives
      WHERE user_id = p_user_id
        AND status = 'active'
    )
  ) INTO v_context;

  RETURN v_context;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security)
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_proactive_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_costs ENABLE ROW LEVEL SECURITY;

-- Policies: User peut voir ses conversations
CREATE POLICY "Users can view own AI conversations"
  ON ai_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI messages"
  ON ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies: User peut voir ses actions IA
CREATE POLICY "Users can view own AI actions"
  ON ai_actions FOR SELECT
  USING (auth.uid() = user_id);

-- Policies: User peut gérer ses préférences
CREATE POLICY "Users can manage own AI preferences"
  ON ai_user_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Policies: User peut voir ses messages proactifs
CREATE POLICY "Users can view own proactive messages"
  ON ai_proactive_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own proactive messages"
  ON ai_proactive_messages FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies: User peut voir ses insights
CREATE POLICY "Users can view own insights"
  ON ai_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON ai_insights FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies: Coûts API visibles par admins uniquement
CREATE POLICY "Only service role can view costs"
  ON ai_usage_costs FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Comments
COMMENT ON TABLE ai_conversations IS 'Historique des conversations avec Coach IA Moov';
COMMENT ON TABLE ai_actions IS 'Actions exécutées par le Coach IA (function calls)';
COMMENT ON TABLE ai_user_preferences IS 'Préférences utilisateur pour le Coach IA';
COMMENT ON TABLE ai_proactive_messages IS 'Messages proactifs envoyés par le Coach IA';
COMMENT ON TABLE ai_insights IS 'Insights générés par analyse IA des données user';
COMMENT ON TABLE ai_usage_costs IS 'Tracking des coûts API OpenAI par jour';

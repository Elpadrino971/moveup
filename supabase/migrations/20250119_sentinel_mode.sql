-- Migration: Mode Sentinel (Sécurité Renforcée)
-- Created: 2025-01-19

-- Table des contacts d'urgence
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT, -- 'parent', 'partner', 'friend', 'sibling', etc.
  priority INT DEFAULT 1, -- 1 = principal, 2 = secondaire
  notify_before_session BOOLEAN DEFAULT true,
  notify_during_session BOOLEAN DEFAULT true,
  notify_on_sos BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_emergency_contacts_user ON emergency_contacts(user_id, priority);

-- Table des sessions en mode Sentinel
CREATE TABLE sentinel_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Activation
  auto_activated BOOLEAN DEFAULT false, -- true si auto-activé (session risquée)
  manually_enabled BOOLEAN DEFAULT false, -- true si user l'a activé manuellement

  -- Tracking
  tracking_active BOOLEAN DEFAULT true,
  tracking_url TEXT UNIQUE, -- URL unique pour partage localisation

  -- Check-ins
  check_in_frequency_minutes INT DEFAULT 30,
  last_check_in_at TIMESTAMP,
  next_check_in_at TIMESTAMP,
  missed_check_ins INT DEFAULT 0,

  -- Contacts notifiés
  contacts_notified UUID[] DEFAULT '{}', -- IDs des contacts notifiés
  notified_at TIMESTAMP,

  -- Statut
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'sos_triggered', 'alert_sent'

  -- SOS
  sos_triggered BOOLEAN DEFAULT false,
  sos_triggered_at TIMESTAMP,
  sos_location_lat DECIMAL(10, 7),
  sos_location_lng DECIMAL(10, 7),
  sos_recording_url TEXT, -- URL enregistrement audio si SOS
  sos_photo_url TEXT, -- URL photo si SOS

  -- Timer
  planned_duration_minutes INT,
  overtime_minutes INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Index
CREATE INDEX idx_sentinel_sessions_user ON sentinel_sessions(user_id, created_at DESC);
CREATE INDEX idx_sentinel_sessions_session ON sentinel_sessions(session_id);
CREATE INDEX idx_sentinel_sessions_status ON sentinel_sessions(status);
CREATE INDEX idx_sentinel_sessions_tracking_url ON sentinel_sessions(tracking_url);

-- Table des locations temps réel (tracking)
CREATE TABLE sentinel_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sentinel_session_id UUID REFERENCES sentinel_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  accuracy DECIMAL(6, 2), -- Précision GPS en mètres
  speed DECIMAL(5, 2), -- Vitesse km/h

  battery_level INT, -- Niveau batterie %

  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_sentinel_locations_session ON sentinel_locations(sentinel_session_id, created_at DESC);
CREATE INDEX idx_sentinel_locations_user ON sentinel_locations(user_id, created_at DESC);

-- Partitionnement par date (performance)
-- Note: À activer en production quand beaucoup de données
-- CREATE TABLE sentinel_locations_partitioned (LIKE sentinel_locations INCLUDING ALL) PARTITION BY RANGE (created_at);

-- Table des check-ins
CREATE TABLE sentinel_check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sentinel_session_id UUID REFERENCES sentinel_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  check_in_type TEXT NOT NULL, -- 'auto_prompt', 'manual', 'auto_reminder'
  response TEXT, -- 'ok', 'need_help_discreet', 'sos', 'no_response'
  response_time_seconds INT, -- Temps de réponse

  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),

  created_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP
);

-- Index
CREATE INDEX idx_sentinel_checkins_session ON sentinel_check_ins(sentinel_session_id, created_at DESC);

-- Table des anomalies détectées (IA)
CREATE TABLE sentinel_anomalies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sentinel_session_id UUID REFERENCES sentinel_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  anomaly_type TEXT NOT NULL, -- 'location_deviation', 'abnormal_speed', 'no_movement', 'low_battery', 'partner_history'
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  description TEXT,
  data JSONB, -- Données détaillées de l'anomalie

  action_taken TEXT, -- 'none', 'check_in_forced', 'contact_alerted', 'sos_triggered'

  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_sentinel_anomalies_session ON sentinel_anomalies(sentinel_session_id, created_at DESC);
CREATE INDEX idx_sentinel_anomalies_severity ON sentinel_anomalies(severity, created_at DESC);

-- Table des alertes envoyées
CREATE TABLE sentinel_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sentinel_session_id UUID REFERENCES sentinel_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES emergency_contacts(id) ON DELETE SET NULL,

  alert_type TEXT NOT NULL, -- 'session_start', 'check_in_missed', 'overtime', 'sos', 'anomaly'
  alert_method TEXT NOT NULL, -- 'sms', 'call', 'email', 'push'

  message TEXT,
  tracking_url TEXT,

  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP,
  delivery_status TEXT, -- 'pending', 'delivered', 'failed'

  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_sentinel_alerts_session ON sentinel_alerts(sentinel_session_id, created_at DESC);
CREATE INDEX idx_sentinel_alerts_contact ON sentinel_alerts(contact_id, created_at DESC);

-- Fonction: Auto-activer Sentinel si session risquée
CREATE OR REPLACE FUNCTION should_activate_sentinel(
  p_session_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_session_type TEXT;
  v_partner_trust_level INT;
  v_hour INT;
  v_is_risky BOOLEAN := false;
BEGIN
  -- Récupérer infos session
  SELECT s.session_type INTO v_session_type
  FROM sessions s
  WHERE s.id = p_session_id;

  -- Vérifier si 1-on-1
  IF v_session_type = 'one-on-one' THEN
    -- Récupérer trust level du partenaire
    SELECT p.trust_level INTO v_partner_trust_level
    FROM session_participants sp
    JOIN profiles p ON p.id = sp.user_id
    WHERE sp.session_id = p_session_id
      AND sp.user_id != p_user_id
    LIMIT 1;

    -- Activer si Trust Level < 3
    IF v_partner_trust_level < 3 THEN
      v_is_risky := true;
    END IF;

    -- Vérifier l'horaire (après 20h ou avant 7h)
    SELECT EXTRACT(HOUR FROM scheduled_at) INTO v_hour
    FROM sessions
    WHERE id = p_session_id;

    IF v_hour >= 20 OR v_hour < 7 THEN
      v_is_risky := true;
    END IF;
  END IF;

  RETURN v_is_risky;
END;
$$ LANGUAGE plpgsql;

-- Fonction: Générer URL de tracking unique
CREATE OR REPLACE FUNCTION generate_tracking_url()
RETURNS TEXT AS $$
BEGIN
  RETURN SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 16);
END;
$$ LANGUAGE plpgsql;

-- Fonction: Calculer prochaine check-in
CREATE OR REPLACE FUNCTION calculate_next_check_in(
  p_frequency_minutes INT
)
RETURNS TIMESTAMP AS $$
BEGIN
  RETURN NOW() + (p_frequency_minutes || ' minutes')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Fonction: Détecter anomalies basiques
CREATE OR REPLACE FUNCTION detect_sentinel_anomalies(
  p_sentinel_session_id UUID
)
RETURNS TABLE(
  anomaly_type TEXT,
  severity TEXT,
  description TEXT
) AS $$
DECLARE
  v_session RECORD;
  v_last_location RECORD;
  v_last_movement TIMESTAMP;
  v_planned_location RECORD;
  v_distance_km DECIMAL;
BEGIN
  -- Récupérer infos session
  SELECT ss.*, s.location_lat, s.location_lng
  INTO v_session
  FROM sentinel_sessions ss
  JOIN sessions s ON s.id = ss.session_id
  WHERE ss.id = p_sentinel_session_id;

  -- Récupérer dernière localisation
  SELECT * INTO v_last_location
  FROM sentinel_locations
  WHERE sentinel_session_id = p_sentinel_session_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_last_location.id IS NOT NULL THEN
    -- 1. Vérifier déviation de localisation (> 2km du lieu prévu)
    -- Formule Haversine simplifiée
    v_distance_km := (
      6371 * acos(
        cos(radians(v_session.location_lat)) *
        cos(radians(v_last_location.latitude)) *
        cos(radians(v_last_location.longitude) - radians(v_session.location_lng)) +
        sin(radians(v_session.location_lat)) *
        sin(radians(v_last_location.latitude))
      )
    );

    IF v_distance_km > 2 THEN
      RETURN QUERY SELECT
        'location_deviation'::TEXT,
        'high'::TEXT,
        format('User s''est éloigné de %.1f km du lieu prévu', v_distance_km);
    END IF;

    -- 2. Vérifier vitesse anormale (> 30 km/h pour running/walking)
    IF v_last_location.speed > 30 THEN
      RETURN QUERY SELECT
        'abnormal_speed'::TEXT,
        'medium'::TEXT,
        format('Vitesse inhabituelle: %.1f km/h (transport motorisé?)', v_last_location.speed);
    END IF;

    -- 3. Vérifier batterie critique (< 10%)
    IF v_last_location.battery_level < 10 THEN
      RETURN QUERY SELECT
        'low_battery'::TEXT,
        'medium'::TEXT,
        format('Batterie critique: %s%%', v_last_location.battery_level);
    END IF;
  END IF;

  -- 4. Vérifier immobilité prolongée (> 20 min sans mouvement)
  SELECT MAX(created_at) INTO v_last_movement
  FROM sentinel_locations
  WHERE sentinel_session_id = p_sentinel_session_id
    AND speed > 0.5; -- Considérer mouvement si vitesse > 0.5 km/h

  IF v_last_movement IS NOT NULL AND NOW() - v_last_movement > INTERVAL '20 minutes' THEN
    RETURN QUERY SELECT
      'no_movement'::TEXT,
      'high'::TEXT,
      'Aucun mouvement détecté depuis 20+ minutes';
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security)
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_alerts ENABLE ROW LEVEL SECURITY;

-- Policies: User peut gérer ses propres contacts
CREATE POLICY "Users can manage own emergency contacts"
  ON emergency_contacts FOR ALL
  USING (auth.uid() = user_id);

-- Policies: User peut voir ses sentinel sessions
CREATE POLICY "Users can view own sentinel sessions"
  ON sentinel_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Policies: Contacts peuvent voir via tracking URL
CREATE POLICY "Public can view sentinel session via tracking URL"
  ON sentinel_sessions FOR SELECT
  USING (tracking_url IS NOT NULL); -- Accès public via URL unique

-- Policies: Locations visibles par user + contacts via tracking
CREATE POLICY "Users can view own sentinel locations"
  ON sentinel_locations FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM sentinel_sessions ss
      WHERE ss.id = sentinel_session_id
        AND ss.tracking_url IS NOT NULL
    )
  );

-- Policies: Check-ins
CREATE POLICY "Users can manage own check-ins"
  ON sentinel_check_ins FOR ALL
  USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE emergency_contacts IS 'Contacts d''urgence de l''utilisateur pour Mode Sentinel';
COMMENT ON TABLE sentinel_sessions IS 'Sessions actives en Mode Sentinel avec tracking';
COMMENT ON TABLE sentinel_locations IS 'Historique des localisations temps réel';
COMMENT ON TABLE sentinel_check_ins IS 'Historique des check-ins (réponses utilisateur)';
COMMENT ON TABLE sentinel_anomalies IS 'Anomalies détectées par IA (vitesse, déviation, etc.)';
COMMENT ON TABLE sentinel_alerts IS 'Alertes envoyées aux contacts d''urgence';

-- MoovUp Now - Initial Database Schema
-- Supabase PostgreSQL Migration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- USERS & PROFILES
-- ============================================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say')),
  city TEXT,
  zip_code TEXT,

  -- Fitness level
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),

  -- Preferences
  preferred_partner_gender TEXT CHECK (preferred_partner_gender IN ('male', 'female', 'non-binary', 'any')),
  max_distance INTEGER DEFAULT 10, -- in km
  prefer_verified_only BOOLEAN DEFAULT false,

  -- Gamification
  user_level INTEGER DEFAULT 1,
  points INTEGER DEFAULT 0,

  -- Integrity
  warnings_count INTEGER DEFAULT 0,
  sessions_completed INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE,
  last_warning_date TIMESTAMP WITH TIME ZONE,

  -- QR Code
  qr_code TEXT UNIQUE NOT NULL,

  -- Charter acceptance
  charter_accepted BOOLEAN DEFAULT false,
  charter_accepted_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sports master table
CREATE TABLE sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cardio', 'strength', 'flexibility', 'team', 'outdoor', 'indoor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User favorite sports (many-to-many)
CREATE TABLE user_sports (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sport_id UUID REFERENCES sports(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, sport_id)
);

-- User goals
CREATE TABLE user_goals (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  goal TEXT NOT NULL CHECK (goal IN ('weight-loss', 'muscle-gain', 'cardio', 'flexibility', 'wellness', 'social', 'competition')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, goal)
);

-- User availabilities
CREATE TABLE user_availabilities (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  availability TEXT NOT NULL CHECK (availability IN ('morning', 'noon', 'afternoon', 'evening', 'weekend')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, availability)
);

-- Badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  criteria JSONB, -- Conditions to unlock
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges (unlocked)
CREATE TABLE user_badges (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- ============================================================================
-- SESSIONS
-- ============================================================================

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Session details
  sport_id UUID NOT NULL REFERENCES sports(id),
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),

  -- Location (using PostGIS for geolocation)
  location GEOGRAPHY(POINT),
  location_address TEXT,
  location_name TEXT,
  is_location_public BOOLEAN DEFAULT true,

  -- Scheduling
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- in minutes

  -- Capacity
  max_participants INTEGER DEFAULT 2,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show')),

  -- QR validation
  qr_code TEXT UNIQUE NOT NULL,
  validated_at TIMESTAMP WITH TIME ZONE,

  -- Optional
  description TEXT,
  is_private BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session participants
CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'validated', 'cancelled')),

  -- QR validation
  qr_scanned_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(session_id, user_id)
);

-- Session ratings
CREATE TABLE session_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  badges TEXT[], -- Array of badge tags like 'punctual', 'motivating', etc.

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(session_id, rater_id, rated_user_id)
);

-- Session reports
CREATE TABLE session_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  reason TEXT NOT NULL CHECK (reason IN ('inappropriate-behavior', 'harassment', 'repeated-cancellation', 'fake-profile', 'unsafe-location', 'other')),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),

  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- COACHING
-- ============================================================================

-- Exercises
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  sets INTEGER,
  reps INTEGER,
  rest_time INTEGER, -- in seconds
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'extreme')),
  target_muscles TEXT[],
  equipment TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workouts
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  sport_id UUID REFERENCES sports(id),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'extreme')),
  duration INTEGER NOT NULL, -- in minutes
  calories INTEGER,
  thumbnail_url TEXT,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout exercises (many-to-many with order)
CREATE TABLE workout_exercises (
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  PRIMARY KEY (workout_id, exercise_id)
);

-- Workout goals (many-to-many)
CREATE TABLE workout_goals (
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  goal TEXT NOT NULL CHECK (goal IN ('weight-loss', 'muscle-gain', 'cardio', 'flexibility', 'wellness', 'social', 'competition')),
  PRIMARY KEY (workout_id, goal)
);

-- Workout plans
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  goal TEXT NOT NULL CHECK (goal IN ('weight-loss', 'muscle-gain', 'cardio', 'flexibility', 'wellness', 'social', 'competition')),
  duration INTEGER NOT NULL, -- in weeks
  workouts_per_week INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout plan workouts (many-to-many with week/day)
CREATE TABLE workout_plan_workouts (
  plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  day INTEGER NOT NULL,
  PRIMARY KEY (plan_id, week, day)
);

-- User active workout plans
CREATE TABLE user_workout_plans (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, plan_id)
);

-- Personal goals
CREATE TABLE personal_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('weight-loss', 'muscle-gain', 'cardio', 'flexibility', 'wellness', 'social', 'competition')),
  target DECIMAL NOT NULL,
  current DECIMAL DEFAULT 0,
  unit TEXT NOT NULL, -- 'kg', 'km', 'sessions', 'minutes', etc.
  deadline TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Progress tracking
CREATE TABLE progress_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  weight DECIMAL,
  body_fat DECIMAL,
  muscle_mass DECIMAL,
  photos TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);

-- Coaches
CREATE TABLE coaches (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT NOT NULL,
  rating DECIMAL DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  price_per_session INTEGER NOT NULL, -- in cents
  is_verified BOOLEAN DEFAULT false,
  certifications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coach specialties
CREATE TABLE coach_sports (
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  sport_id UUID REFERENCES sports(id) ON DELETE CASCADE,
  PRIMARY KEY (coach_id, sport_id)
);

-- Coaching sessions
CREATE TABLE coaching_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SHOP
-- ============================================================================

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('clothing', 'accessories', 'nutrition', 'equipment', 'digital')),
  price INTEGER NOT NULL, -- in cents
  points_price INTEGER, -- Can be bought with points
  images TEXT[] NOT NULL,
  sizes TEXT[],
  colors TEXT[],
  stock INTEGER DEFAULT 0,
  is_branded BOOLEAN DEFAULT false,
  has_qr_code BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total INTEGER NOT NULL, -- in cents
  points_used INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  shipping_address_id UUID REFERENCES addresses(id),
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL, -- in cents (price at time of purchase)
  size TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('session-match', 'session-reminder', 'session-cancelled', 'new-message', 'achievement', 'report-update', 'shop-order')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MESSAGES & CHAT
-- ============================================================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT false, -- For moderation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_profiles_is_verified ON profiles(is_verified);

-- Sessions
CREATE INDEX idx_sessions_creator ON sessions(creator_id);
CREATE INDEX idx_sessions_sport ON sessions(sport_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX idx_sessions_location ON sessions USING GIST(location);

-- Session participants
CREATE INDEX idx_session_participants_session ON session_participants(session_id);
CREATE INDEX idx_session_participants_user ON session_participants(user_id);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read public profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Sessions: Public sessions are viewable by everyone
CREATE POLICY "Public sessions are viewable by everyone"
  ON sessions FOR SELECT
  USING (NOT is_private OR creator_id = auth.uid());

CREATE POLICY "Users can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = creator_id);

-- Notifications: Users can only see their own
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Messages: Users can only see messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Orders: Users can only see their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate QR code (placeholder - will be replaced by app logic)
CREATE OR REPLACE FUNCTION generate_qr_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'QR_' || uuid_generate_v4()::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate QR code for new profiles
CREATE OR REPLACE FUNCTION create_profile_qr()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code = generate_qr_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_profile_qr_code
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_qr();

-- Trigger to generate QR code for new sessions
CREATE OR REPLACE FUNCTION create_session_qr()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code = generate_qr_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_session_qr_code
  BEFORE INSERT ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION create_session_qr();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE sessions IS 'Sport sessions created by users';
COMMENT ON TABLE session_participants IS 'Users participating in sessions';
COMMENT ON TABLE session_ratings IS 'User ratings after sessions';
COMMENT ON TABLE session_reports IS 'Reports for inappropriate behavior';
COMMENT ON TABLE badges IS 'Gamification badges';
COMMENT ON TABLE products IS 'Shop products';
COMMENT ON TABLE orders IS 'User orders';
COMMENT ON TABLE notifications IS 'User notifications';
COMMENT ON TABLE messages IS 'Chat messages between users';

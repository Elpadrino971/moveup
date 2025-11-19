-- Migration: User Availability Table
-- Description: Stores user availability preferences for matching

-- Create user_availability table
CREATE TABLE user_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL, -- monday, tuesday, etc.
  time_slot TEXT NOT NULL, -- early_morning, morning, lunch, afternoon, evening, night
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_day CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  CONSTRAINT valid_time_slot CHECK (time_slot IN ('early_morning', 'morning', 'lunch', 'afternoon', 'evening', 'night')),
  CONSTRAINT unique_user_day_slot UNIQUE(user_id, day_of_week, time_slot)
);

-- Create indexes
CREATE INDEX idx_user_availability_user_id ON user_availability(user_id);
CREATE INDEX idx_user_availability_day ON user_availability(day_of_week);
CREATE INDEX idx_user_availability_time ON user_availability(time_slot);
CREATE INDEX idx_user_availability_available ON user_availability(is_available);

-- Enable RLS
ALTER TABLE user_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own availability"
  ON user_availability FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own availability"
  ON user_availability FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own availability"
  ON user_availability FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own availability"
  ON user_availability FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_availability_updated_at
  BEFORE UPDATE ON user_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comment
COMMENT ON TABLE user_availability IS 'Stores user availability preferences for session matching';

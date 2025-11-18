-- MoovUp Now - Seed Data
-- Initial data for development and testing

-- ============================================================================
-- SPORTS
-- ============================================================================

INSERT INTO sports (name, icon, category) VALUES
  -- Cardio
  ('Running', '🏃', 'cardio'),
  ('Cycling', '🚴', 'cardio'),
  ('Swimming', '🏊', 'cardio'),
  ('Jump Rope', '🪢', 'cardio'),

  -- Strength
  ('Weight Training', '🏋️', 'strength'),
  ('CrossFit', '💪', 'strength'),
  ('Calisthenics', '🤸', 'strength'),

  -- Flexibility
  ('Yoga', '🧘', 'flexibility'),
  ('Pilates', '🤸‍♀️', 'flexibility'),
  ('Stretching', '🙆', 'flexibility'),

  -- Team
  ('Football', '⚽', 'team'),
  ('Basketball', '🏀', 'team'),
  ('Volleyball', '🏐', 'team'),
  ('Tennis', '🎾', 'team'),

  -- Outdoor
  ('Hiking', '🥾', 'outdoor'),
  ('Rock Climbing', '🧗', 'outdoor'),
  ('Trail Running', '🏃‍♂️', 'outdoor'),

  -- Indoor
  ('Boxing', '🥊', 'indoor'),
  ('Martial Arts', '🥋', 'indoor'),
  ('Dance', '💃', 'indoor'),
  ('HIIT', '⚡', 'indoor');

-- ============================================================================
-- BADGES
-- ============================================================================

INSERT INTO badges (name, description, icon, rarity, criteria) VALUES
  -- Common badges
  ('First Session', 'Completed your first session', '🎯', 'common', '{"sessions_completed": 1}'),
  ('Early Bird', 'Completed a morning session', '🌅', 'common', '{"morning_sessions": 1}'),
  ('Social Butterfly', 'Met 5 different partners', '🦋', 'common', '{"unique_partners": 5}'),
  ('Consistent', 'Completed 7 sessions in 7 days', '📅', 'common', '{"consecutive_days": 7}'),

  -- Rare badges
  ('Week Warrior', 'Completed 10 sessions', '⚔️', 'rare', '{"sessions_completed": 10}'),
  ('Month Master', 'Completed 30 sessions', '🏆', 'rare', '{"sessions_completed": 30}'),
  ('Five Star', 'Received 5-star rating 10 times', '⭐', 'rare', '{"five_star_ratings": 10}'),
  ('Verified', 'Account verified', '✅', 'rare', '{"is_verified": true}'),

  -- Epic badges
  ('Century Club', 'Completed 100 sessions', '💯', 'epic', '{"sessions_completed": 100}'),
  ('Coach Favorite', 'Completed 10 coaching sessions', '🎓', 'epic', '{"coaching_sessions": 10}'),
  ('Iron Will', 'Maintained a 30-day streak', '🔥', 'epic', '{"consecutive_days": 30}'),
  ('Community Hero', 'Organized 20 group sessions', '🦸', 'epic', '{"group_sessions_created": 20}'),

  -- Legendary badges
  ('Legend', 'Completed 500 sessions', '👑', 'legendary', '{"sessions_completed": 500}'),
  ('Perfect', 'Received only 5-star ratings (min 50 sessions)', '💎', 'legendary', '{"sessions_completed": 50, "average_rating": 5.0}'),
  ('Founder', 'Early adopter of MoovUp Now', '🌟', 'legendary', '{"created_before": "2025-12-31"}');

-- ============================================================================
-- SAMPLE EXERCISES
-- ============================================================================

INSERT INTO exercises (name, description, duration, sets, reps, rest_time, difficulty, target_muscles, equipment) VALUES
  ('Push-ups', 'Classic upper body exercise', 60, 3, 15, 60, 'easy', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['none']),
  ('Squats', 'Lower body strength exercise', 60, 3, 20, 60, 'easy', ARRAY['quads', 'glutes', 'hamstrings'], ARRAY['none']),
  ('Plank', 'Core stability exercise', 60, 3, null, 30, 'easy', ARRAY['core', 'abs'], ARRAY['none']),
  ('Burpees', 'Full body cardio exercise', 120, 3, 10, 60, 'medium', ARRAY['full-body'], ARRAY['none']),
  ('Pull-ups', 'Upper body strength', 90, 3, 8, 90, 'hard', ARRAY['back', 'biceps'], ARRAY['pull-up bar']),
  ('Lunges', 'Lower body exercise', 90, 3, 12, 60, 'medium', ARRAY['quads', 'glutes'], ARRAY['none']),
  ('Mountain Climbers', 'Cardio and core', 60, 3, 20, 45, 'medium', ARRAY['core', 'shoulders'], ARRAY['none']),
  ('Jumping Jacks', 'Warm-up cardio', 60, 3, 30, 30, 'easy', ARRAY['full-body'], ARRAY['none']);

-- ============================================================================
-- SAMPLE WORKOUTS
-- ============================================================================

-- Get sport IDs for reference
DO $$
DECLARE
  hiit_sport_id UUID;
  running_sport_id UUID;
BEGIN
  SELECT id INTO hiit_sport_id FROM sports WHERE name = 'HIIT' LIMIT 1;
  SELECT id INTO running_sport_id FROM sports WHERE name = 'Running' LIMIT 1;

  -- Full Body HIIT Workout
  INSERT INTO workouts (name, description, sport_id, difficulty, duration, calories, is_popular)
  VALUES (
    'Full Body HIIT',
    'High-intensity interval training for full body conditioning',
    hiit_sport_id,
    'medium',
    30,
    400,
    true
  );

  -- Beginner Running Plan
  INSERT INTO workouts (name, description, sport_id, difficulty, duration, calories, is_popular)
  VALUES (
    'Beginner 5K',
    'Introduction to running - build up to 5km',
    running_sport_id,
    'easy',
    30,
    300,
    true
  );
END $$;

-- ============================================================================
-- SAMPLE PRODUCTS
-- ============================================================================

INSERT INTO products (name, description, category, price, points_price, images, sizes, colors, stock, is_branded, has_qr_code, is_featured) VALUES
  (
    'MoovUp Now T-Shirt',
    'Official MoovUp Now branded t-shirt with integrated QR code',
    'clothing',
    2999, -- 29.99€
    500,
    ARRAY['https://placeholder.com/t-shirt-1.jpg'],
    ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    ARRAY['Blue', 'Black', 'White'],
    100,
    true,
    true,
    true
  ),
  (
    'MoovUp Now Sports Bottle',
    'Insulated sports bottle with MoovUp Now branding',
    'accessories',
    1999, -- 19.99€
    300,
    ARRAY['https://placeholder.com/bottle-1.jpg'],
    null,
    ARRAY['Blue', 'Black'],
    50,
    true,
    false,
    true
  ),
  (
    'QR Code Armband',
    'Waterproof armband with your personal QR code',
    'accessories',
    1499, -- 14.99€
    200,
    ARRAY['https://placeholder.com/armband-1.jpg'],
    ARRAY['S/M', 'L/XL'],
    ARRAY['Blue', 'Black', 'Pink'],
    75,
    true,
    true,
    false
  ),
  (
    'Resistance Bands Set',
    'Set of 3 resistance bands for home workouts',
    'equipment',
    2499, -- 24.99€
    400,
    ARRAY['https://placeholder.com/bands-1.jpg'],
    null,
    ARRAY['Multi-color'],
    30,
    false,
    false,
    true
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

-- This seed file provides initial data for:
-- - 21 sports across all categories
-- - 15 badges from common to legendary
-- - 8 sample exercises
-- - 2 sample workouts
-- - 4 sample products
--
-- Run this after applying migrations to get started with the app

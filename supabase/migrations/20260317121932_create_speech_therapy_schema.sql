/*
  # Speech Therapy Assistant Database Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `difficulty_level` (text, default 'beginner')
      - `total_points` (integer, default 0)
      - `current_streak` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `exercises`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `difficulty` (text)
      - `type` (text) - pronunciation, articulation, fluency, etc.
      - `target_words` (jsonb) - array of words/phrases to practice
      - `instructions` (text)
      - `points_value` (integer)
      - `created_at` (timestamptz)
    
    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `exercise_id` (uuid, references exercises)
      - `accuracy_score` (integer) - 0-100
      - `completion_time` (integer) - seconds
      - `transcript` (text) - what the user said
      - `points_earned` (integer)
      - `completed_at` (timestamptz)
    
    - `achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `achievement_type` (text) - first_exercise, streak_7, points_100, etc.
      - `title` (text)
      - `description` (text)
      - `icon` (text)
      - `earned_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  difficulty_level text DEFAULT 'beginner',
  total_points integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Exercises Table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  difficulty text DEFAULT 'beginner',
  type text DEFAULT 'pronunciation',
  target_words jsonb DEFAULT '[]'::jsonb,
  instructions text DEFAULT '',
  points_value integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercises"
  ON exercises FOR SELECT
  TO authenticated
  USING (true);

-- User Progress Table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  accuracy_score integer DEFAULT 0,
  completion_time integer DEFAULT 0,
  transcript text DEFAULT '',
  points_earned integer DEFAULT 0,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT 'award',
  earned_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert some starter exercises
INSERT INTO exercises (title, description, difficulty, type, target_words, instructions, points_value)
VALUES 
  (
    'Basic Vowel Sounds',
    'Practice pronouncing basic vowel sounds clearly',
    'beginner',
    'pronunciation',
    '["ah", "ee", "oo", "ay", "oh"]'::jsonb,
    'Repeat each vowel sound clearly. Try to hold each sound for 2 seconds.',
    10
  ),
  (
    'Consonant Clarity',
    'Work on clear consonant pronunciation',
    'beginner',
    'articulation',
    '["pa", "ta", "ka", "ba", "da", "ga"]'::jsonb,
    'Pronounce each consonant-vowel pair clearly and distinctly.',
    15
  ),
  (
    'Common Words Practice',
    'Practice commonly used words',
    'intermediate',
    'pronunciation',
    '["hello", "thank you", "goodbye", "please", "water"]'::jsonb,
    'Say each word clearly at a natural pace. Focus on clarity over speed.',
    20
  ),
  (
    'Tongue Twisters',
    'Challenge yourself with tongue twisters',
    'advanced',
    'fluency',
    '["she sells seashells", "peter piper", "red lorry yellow lorry"]'::jsonb,
    'Try to say each tongue twister slowly at first, then gradually increase speed.',
    30
  );

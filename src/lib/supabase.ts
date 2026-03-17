import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserProfile = {
  id: string;
  full_name: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  total_points: number;
  current_streak: number;
  created_at: string;
  updated_at: string;
};

export type Exercise = {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: string;
  target_words: string[];
  instructions: string;
  points_value: number;
  created_at: string;
};

export type UserProgress = {
  id: string;
  user_id: string;
  exercise_id: string;
  accuracy_score: number;
  completion_time: number;
  transcript: string;
  points_earned: number;
  completed_at: string;
};

export type Achievement = {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  icon: string;
  earned_at: string;
};

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Exercise, UserProgress, Achievement } from '../lib/supabase';
import { TrendingUp, Award, Target, Flame, LogOut } from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import ExerciseSession from './ExerciseSession';
import SpeechCaption from './SpeechCaption';

export default function Dashboard() {
  const { profile, signOut, refreshProfile } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [recentProgress, setRecentProgress] = useState<UserProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showCaptions, setShowCaptions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;

    setLoading(true);

    const [exercisesData, progressData, achievementsData] = await Promise.all([
      supabase.from('exercises').select('*').order('difficulty', { ascending: true }),
      supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', profile.id)
        .order('completed_at', { ascending: false })
        .limit(5),
      supabase
        .from('achievements')
        .select('*')
        .eq('user_id', profile.id)
        .order('earned_at', { ascending: false }),
    ]);

    if (exercisesData.data) setExercises(exercisesData.data);
    if (progressData.data) setRecentProgress(progressData.data);
    if (achievementsData.data) setAchievements(achievementsData.data);

    setLoading(false);
  };

  const handleCompleteExercise = async (score: number, transcript: string, timeSpent: number) => {
    if (!profile || !selectedExercise) return;

    const pointsEarned = Math.round((score / 100) * selectedExercise.points_value);

    const { error } = await supabase.from('user_progress').insert({
      user_id: profile.id,
      exercise_id: selectedExercise.id,
      accuracy_score: score,
      completion_time: timeSpent,
      transcript: transcript,
      points_earned: pointsEarned,
    });

    if (!error) {
      await supabase
        .from('user_profiles')
        .update({
          total_points: profile.total_points + pointsEarned,
          current_streak: profile.current_streak + 1,
        })
        .eq('id', profile.id);

      if (recentProgress.length === 0) {
        await supabase.from('achievements').insert({
          user_id: profile.id,
          achievement_type: 'first_exercise',
          title: 'First Steps',
          description: 'Completed your first exercise!',
          icon: 'trophy',
        });
      }

      if (profile.total_points + pointsEarned >= 100 && profile.total_points < 100) {
        await supabase.from('achievements').insert({
          user_id: profile.id,
          achievement_type: 'points_100',
          title: 'Century Club',
          description: 'Earned 100 points!',
          icon: 'star',
        });
      }

      await refreshProfile();
      await loadData();
    }

    setSelectedExercise(null);
  };

  const avgScore = recentProgress.length > 0
    ? Math.round(recentProgress.reduce((sum, p) => sum + p.accuracy_score, 0) / recentProgress.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {profile?.full_name}!
              </h1>
              <p className="text-gray-600 text-sm">Keep up the great work</p>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Points</h3>
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{profile?.total_points || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Current Streak</h3>
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{profile?.current_streak || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Avg Score</h3>
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{avgScore}%</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Exercises Done</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{recentProgress.length}</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Live Captions</h2>
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showCaptions ? 'Hide' : 'Show'}
            </button>
          </div>
          {showCaptions && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <SpeechCaption />
            </div>
          )}
        </div>

        {achievements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.slice(0, 3).map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-md p-6 border-2 border-yellow-200"
                >
                  <Award className="w-8 h-8 text-yellow-600 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-1">{achievement.title}</h3>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Exercises</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading exercises...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onStart={setSelectedExercise}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedExercise && (
        <ExerciseSession
          exercise={selectedExercise}
          onComplete={handleCompleteExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}

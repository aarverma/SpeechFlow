import { Exercise } from '../lib/supabase';
import { ChevronRight, Trophy } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
  onStart: (exercise: Exercise) => void;
}

export default function ExerciseCard({ exercise, onStart }: ExerciseCardProps) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-700 border-green-200',
    intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    advanced: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{exercise.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[exercise.difficulty]}`}>
          {exercise.difficulty}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4">{exercise.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="font-medium text-gray-700">{exercise.points_value} points</span>
        </div>

        <button
          onClick={() => onStart(exercise)}
          className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
        >
          Start
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

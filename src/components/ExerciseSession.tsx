import { useState, useEffect } from 'react';
import { Exercise } from '../lib/supabase';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { X, CheckCircle, XCircle, Award } from 'lucide-react';

interface ExerciseSessionProps {
  exercise: Exercise;
  onComplete: (score: number, transcript: string, timeSpent: number) => void;
  onClose: () => void;
}

export default function ExerciseSession({ exercise, onComplete, onClose }: ExerciseSessionProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [startTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastScore, setLastScore] = useState(0);

  const {
    transcript,
    interimTranscript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const currentWord = exercise.target_words[currentWordIndex];
  const isLastWord = currentWordIndex === exercise.target_words.length - 1;

  useEffect(() => {
    if (transcript.trim().toLowerCase()) {
      checkPronunciation(transcript.trim().toLowerCase());
    }
  }, [transcript]);

  const checkPronunciation = (spokenText: string) => {
    const targetText = currentWord.toLowerCase();
    const similarity = calculateSimilarity(spokenText, targetText);
    const score = Math.round(similarity * 100);

    setLastScore(score);
    setScores([...scores, score]);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      if (!isLastWord) {
        setCurrentWordIndex(currentWordIndex + 1);
        resetTranscript();
      } else {
        const avgScore = Math.round([...scores, score].reduce((a, b) => a + b, 0) / (scores.length + 1));
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        stopListening();
        onComplete(avgScore, spokenText, timeSpent);
      }
    }, 2000);
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    if (longer.includes(shorter) || shorter.includes(longer)) {
      return 0.9;
    }

    const editDistance = getEditDistance(str1, str2);
    return (longer.length - editDistance) / longer.length;
  };

  const getEditDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{exercise.title}</h2>
          <p className="text-gray-600">{exercise.instructions}</p>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            {exercise.target_words.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-all ${
                  index < currentWordIndex
                    ? 'bg-green-500'
                    : index === currentWordIndex
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Word {currentWordIndex + 1} of {exercise.target_words.length}
          </p>
        </div>

        <div className="mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 text-center border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Say this word:</p>
            <p className="text-4xl font-bold text-gray-900 mb-4">{currentWord}</p>
          </div>
        </div>

        {showFeedback && (
          <div className={`mb-6 p-4 rounded-xl border-2 ${
            lastScore >= 70
              ? 'bg-green-50 border-green-200'
              : lastScore >= 50
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              {lastScore >= 70 ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-yellow-500" />
              )}
              <div>
                <p className="font-semibold text-gray-900">Score: {lastScore}%</p>
                <p className="text-sm text-gray-600">
                  {lastScore >= 70 ? 'Great job!' : 'Keep practicing!'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className={`relative min-h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 ${
            isListening ? 'border-blue-500 shadow-lg' : 'border-gray-200'
          }`}>
            {isListening && (
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-600">Recording</span>
                </div>
              </div>
            )}

            <div className="text-lg leading-relaxed">
              {transcript || interimTranscript ? (
                <>
                  <span className="text-gray-900">{transcript}</span>
                  {interimTranscript && (
                    <span className="text-gray-400 italic">{interimTranscript}</span>
                  )}
                </>
              ) : (
                <p className="text-gray-400 italic">
                  {isListening ? 'Listening...' : 'Click start to begin speaking'}
                </p>
              )}
            </div>
          </div>

          {!isListening ? (
            <button
              onClick={startListening}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Start Speaking
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="w-full bg-red-500 text-white py-4 rounded-xl font-semibold hover:bg-red-600 transition-all"
            >
              Stop
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

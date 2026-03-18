import { Mic, MicOff, RotateCcw } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface SpeechCaptionProps {
  onTranscriptChange?: (transcript: string) => void;
  showControls?: boolean;
}

export default function SpeechCaption({ onTranscriptChange, showControls = true }: SpeechCaptionProps) {
  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error,
  } = useSpeechRecognition();

  const handleReset = () => {
    resetTranscript();
    if (onTranscriptChange) {
      onTranscriptChange('');
    }
  };

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 text-sm">
          Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  const displayText = transcript + (interimTranscript ? ' ' + interimTranscript : '');

  return (
    <div className="space-y-3">
      {showControls && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Start Speaking
              </>
            )}
          </button>

          {transcript && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>
      )}

      <div className={`relative min-h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 ${
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
          {displayText ? (
            <>
              <span className="text-gray-900">{transcript}</span>
              {interimTranscript && (
                <span className="text-gray-400 italic">{interimTranscript}</span>
              )}
            </>
          ) : (
            <p className="text-gray-400 italic">
              {isListening ? 'Start speaking...' : 'Click "Start Speaking" to begin'}
            </p>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {isListening && (
        <div className="flex items-center justify-center gap-1">
          <div className="w-1 h-8 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-12 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-10 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          <div className="w-1 h-14 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
          <div className="w-1 h-8 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
        </div>
      )}
    </div>
  );
}

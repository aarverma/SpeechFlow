import { Mic, MicOff, RotateCcw, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface SpeechCaptionProps {
  onTranscriptChange?: (transcript: string) => void;
  showControls?: boolean;
  title?: string;
}

export default function SpeechCaption({
  onTranscriptChange,
  showControls = true,
  title = 'Live Captions'
}: SpeechCaptionProps) {
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

  const [copied, setCopied] = useState(false);

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

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 text-sm font-medium">
          Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  const displayText = transcript + (interimTranscript ? ' ' + interimTranscript : '');
  const wordCount = displayText.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="space-y-4">
      {showControls && (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
            <span className="text-xs text-gray-500">{wordCount} words</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleToggle}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md'
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
              <>
                <button
                  onClick={handleCopy}
                  aria-label="Copy caption text"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  aria-label="Clear caption text"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear
                </button>
              </>
            )}
          </div>
        </>
      )}

      <div className={`relative min-h-40 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 transition-all ${
        isListening ? 'border-blue-500 shadow-2xl bg-blue-50' : 'border-gray-200'
      }`}>
        {isListening && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-600">Recording</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="text-xl leading-relaxed min-h-12">
            {displayText ? (
              <>
                <span className="text-gray-900 font-medium">{transcript}</span>
                {interimTranscript && (
                  <span className="text-gray-400 italic ml-1">{interimTranscript}</span>
                )}
              </>
            ) : (
              <p className="text-gray-400 italic">
                {isListening ? 'Start speaking... Your words will appear here' : 'Click "Start Speaking" to enable live captions'}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
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

      {transcript && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-xs font-medium">
            Captions are live and accessible. Enable screen readers for full accessibility.
          </p>
        </div>
      )}
    </div>
  );
}

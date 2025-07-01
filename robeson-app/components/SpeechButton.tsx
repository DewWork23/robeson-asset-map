'use client';

import { useState, useEffect } from 'react';

interface SpeechButtonProps {
  onSpeechResult: (text: string) => void;
  prompt?: string;
}

export default function SpeechButton({ onSpeechResult, prompt = "Say a category name like 'food' or 'healthcare'" }: SpeechButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if speech recognition is supported
    setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const startListening = () => {
    if (!isSupported) {
      setError('Voice search is not supported in your browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setIsListening(false);
      onSpeechResult(transcript);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else {
        setError('Voice search error. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (!isSupported) {
    return null; // Don't show the button if not supported
  }

  return (
    <div className="text-center">
      <button
        onClick={startListening}
        disabled={isListening}
        className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          isListening 
            ? 'bg-red-600 text-white animate-pulse' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        aria-label={isListening ? "Listening..." : "Search by voice"}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        {isListening ? 'Listening...' : 'Search by Voice'}
      </button>
      
      {isListening && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 animate-pulse">
          <p className="text-base font-medium text-blue-900">
            🎤 Listening... Speak now!
          </p>
          <p className="text-sm text-blue-700 mt-1">
            {prompt}
          </p>
        </div>
      )}
      
      {error && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
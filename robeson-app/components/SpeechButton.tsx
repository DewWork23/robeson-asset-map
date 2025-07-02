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
  const [recognition, setRecognition] = useState<any>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(60);

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
    recognition.continuous = true; // Keep listening continuously
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    // Store recognition instance
    setRecognition(recognition);
    
    // Set a timeout to stop listening after 60 seconds total
    const timeout = setTimeout(() => {
      if (recognition) {
        recognition.stop();
        setIsListening(false);
        setError('Recording time limit reached (1 minute). Click the button to try again.');
      }
    }, 60000); // 60 seconds (1 minute)
    setTimeoutId(timeout);
    
    // Update time remaining every second
    let remainingTime = 60;
    const intervalId = setInterval(() => {
      remainingTime -= 1;
      setTimeRemaining(remainingTime);
      if (remainingTime <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);
    
    // Store interval ID in recognition object for cleanup
    (recognition as any).intervalId = intervalId;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      // Get the last result
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.toLowerCase();
        // Clear timeout and stop recognition
        if (timeoutId) clearTimeout(timeoutId);
        if ((recognition as any).intervalId) clearInterval((recognition as any).intervalId);
        recognition.stop();
        setIsListening(false);
        setTimeRemaining(60);
        onSpeechResult(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      // Only stop on critical errors, ignore 'no-speech' for continuous listening
      if (event.error === 'no-speech') {
        // Ignore this error for continuous listening
        return;
      } else if (event.error === 'audio-capture') {
        if (timeoutId) clearTimeout(timeoutId);
        setIsListening(false);
        setError('No microphone found. Please check your microphone.');
      } else if (event.error === 'not-allowed') {
        if (timeoutId) clearTimeout(timeoutId);
        setIsListening(false);
        setError('Microphone access denied. Please allow microphone access.');
      } else if (event.error === 'aborted') {
        // Ignore aborted error
        return;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        setIsListening(false);
        setError('Voice search error. Please try again.');
      }
    };

    recognition.onend = () => {
      // Clean up
      if (timeoutId) clearTimeout(timeoutId);
      if ((recognition as any).intervalId) clearInterval((recognition as any).intervalId);
      setIsListening(false);
      setRecognition(null);
      setTimeRemaining(60);
    };

    recognition.start();
  };

  if (!isSupported) {
    return null; // Don't show the button if not supported
  }

  return (
    <div className="text-center">
      <button
        onClick={() => {
          if (isListening && recognition) {
            // Stop listening if already listening
            if (timeoutId) clearTimeout(timeoutId);
            if ((recognition as any).intervalId) clearInterval((recognition as any).intervalId);
            recognition.stop();
            setIsListening(false);
            setTimeRemaining(60);
          } else {
            startListening();
          }
        }}
        className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          isListening 
            ? 'bg-red-600 text-white animate-pulse' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        aria-label={isListening ? "Stop listening" : "Search by voice"}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        {isListening ? 'Stop Listening' : 'Search by Voice'}
      </button>
      
      {isListening && (
        <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-pulse">
          <p className="text-lg font-medium text-blue-900">
            🎤 Listening... Speak when ready!
          </p>
          <p className="text-base text-blue-800 mt-2 font-medium">
            {prompt}
          </p>
          <p className="text-sm text-blue-600 mt-2">
            Time remaining: {timeRemaining} seconds - take your time to think about what you need.
          </p>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(timeRemaining / 60) * 100}%` }}
            />
          </div>
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
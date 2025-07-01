'use client';

import { useState, useEffect } from 'react';

export default function MobileMapGuide() {
  const [showGuide, setShowGuide] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Check if user has seen the guide before
    const hasSeenGuide = localStorage.getItem('hasSeenMapGuide');
    if (!hasSeenGuide && window.innerWidth < 768) {
      setShowGuide(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenMapGuide', 'true');
    setShowGuide(false);
  };

  const steps = [
    {
      title: "Welcome to the Resource Map!",
      description: "Let me show you how to find resources near you",
      icon: "👋"
    },
    {
      title: "Tap Map Markers",
      description: "Tap any pin on the map to see quick actions like Call or Directions",
      icon: "📍"
    },
    {
      title: "View Full List",
      description: "Tap the 'View List' button to browse all resources with detailed information",
      icon: "📋"
    },
    {
      title: "You're All Set!",
      description: "Start exploring resources in Robeson County",
      icon: "✨"
    }
  ];

  if (!showGuide) return null;

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-slide-up">
        <div className="text-center">
          <div className="text-5xl mb-4">{currentStep.icon}</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{currentStep.title}</h3>
          <p className="text-gray-600 mb-6">{currentStep.description}</p>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === step ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3">
            {step < steps.length - 1 ? (
              <>
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              </>
            ) : (
              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
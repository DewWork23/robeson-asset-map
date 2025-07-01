'use client';

import { Category, CATEGORY_ICONS, CATEGORY_COLORS } from '@/types/organization';
import Link from 'next/link';
import SpeechButton from '@/components/SpeechButton';

interface CategorySelectionPromptProps {
  onCategorySelect: (category: Category | 'all') => void;
}

const categories: Category[] = [
  'Crisis Services',
  'Food Services',
  'Housing Services',
  'Healthcare Services',
  'Mental Health & Substance Use',
  'Government Services',
  'Tribal Services',
  'Community Services',
  'Community Groups & Development',
  'Faith-Based Services',
  'Legal Services',
  'Law Enforcement',
  'Education',
  'Pharmacy',
  'Cultural & Information Services'
];

export default function CategorySelectionPrompt({ onCategorySelect }: CategorySelectionPromptProps) {
  const handleSpeechResult = (transcript: string) => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    // Check for "all" or "everything"
    if (normalizedTranscript.includes('all') || normalizedTranscript.includes('everything')) {
      onCategorySelect('all');
      return;
    }
    
    // Try to match to a category
    for (const category of categories) {
      const categoryLower = category.toLowerCase();
      
      if (categoryLower.includes(normalizedTranscript) || normalizedTranscript.includes(categoryLower)) {
        onCategorySelect(category);
        return;
      }
      
      // Check for common keywords
      const keywordMap: Record<Category, string[]> = {
        'Crisis Services': ['crisis', 'emergency', 'help', '911', 'suicide', 'danger', 'urgent', 'immediate'],
        'Food Services': ['food', 'hungry', 'meal', 'eat', 'pantry', 'breakfast', 'lunch', 'dinner', 'nutrition', 'groceries', "i'm hungry", 'starving'],
        'Housing Services': ['housing', 'shelter', 'home', 'homeless', 'rent', 'apartment', 'eviction', 'utilities', "i'm homeless", 'place to stay', 'nowhere to go'],
        'Healthcare Services': ['health', 'doctor', 'medical', 'hospital', 'clinic', 'sick', 'pain', 'nurse', 'urgent care', "i'm sick", 'hurt', 'injured'],
        'Mental Health & Substance Use': ['mental', 'counseling', 'therapy', 'addiction', 'substance', 'depression', 'depressed', 'anxiety', 'anxious', 'sad', 'worried', 'stress', 'stressed', 'drugs', 'alcohol', 'recovery', "i'm depressed", "i'm anxious", "i'm sad"],
        'Government Services': ['government', 'benefits', 'assistance', 'social services', 'welfare', 'medicaid', 'medicare', 'snap'],
        'Tribal Services': ['tribal', 'lumbee', 'native', 'indian', 'indigenous'],
        'Community Services': ['community', 'support', 'volunteer', 'help', 'services'],
        'Community Groups & Development': ['group', 'development', 'organization', 'nonprofit', 'charity'],
        'Faith-Based Services': ['faith', 'church', 'religious', 'prayer', 'spiritual', 'ministry', 'worship', 'god'],
        'Legal Services': ['legal', 'lawyer', 'attorney', 'court', 'justice', 'rights', 'lawsuit', 'divorce'],
        'Law Enforcement': ['police', 'sheriff', 'law', 'crime', 'safety', 'report', 'officer'],
        'Education': ['education', 'school', 'learning', 'library', 'study', 'class', 'training', 'ged', 'college'],
        'Pharmacy': ['pharmacy', 'medicine', 'prescription', 'drug', 'medication', 'pills', 'rx'],
        'Cultural & Information Services': ['cultural', 'information', 'culture', 'arts', 'museum', 'history', 'heritage']
      };
      
      const keywords = keywordMap[category] || [];
      if (keywords.some(keyword => normalizedTranscript.includes(keyword))) {
        onCategorySelect(category);
        return;
      }
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Find Resources in Robeson County
            </h1>
            
            {/* Voice Search and Help Button */}
            <div className="mb-8">
              <SpeechButton 
                onSpeechResult={handleSpeechResult}
                prompt="Try saying: 'food', 'doctor', 'housing', 'mental health', 'church', or 'all categories'"
              />
              <button 
                onClick={() => {
                  const categoriesGrid = document.getElementById('categories-grid');
                  if (categoriesGrid) {
                    categoriesGrid.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors shadow-sm"
              >
                Need help finding something? ↓
              </button>
            </div>
            
            <p className="text-lg text-gray-600">
              Select a category below to browse resources
            </p>
          </div>

        <div id="categories-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className={`${CATEGORY_COLORS[category]} text-white rounded-lg p-4 hover:opacity-90 transition-opacity flex items-center space-x-3 shadow-md`}
            >
              <span className="text-2xl">{CATEGORY_ICONS[category]}</span>
              <span className="font-medium text-left">{category}</span>
            </button>
          ))}
        </div>

          <div className="mt-8">
            <button
              onClick={() => onCategorySelect('all')}
              className="w-full bg-gray-700 text-white rounded-lg p-4 hover:bg-gray-800 transition-colors flex items-center justify-center space-x-3 shadow-md"
            >
              <span className="text-2xl">🗺️</span>
              <span className="font-medium">View All Categories</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
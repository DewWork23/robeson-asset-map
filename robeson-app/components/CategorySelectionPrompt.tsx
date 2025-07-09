'use client';

import { Category, CATEGORY_ICONS, CATEGORY_COLORS } from '@/types/organization';
import Link from 'next/link';
import SpeechButton from '@/components/SpeechButton';
import { useRouter } from 'next/navigation';
import { useOrganizations } from '@/contexts/OrganizationsContext';

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
  const router = useRouter();
  const { organizations } = useOrganizations();
  
  const handleSpeechResult = (transcript: string) => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    console.log('Map voice search transcript:', transcript);
    console.log('Normalized transcript:', normalizedTranscript);
    
    // First, check if the transcript matches any organization names
    if (organizations && organizations.length > 0) {
      // Special handling for known variations
      const searchQuery = normalizedTranscript === 'pause' || normalizedTranscript === 'pauls' || normalizedTranscript === "paul's" 
        ? 'pawss' 
        : normalizedTranscript;
      
      const matchingOrgs = organizations.filter(org => {
        const orgName = org.organizationName.toLowerCase();
        // Check for exact match or contains
        return orgName.includes(searchQuery) || searchQuery.includes(orgName);
      });
      
      if (matchingOrgs.length > 0) {
        console.log(`Found ${matchingOrgs.length} organization(s) matching:`, normalizedTranscript);
        
        // If exactly one match, select its category and zoom to it
        if (matchingOrgs.length === 1) {
          const org = matchingOrgs[0];
          onCategorySelect(org.category as Category);
          
          // Dispatch event to zoom to organization after map loads
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('zoomToOrganization', { 
              detail: { organizationId: org.id }
            }));
          }, 500);
        } else {
          // Multiple matches - redirect to search page
          router.push(`/search?q=${encodeURIComponent(transcript)}&from=voice`);
        }
        return;
      }
    }
    
    // Check for "near me" keywords
    const nearMeKeywords = ['near me', 'nearby', 'closest', 'close to me', 'around me', 'near'];
    if (nearMeKeywords.some(keyword => normalizedTranscript.includes(keyword))) {
      console.log('Detected "near me" request, redirecting to near-me page');
      router.push('/near-me');
      return;
    }
    
    // Check for "all" or "everything"
    if (normalizedTranscript.includes('all') || normalizedTranscript.includes('everything')) {
      onCategorySelect('all');
      return;
    }
    
    // Check for specific multi-word phrases
    const specificPhrases: Record<string, Category> = {
      'mental health': 'Mental Health & Substance Use',
      'substance abuse': 'Mental Health & Substance Use',
      'substance use': 'Mental Health & Substance Use',
      'law enforcement': 'Law Enforcement',
      'legal services': 'Legal Services',
      'crisis services': 'Crisis Services',
      'food services': 'Food Services',
      'housing services': 'Housing Services',
      'healthcare services': 'Healthcare Services',
      'government services': 'Government Services',
      'tribal services': 'Tribal Services',
      'community services': 'Community Services',
      'faith based': 'Faith-Based Services',
      'faith-based': 'Faith-Based Services'
    };
    
    // Check specific phrases first
    for (const [phrase, category] of Object.entries(specificPhrases)) {
      if (normalizedTranscript.includes(phrase)) {
        onCategorySelect(category);
        return;
      }
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
    
    // If no matches found, redirect to search page with the transcript
    console.log(`No category match found for "${normalizedTranscript}", redirecting to search`);
    router.push(`/search?q=${encodeURIComponent(transcript)}&from=voice`);
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
                prompt="Try saying: organization names (like 'PAWSS'), categories ('food', 'doctor'), emotions ('I'm depressed'), or 'near me'"
              />
              
              {/* Keyword Examples */}
              <div className="mt-4 p-5 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-lg font-bold text-blue-900 mb-3">
                  🎙️ Voice Search Examples:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <span className="text-base font-medium text-blue-800">• "PAWSS"</span>
                  <span className="text-base font-medium text-blue-800">• "I need food"</span>
                  <span className="text-base font-medium text-blue-800">• "Find a doctor"</span>
                  <span className="text-base font-medium text-blue-800">• "I'm depressed"</span>
                  <span className="text-base font-medium text-blue-800">• "Housing help"</span>
                  <span className="text-base font-medium text-blue-800">• "Mental health"</span>
                  <span className="text-base font-medium text-blue-800">• "Hospital"</span>
                  <span className="text-base font-medium text-blue-800">• "Pharmacy near me"</span>
                  <span className="text-base font-medium text-blue-800">• "Crisis help"</span>
                </div>
                <p className="text-sm text-blue-700 mt-3 italic">
                  Tip: Say organization names directly or describe how you're feeling
                </p>
              </div>
              
              <p className="mt-3 text-sm text-gray-600">
                Looking for help? Return to the <Link href="/" className="text-blue-600 hover:underline">home page</Link> to use our chat assistant.
              </p>
            </div>
            
            <p className="text-lg text-gray-600">
              Select a category below to browse resources
            </p>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
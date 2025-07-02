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
    
    // First, check if the transcript matches any organization names
    if (organizations && organizations.length > 0) {
      const matchingOrgs = organizations.filter(org => 
        org.organizationName.toLowerCase().includes(normalizedTranscript) ||
        normalizedTranscript.includes(org.organizationName.toLowerCase())
      );
      
      if (matchingOrgs.length > 0) {
        console.log(`Found ${matchingOrgs.length} organization(s) matching:`, normalizedTranscript);
        router.push(`/search?q=${encodeURIComponent(transcript)}&from=voice`);
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
    
    // All other searches go to the search page
    console.log('Routing to search page with query:', transcript);
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
                prompt="Try saying: organization names (like 'PAWSS'), service types ('food', 'doctor'), or 'near me'"
              />
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
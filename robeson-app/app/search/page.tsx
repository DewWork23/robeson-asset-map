'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Organization, CATEGORY_COLORS, CATEGORY_ICONS } from '@/types/organization';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { categoryToSlug } from '@/utils/categoryUtils';
import FeedbackBanner from '@/components/FeedbackBanner';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { organizations, loading } = useOrganizations();
  const [searchResults, setSearchResults] = useState<Organization[]>([]);
  const [directMatchIds, setDirectMatchIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceSearch, setIsVoiceSearch] = useState(false);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    const fromVoice = searchParams.get('from') === 'voice';
    
    setSearchQuery(query);
    setIsVoiceSearch(fromVoice);

    if (query && organizations.length > 0) {
      // Search organizations by name, services, and description
      const normalizedQuery = query.toLowerCase().trim();
      
      // Define category keywords mapping
      const categoryKeywords: Record<string, string[]> = {
        'Crisis Services': ['crisis', 'emergency', 'help', '911', 'suicide', 'danger', 'urgent', 'immediate', 'depressed', 'suicidal', 'kill myself', 'want to die', 'need help now', 'anxious', 'panic', 'panic attack', 'scared', 'overwhelmed'],
        'Food Services': ['food', 'hungry', 'meal', 'eat', 'pantry', 'breakfast', 'lunch', 'dinner', 'nutrition', 'groceries', "i'm hungry", 'starving'],
        'Housing Services': ['housing', 'shelter', 'home', 'homeless', 'rent', 'apartment', 'eviction', 'utilities', "i'm homeless", 'place to stay', 'nowhere to go'],
        'Healthcare Services': ['health', 'doctor', 'medical', 'hospital', 'clinic', 'sick', 'pain', 'nurse', 'urgent care', "i'm sick", 'hurt', 'injured', 'healthcare', 'physician'],
        'Healthcare/Medical': ['health', 'doctor', 'medical', 'hospital', 'clinic', 'sick', 'pain', 'nurse', 'urgent care', "i'm sick", 'hurt', 'injured', 'healthcare', 'physician'],
        'Healthcare/Treatment': ['health', 'doctor', 'medical', 'treatment', 'therapy', 'clinic', 'care'],
        'Healthcare/Public Health': ['health', 'doctor', 'medical', 'public health', 'wellness', 'prevention'],
        'Mental Health': ['mental', 'counseling', 'therapy', 'psychology', 'psychiatry', 'behavioral'],
        'Mental Health & Substance Use': ['mental', 'counseling', 'therapy', 'addiction', 'substance', 'depression', 'depressed', 'anxiety', 'anxious', 'sad', 'worried', 'stress', 'stressed', 'drugs', 'alcohol', 'recovery', "i'm depressed", "im depressed", "i am depressed", "feeling depressed", "i'm sad", "im sad", "i'm anxious", "im anxious", "i'm stressed", "im stressed", "feel depressed", "feeling sad", "feeling anxious", "feeling stressed", "need help", "suicide", "suicidal", "kill myself", "want to die", "i'm feeling anxious", "i am anxious", "panic", "panic attack", "scared", "i'm scared", "fearful", "overwhelmed", "i'm overwhelmed"],
        'Government Services': ['government', 'benefits', 'assistance', 'social services', 'welfare', 'medicaid', 'medicare', 'snap'],
        'Tribal Services': ['tribal', 'lumbee', 'native', 'indian', 'indigenous'],
        'Community Services': ['community', 'support', 'volunteer', 'help', 'services', 'pawss', 'paws'],
        'Community Groups & Development': ['group', 'development', 'organization', 'nonprofit', 'charity'],
        'Faith-Based Services': ['faith', 'church', 'religious', 'prayer', 'spiritual', 'ministry', 'worship', 'god'],
        'Legal Services': ['legal', 'lawyer', 'attorney', 'court', 'justice', 'rights', 'lawsuit', 'divorce'],
        'Law Enforcement': ['police', 'sheriff', 'law', 'crime', 'safety', 'report', 'officer'],
        'Education': ['education', 'school', 'learning', 'library', 'study', 'class', 'training', 'ged', 'college'],
        'Pharmacy': ['pharmacy', 'medicine', 'prescription', 'drug', 'medication', 'pills', 'rx'],
        'Cultural & Information Services': ['cultural', 'information', 'culture', 'arts', 'museum', 'history', 'heritage']
      };
      
      // First, check if query matches any category keywords
      let matchedCategories: string[] = [];
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        const hasMatch = keywords.some(keyword => {
          // Exact match or query contains keyword
          if (normalizedQuery.includes(keyword)) return true;
          
          // Keyword contains query (for single words)
          if (keyword.includes(normalizedQuery) && normalizedQuery.split(' ').length === 1) return true;
          
          // Special handling for mental health phrases
          if (category === 'Mental Health & Substance Use' || category === 'Crisis Services') {
            // Check for key mental health terms within the query
            const mentalHealthTerms = ['depressed', 'sad', 'anxious', 'stressed', 'worried', 'anxiety', 'depression', 'mental', 'suicide', 'help', 'panic', 'scared', 'fear', 'overwhelmed'];
            return mentalHealthTerms.some(term => normalizedQuery.includes(term));
          }
          
          return false;
        });
        
        if (hasMatch) {
          matchedCategories.push(category);
        }
      }
      
      // Helper function for fuzzy matching - only for specific known variations
      const fuzzyMatch = (str1: string, str2: string): boolean => {
        const clean1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
        const clean2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Only match specific known variations, not partial matches
        const soundsLike: Record<string, string[]> = {
          'pause': ['pawss', 'paws'],
          'pawss': ['pause', 'paws'],
          'paws': ['pause', 'pawss'],
        };
        
        // Check if the search term matches any known variations
        return soundsLike[clean2]?.some(variant => clean1.includes(variant)) || false;
      };
      
      // Find direct matches in organization names, services, and descriptions
      const directMatches = organizations.filter(org => {
        const orgName = org.organizationName.toLowerCase();
        const searchableText = `${org.organizationName} ${org.servicesOffered || ''} ${org.description || ''}`.toLowerCase();
        
        // Special handling for known organizations
        if (normalizedQuery === 'pause' && orgName.includes('pawss')) {
          console.log('Found PAWSS for pause query');
          return true;
        }
        
        // For short queries, only match whole words to avoid false positives
        let textMatch = false;
        
        // Always use word boundary matching for single-word queries to avoid partial matches
        const isSingleWord = !normalizedQuery.includes(' ');
        
        if (isSingleWord && normalizedQuery.length <= 10) {
          // For single words like "pause" or "doctor", match whole words only
          const wordBoundaryRegex = new RegExp(`\\b${normalizedQuery}\\b`, 'i');
          textMatch = wordBoundaryRegex.test(orgName) || 
                     wordBoundaryRegex.test(searchableText) ||
                     fuzzyMatch(orgName, normalizedQuery);
        } else {
          // For longer queries or phrases, use contains matching
          textMatch = orgName.includes(normalizedQuery) || 
                     searchableText.includes(normalizedQuery);
        }
        
        // Only return true if we have an actual text match
        return textMatch;
      });

      let allResults = [...directMatches];
      
      // If we have category keyword matches, always include them
      // This ensures searches like "doctor" show healthcare organizations
      if (matchedCategories.length > 0) {
        // Include organizations from matched categories
        const categoryMatches = organizations.filter(org => {
          // Check if organization is in a matched category
          if (matchedCategories.includes(org.category)) return true;
          
          // Also check for healthcare organizations that might be miscategorized
          // (e.g., hospitals categorized as "Crisis Services")
          if (normalizedQuery === 'doctor' || normalizedQuery === 'medical' || normalizedQuery === 'healthcare' || normalizedQuery === 'physician') {
            const servicesText = (org.servicesOffered || '').toLowerCase();
            const descText = (org.description || '').toLowerCase();
            const orgName = org.organizationName.toLowerCase();
            
            // More specific medical provider detection
            const isMedicalProvider = 
              // Direct medical facilities
              orgName.includes('hospital') ||
              orgName.includes('clinic') ||
              orgName.includes('health center') ||
              orgName.includes('medical') ||
              orgName.includes('physician') ||
              orgName.includes('doctor') ||
              orgName.includes('practice') ||
              // Service descriptions
              servicesText.includes('primary care') ||
              servicesText.includes('medical care') ||
              servicesText.includes('medical services') ||
              servicesText.includes('acute care') ||
              servicesText.includes('urgent care') ||
              servicesText.includes('emergency care') ||
              servicesText.includes('physician') ||
              servicesText.includes('diagnosis') ||
              servicesText.includes('treatment') && servicesText.includes('medical') ||
              descText.includes('healthcare system') ||
              descText.includes('medical services') ||
              descText.includes('hospital');
            
            return isMedicalProvider;
          }
          
          return false;
        });
        
        // Combine direct matches with category matches, removing duplicates
        const allMatchIds = new Set([...directMatches.map(o => o.id), ...categoryMatches.map(o => o.id)]);
        allResults = organizations.filter(org => allMatchIds.has(org.id));
        
        // Ensure direct matches are tracked for sorting
        setDirectMatchIds(new Set(directMatches.map(org => org.id)));
        
        console.log(`Search for "${normalizedQuery}" found ${directMatches.length} direct matches and ${categoryMatches.length} category matches`);
      } else if (directMatches.length > 0) {
        // For searches with actual text matches, show similar organizations
        const matchedCats = [...new Set(directMatches.map(org => org.category))];
        
        // Find similar organizations in the same categories
        const similarOrgs = organizations.filter(org => {
          // Don't include if already in direct matches
          if (directMatches.some(match => match.id === org.id)) return false;
          
          // Include if in same category
          return matchedCats.includes(org.category);
        });
        
        // Add up to 10 similar organizations for text searches
        allResults = [...directMatches, ...similarOrgs.slice(0, 10)];
      }

      // Sort results by relevance
      allResults.sort((a, b) => {
        const aIsDirectMatch = directMatches.some(match => match.id === a.id);
        const bIsDirectMatch = directMatches.some(match => match.id === b.id);
        
        // For medical searches, always prioritize actual medical providers
        if (normalizedQuery === 'doctor' || normalizedQuery === 'medical' || normalizedQuery === 'physician' || normalizedQuery === 'healthcare') {
          const aName = a.organizationName.toLowerCase();
          const bName = b.organizationName.toLowerCase();
          const aServices = (a.servicesOffered || '').toLowerCase();
          const bServices = (b.servicesOffered || '').toLowerCase();
          const aCategory = a.category.toLowerCase();
          const bCategory = b.category.toLowerCase();
          
          // Calculate medical relevance scores
          const getMedicalScore = (name: string, services: string, category: string, isDirectMatch: boolean) => {
            let score = 0;
            
            // Direct text matches get a small boost, but not overwhelming
            if (isDirectMatch) score += 2;
            
            // Highest priority - actual medical facilities
            if (name.includes('hospital')) score += 20;
            if (name.includes('health') && name.includes('practice')) score += 20;
            if (name.includes('clinic') && !name.includes('behavioral')) score += 18;
            if (name.includes('medical') && name.includes('center')) score += 18;
            if (category === 'healthcare services') score += 15;
            
            // High priority medical services
            if (services.includes('primary care')) score += 15;
            if (services.includes('urgent care')) score += 15;
            if (services.includes('emergency care')) score += 14;
            if (services.includes('medical services')) score += 12;
            if (services.includes('acute care')) score += 12;
            
            // Medium priority - related medical
            if (name.includes('pharmacy')) score += 5;
            if (name.includes('behavioral') && name.includes('healthcare')) score += 4;
            if (name.includes('mental') && services.includes('medical')) score += 4;
            
            // Heavily deprioritize non-medical services
            if (name.includes('support group') || name.includes('support groups')) score -= 20;
            if (services.includes('support group') || services.includes('support for')) score -= 15;
            if (name.includes('caregiver') && name.includes('support')) score -= 20;
            if (name.includes('job seeker')) score -= 30;
            if (name.includes('sorority') || name.includes('fraternity')) score -= 30;
            if (name.includes('foundation') && !services.includes('medical')) score -= 25;
            if (name.includes('college') && !name.includes('medical')) score -= 25;
            if (name.includes('chapter') || name.includes('alumnae')) score -= 30;
            if (category === 'community services' && !services.includes('medical')) score -= 10;
            if (category === 'education' && !services.includes('medical')) score -= 20;
            
            return score;
          };
          
          const aScore = getMedicalScore(aName, aServices, aCategory, aIsDirectMatch);
          const bScore = getMedicalScore(bName, bServices, bCategory, bIsDirectMatch);
          
          // Always sort by medical score for medical searches
          if (aScore !== bScore) return bScore - aScore;
        } else if (normalizedQuery.includes('depressed') || normalizedQuery.includes('sad') || 
                   normalizedQuery.includes('anxious') || normalizedQuery.includes('mental') ||
                   normalizedQuery.includes('suicide') || normalizedQuery.includes('stressed')) {
          // For mental health searches, prioritize mental health services
          const getMentalHealthScore = (org: Organization) => {
            let score = 0;
            const name = org.organizationName.toLowerCase();
            const services = (org.servicesOffered || '').toLowerCase();
            const category = org.category.toLowerCase();
            
            // Highest priority - suicide/crisis hotlines
            if (name.includes('suicide prevention') || name.includes('988')) score += 100;
            if (name.includes('crisis') && (name.includes('hotline') || name.includes('text'))) score += 90;
            
            // High priority - mental health specific services
            if (name.includes('mental health') || name.includes('behavioral health')) score += 50;
            if (name.includes('counseling') || name.includes('therapy')) score += 45;
            if (name.includes('psychiatric') || name.includes('psychiatry')) score += 45;
            if (services.includes('mental health treatment')) score += 40;
            if (services.includes('depression') || services.includes('anxiety')) score += 40;
            if (name.includes('carter clinic')) score += 40; // Known mental health provider
            
            // Medium priority - integrated care with mental health
            if (name.includes('integrated care') && services.includes('mental')) score += 30;
            if (services.includes('therapy') || services.includes('counseling')) score += 25;
            if (services.includes('behavioral health')) score += 25;
            
            // Lower priority - general crisis services
            if (category === 'crisis services' && !services.includes('mental')) score += 10;
            
            // Deprioritize unrelated services
            if (name.includes('domestic violence') && !normalizedQuery.includes('domestic')) score -= 50;
            if (name.includes('sexual assault') && !normalizedQuery.includes('sexual')) score -= 50;
            if (name.includes('district attorney') || name.includes('court')) score -= 40;
            if (name.includes('substance') && !normalizedQuery.includes('substance') && !normalizedQuery.includes('drug')) score -= 20;
            if (name.includes('disaster') || name.includes('hurricane')) score -= 30;
            if (name.includes('harm reduction') && !services.includes('mental')) score -= 25;
            
            return score;
          };
          
          const aScore = getMentalHealthScore(a);
          const bScore = getMentalHealthScore(b);
          
          if (aScore !== bScore) return bScore - aScore;
        } else {
          // For non-medical searches, direct matches first
          if (aIsDirectMatch && !bIsDirectMatch) return -1;
          if (!aIsDirectMatch && bIsDirectMatch) return 1;
        }
        
        // Within same priority, name matches first
        const aNameMatch = a.organizationName.toLowerCase().includes(normalizedQuery);
        const bNameMatch = b.organizationName.toLowerCase().includes(normalizedQuery);
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        
        return 0;
      });

      setSearchResults(allResults);
      // directMatchIds already set above when we have category matches
    }
  }, [searchParams, organizations]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-24 bg-gray-200 rounded-lg w-96"></div>
            <div className="h-24 bg-gray-200 rounded-lg w-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isVoiceSearch ? 'Voice Search Results' : 'Search Results'}
          </h1>
          <p className="text-lg text-gray-600">
            {searchResults.length > 0 
              ? (
                <>
                  {directMatchIds.size > 0 ? (
                    <>
                      Found {directMatchIds.size} direct match{directMatchIds.size !== 1 ? 'es' : ''} for "{searchQuery}"
                      {searchResults.length > directMatchIds.size && (
                        <span className="text-sm"> (showing {searchResults.length - directMatchIds.size} related resources too)</span>
                      )}
                    </>
                  ) : (
                    <>Found {searchResults.length} resource{searchResults.length !== 1 ? 's' : ''} related to "{searchQuery}"</>
                  )}
                </>
              )
              : `No results found for "${searchQuery}"`
            }
          </p>
        </div>

        {searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((org, index) => {
              const isDirectMatch = directMatchIds.has(org.id);
              const prevIsDirectMatch = index > 0 ? directMatchIds.has(searchResults[index - 1].id) : true;
              const showSimilarDivider = !isDirectMatch && prevIsDirectMatch && directMatchIds.size > 0;
              
              return (
                <div key={org.id}>
                  {showSimilarDivider && (
                    <div className="my-8 relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-gray-50 text-gray-500 font-medium">Related resources</span>
                      </div>
                    </div>
                  )}
                  <div
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 mb-1">
                          {org.organizationName}
                        </h2>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-xl">{CATEGORY_ICONS[org.category as keyof typeof CATEGORY_ICONS] || '📍'}</span>
                          <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${CATEGORY_COLORS[org.category as keyof typeof CATEGORY_COLORS] || 'bg-gray-500'}`}>
                            {org.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{org.address}</span>
                  </p>
                  {org.phone && (
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${org.phone.replace(/\D/g, '')}`} className="text-blue-600 hover:underline">
                        {org.phone}
                      </a>
                    </p>
                  )}
                  {org.servicesOffered && (
                    <p className="mt-2">
                      <strong>Services:</strong> {org.servicesOffered.substring(0, 150)}
                      {org.servicesOffered.length > 150 && '...'}
                    </p>
                  )}
                    </div>

                    <div className="flex gap-3">
                  <Link
                    href={`/category/${categoryToSlug(org.category)}?org=${org.id}`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    View on Map
                  </Link>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(org.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-center"
                  >
                    Directions
                  </a>
                  {org.phone && (
                    <a
                      href={`tel:${org.phone.replace(/\D/g, '')}`}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-center"
                    >
                      Call Now
                    </a>
                  )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No results found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find any organizations matching "{searchQuery}". Try searching for a different term or browse by category.
            </p>
            <div className="space-y-3">
              <Link
                href="/categories"
                className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Browse by Category
              </Link>
              <Link
                href="/"
                className="block w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* Voice search tip */}
        {isVoiceSearch && searchResults.length === 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Try saying the organization name more clearly, or search by the type of service you need 
              (like "food", "healthcare", or "housing").
            </p>
          </div>
        )}
        
        {/* Back button at bottom */}
        {searchResults.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>
        )}
      </div>
      
      {/* Feedback Banner */}
      <FeedbackBanner />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-24 bg-gray-200 rounded-lg w-96"></div>
            <div className="h-24 bg-gray-200 rounded-lg w-96"></div>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
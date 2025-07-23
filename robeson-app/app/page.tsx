'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CATEGORY_ICONS } from '@/types/organization';
import { filterOrganizations } from '@/lib/googleSheetsParser';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import ManifestLink from '@/components/ManifestLink';
import ChatBot from '@/components/ChatBot';
import { categoryToSlug } from '@/utils/categoryUtils';
import { CONSOLIDATED_CATEGORIES } from '@/utils/categoryConsolidation';
import FeedbackBanner from '@/components/FeedbackBanner';
import SpeechButton from '@/components/SpeechButton';
import { useOrganizations } from '@/contexts/OrganizationsContext';

export default function Home() {
  const router = useRouter();
  const { organizations, loading } = useOrganizations();
  const [chatOpen, setChatOpen] = useState(false);

  const handleNearMe = () => {
    router.push('/near-me');
  };

  const handleSpeechResult = (transcript: string) => {
    // Try to match the transcript to a category
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    console.log('Voice search transcript:', transcript);
    console.log('Normalized transcript:', normalizedTranscript);
    
    // Check for organization acronyms/aliases
    const organizationAliases: { [key: string]: string } = {
      'rhcc': 'Robeson Health Care Corporation',
      'r h c c': 'Robeson Health Care Corporation',
      'r.h.c.c': 'Robeson Health Care Corporation',
      'r.h.c.c.': 'Robeson Health Care Corporation'
    };
    
    // Check if transcript matches any alias
    const aliasMatch = organizationAliases[normalizedTranscript];
    if (aliasMatch) {
      console.log(`Found alias match: ${normalizedTranscript} -> ${aliasMatch}`);
      router.push(`/search?q=${encodeURIComponent(aliasMatch)}&from=voice`);
      return;
    }
    
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
    
    // Check for "near me" keywords first
    const nearMeKeywords = ['near me', 'nearby', 'closest', 'close to me', 'around me', 'near'];
    if (nearMeKeywords.some(keyword => normalizedTranscript.includes(keyword))) {
      console.log('Detected "near me" request, redirecting to near-me page');
      router.push('/near-me');
      return;
    }
    
    // All other searches go to the search page
    console.log('Routing to search page with query:', transcript);
    router.push(`/search?q=${encodeURIComponent(transcript)}&from=voice`);
  };


  // Get categories with counts
  const categoriesWithCounts = CONSOLIDATED_CATEGORIES.map(categoryName => {
    const count = categoryName === 'Crisis Services' 
      ? organizations.filter(org => org.crisisService).length
      : filterOrganizations(organizations, categoryName).length;
    
    return {
      name: categoryName,
      count
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ServiceWorkerRegistration />
      <ManifestLink />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-3 leading-tight pb-1">
              Robeson County Community Resources
            </h1>
            <p className="text-xl text-gray-700 mb-2">
              Your comprehensive guide to local services and support
            </p>
            <p className="text-lg font-medium text-gray-700 mb-4">
              <span className="text-blue-600">You're not alone.</span>{' '}
              <span className="text-green-600">Help is here.</span>{' '}
              <span className="text-purple-600">Take your first step today.</span>
            </p>
            <div className="bg-red-700 text-white px-6 py-4 rounded-lg inline-block">
              <p className="text-lg font-semibold mb-3">
                ⚠️ In case of emergency
              </p>
              <div className="flex gap-3 justify-center">
                <a
                  href="tel:911"
                  className="bg-white text-red-700 px-4 py-2 rounded-md font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call 911
                </a>
                <a
                  href="sms:988"
                  className="bg-white text-red-700 px-4 py-2 rounded-md font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Text 988
                </a>
              </div>
              <p className="text-xs mt-2 text-center">
                Mental health crisis support available 24/7
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">

        {loading ? (
          <div className="space-y-4">
            {/* Loading skeleton for categories */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1" />
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1 flex justify-end">
                  <div className="flex gap-2">
                    <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded" />
                      <div>
                        <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Voice Search - Prominent Position */}
            <div className="mb-8 text-center">
              <SpeechButton 
                onSpeechResult={handleSpeechResult}
                prompt="Try saying: organization names (like 'PAWSS'), service types ('food', 'doctor'), or 'near me'"
              />
              <button
                onClick={() => setChatOpen(true)}
                className="mt-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg shadow-xl px-4 py-2 text-sm font-semibold border border-blue-700 hover:scale-105 transition-transform"
              >
                Need help finding something? 💬
              </button>
              <button
                onClick={handleNearMe}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
                aria-label="Find resources near me"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Near Me</span>
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 text-center mb-4">Or Select a Category Below</h2>
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                {categoriesWithCounts.map((category) => {
                  const icon = CATEGORY_ICONS[category.name] || '📍';
                  const slug = categoryToSlug(category.name);
                  
                  return (
                    <Link
                      key={category.name}
                      href={`/category/${slug}`}
                      className={`relative block p-5 rounded-lg shadow-sm hover:shadow-2xl transition-all duration-200 transform hover:scale-110 border-2 text-left ${
                        category.name === 'Crisis Services' 
                          ? 'bg-red-100 border-red-300 hover:bg-red-200 hover:border-red-500 ring-1 ring-red-300 hover:ring-2' 
                          : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-500 hover:ring-2 hover:ring-blue-400 hover:ring-offset-2'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{icon}</span>
                        <div>
                          <p className={`font-semibold text-lg ${category.name === 'Crisis Services' ? 'text-red-900' : 'text-gray-900'}`}>
                            {category.name}
                          </p>
                          <p className={`text-base ${category.name === 'Crisis Services' ? 'text-red-700' : 'text-gray-600'}`}>
                            {category.count} resources{category.name === 'Crisis Services' ? ' • Immediate help' : ''}
                          </p>
                        </div>
                      </div>
                      {category.name === 'Crisis Services' && (
                        <span className="absolute -top-2 -right-2 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                        </span>
                      )}
                    </Link>
                  );
                })}
                <Link
                  href="/category/all"
                  className="block p-5 bg-blue-50 rounded-lg shadow-sm hover:shadow-2xl transition-all duration-200 transform hover:scale-110 border-2 border-blue-200 hover:bg-blue-100 hover:border-blue-500 hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">🏢</span>
                    <div>
                      <p className="font-semibold text-lg text-blue-900">All Resources</p>
                      <p className="text-base text-blue-600">{organizations.length} total</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
      
      {/* Footer with feedback link */}
      <FeedbackBanner />
      
      {/* Floating Chat Button */}
      <ChatBot 
        organizations={organizations} 
        isOpen={chatOpen}
        onOpenChange={setChatOpen}
        hideFloatingHelpButton={true}
      />
    </div>
  );
}
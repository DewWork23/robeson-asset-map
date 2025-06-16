'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Organization, CATEGORY_ICONS } from '@/types/organization';
import { loadOrganizationsFromGoogleSheets, filterOrganizations } from '@/lib/googleSheetsParser';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import ManifestLink from '@/components/ManifestLink';
import ChatBot from '@/components/ChatBot';
import { categoryToSlug } from '@/utils/categoryUtils';
import CrisisBanner from '@/components/CrisisBanner';
import { CONSOLIDATED_CATEGORIES } from '@/utils/categoryConsolidation';

export default function Home() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const handleNearMe = () => {
    router.push('/near-me');
  };

  useEffect(() => {
    async function loadData() {
      try {
        const startTime = Date.now();
        
        const orgs = await loadOrganizationsFromGoogleSheets();
        
        // Ensure minimum loading time for smooth transition
        const loadTime = Date.now() - startTime;
        const minLoadTime = 300; // 300ms minimum
        
        if (loadTime < minLoadTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadTime - loadTime));
        }
        
        setOrganizations(orgs);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load organizations:', error);
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-3">
              Robeson County Community Resources
            </h1>
            <p className="text-xl text-gray-700 mb-2">
              Your comprehensive guide to local services and support
            </p>
            <p className="text-lg text-gray-600 mb-4">
              You're not alone. Help is here. Take your first step today.
            </p>
            <div className="bg-red-700 text-white px-6 py-3 rounded-lg inline-block">
              <p className="text-lg font-semibold">
                ⚠️ In case of emergency, call 911
              </p>
              <p className="text-sm mt-1">
                For mental health crisis, call or text 988
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <CrisisBanner organizations={organizations.filter(org => org.crisisService)} />

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
            {/* Categories */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1" />
                <h2 className="text-lg font-semibold text-gray-900">Select a Category</h2>
                <div className="flex-1 flex justify-end">
                  <div className="flex gap-2">
                    <button
                      onClick={handleNearMe}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
                      aria-label="Find resources near me"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Near Me</span>
                    </button>
                    <Link
                      href="/map"
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-400 hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    >
                      <span>🗺️</span> Map View
                    </Link>
                  </div>
                </div>
              </div>
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
      <footer className="bg-gray-100 border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Found incorrect information or missing resources?
          </h3>
          <p className="text-gray-600 mb-4">
            Help us improve this guide by reporting errors, suggesting new resources, or sharing feedback.<br />
            Contact Jordan Dew, Social Research Specialist, UNCP SPARC
          </p>
          <a
            href="mailto:jordan.dew@uncp.edu?subject=Robeson County Community Resources - Feedback"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 hover:shadow-xl hover:scale-110 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Report Feedback</span>
          </a>
        </div>
      </footer>
      
      {/* Floating Chat Button */}
      <ChatBot organizations={organizations} />
    </div>
  );
}
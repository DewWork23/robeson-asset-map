'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Organization } from '@/types/organization';
import { loadOrganizationsFromGoogleSheets } from '@/lib/googleSheetsParser';
import OrganizationMap from '@/components/OrganizationMap';
import { categoryToSlug } from '@/utils/categoryUtils';
import FeedbackBanner from '@/components/FeedbackBanner';

export default function MapPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const orgs = await loadOrganizationsFromGoogleSheets();
        setOrganizations(orgs);
        setLoading(false);
      } catch (error) {
        console.error('Error loading organizations:', error);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 w-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all"
            aria-label="Go back to all categories"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Categories</span>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            All Resources Map View
          </h1>
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <OrganizationMap 
          organizations={organizations}
          allOrganizations={organizations}
          selectedCategory={null}
          onCategorySelect={(cat) => {
            router.push(cat === null ? '/' : `/category/${categoryToSlug(cat)}`);
          }}
          onOrganizationClick={(org) => {
            console.log('Organization clicked:', org);
          }}
        />
      </div>
    </div>
  );
}
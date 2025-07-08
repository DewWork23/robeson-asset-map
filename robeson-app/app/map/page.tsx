'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Organization, CATEGORY_ICONS, Category } from '@/types/organization';
import { filterOrganizations } from '@/lib/googleSheetsParser';
import OrganizationMap from '@/components/OrganizationMap';
import CategorySelectionPrompt from '@/components/CategorySelectionPrompt';
import MapSidebar from '@/components/MapSidebar';
import MobileOrganizationDetail from '@/components/MobileOrganizationDetail';
import MobileMapGuide from '@/components/MobileMapGuide';
import { categoryToSlug } from '@/utils/categoryUtils';
import { calculateDistance, getCoordinatesFromAddress } from '@/lib/locationUtils';
import { useOrganizations } from '@/contexts/OrganizationsContext';

function MapPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { organizations, loading } = useOrganizations();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(true);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [initialOrgHandled, setInitialOrgHandled] = useState(false);

  // Set sidebar open on desktop by default and check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);


  // Handle custom event for showing organization details on mobile
  useEffect(() => {
    const handleShowDetails = (event: any) => {
      const orgId = event.detail;
      const org = organizations.find(o => o.id === orgId);
      if (org) {
        setSelectedOrganization(org);
        setShowMobileDetail(true);
      }
    };

    window.addEventListener('showOrgDetails', handleShowDetails);
    return () => {
      window.removeEventListener('showOrgDetails', handleShowDetails);
    };
  }, [organizations]);

  // Handle organization parameter from URL
  useEffect(() => {
    if (!initialOrgHandled && organizations.length > 0) {
      const orgId = searchParams.get('org');
      if (orgId) {
        const org = organizations.find(o => o.id === orgId);
        if (org) {
          console.log('Found organization from URL:', org.organizationName);
          setSelectedOrganization(org);
          setSelectedCategory(org.category);
          setShowPrompt(false);
          setSidebarOpen(true);
          setInitialOrgHandled(true);
        }
      }
    }
  }, [searchParams, organizations, initialOrgHandled]);

  // Get user location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location permission denied or error:', error);
        }
      );
    }
  }, []);

  // Calculate distance for selected organization
  useEffect(() => {
    if (selectedOrganization && userLocation) {
      const coords = getCoordinatesFromAddress(selectedOrganization.address);
      if (coords) {
        selectedOrganization.distance = calculateDistance(
          userLocation.lat,
          userLocation.lon,
          coords.lat,
          coords.lon
        );
      }
    }
  }, [selectedOrganization, userLocation]);


  const handleCategorySelect = (category: Category | 'all') => {
    if (category === 'all') {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
    setShowPrompt(false);
  };

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

  if (showPrompt) {
    return <CategorySelectionPrompt onCategorySelect={handleCategorySelect} />;
  }

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm z-10 flex-shrink-0">
        <div className="px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setShowPrompt(true);
                setSelectedCategory(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all text-sm sm:text-base flex-shrink-0"
              aria-label="Go back to category selection"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Change Category</span>
              <span className="sm:hidden">Back</span>
            </button>
            <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 text-center px-2">
              {selectedCategory ? `${selectedCategory} Resources` : 'All Resources Map'}
            </h1>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-all text-sm sm:text-base flex-shrink-0"
              aria-label="Go to home page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Map and sidebar container */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar */}
        <MapSidebar
          organizations={selectedCategory 
            ? filterOrganizations(organizations, selectedCategory)
            : organizations
          }
          allOrganizations={organizations}
          selectedOrganization={selectedOrganization}
          selectedCategory={selectedCategory}
          onOrganizationClick={(org) => {
            console.log('Sidebar received organization click:', {
              id: org.id,
              name: org.organizationName,
              category: org.category,
              crisisService: org.crisisService,
              currentSelected: selectedOrganization?.id
            });
            setSelectedOrganization(org);
            // Force sidebar to stay open on desktop when selecting
            if (window.innerWidth >= 1024) {
              setSidebarOpen(true);
            }
          }}
          onCategoryChange={(category) => {
            setSelectedCategory(category);
          }}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {/* Map container */}
        <div className="flex-1 relative">
          <OrganizationMap 
            organizations={(() => {
              const filtered = selectedCategory 
                ? filterOrganizations(organizations, selectedCategory)
                : organizations;
              
              // Debug log to check crisis service organizations
              const crisisOrgs = filtered.filter(org => org.crisisService);
              if (crisisOrgs.length > 0) {
                console.log(`Filtered organizations include ${crisisOrgs.length} crisis service orgs in category: ${selectedCategory || 'All'}`);
              }
              
              return filtered;
            })()}
            allOrganizations={organizations}
            selectedCategory={selectedCategory}
            selectedOrganization={selectedOrganization}
            onCategorySelect={(cat) => {
              setSelectedCategory(cat);
            }}
            onOrganizationClick={(org) => {
              console.log('Map page received organization click:', {
                id: org.id,
                name: org.organizationName,
                category: org.category,
                crisisService: org.crisisService,
                selectedCategory: selectedCategory
              });
              setSelectedOrganization(org);
              // Ensure sidebar opens on mobile when selecting from map
              if (window.innerWidth < 768) {
                setSidebarOpen(true);
              }
            }}
          />
          
          {/* Mobile help text when sidebar is closed */}
          {!sidebarOpen && (
            <div className="lg:hidden absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md border border-gray-200">
              <p className="text-sm text-gray-700 text-center">
                <span className="font-medium">Tap markers on the map</span> to see details, or use the 
                <span className="font-medium text-blue-600"> "View List" </span> 
                button to browse all resources
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Organization Detail View */}
      {isMobile && (
        <MobileOrganizationDetail
          organization={showMobileDetail ? selectedOrganization : null}
          onClose={() => setShowMobileDetail(false)}
          userLocation={userLocation}
        />
      )}
      
      {/* Mobile Map Guide for first-time users */}
      <MobileMapGuide />
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 w-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    }>
      <MapPageContent />
    </Suspense>
  );
}
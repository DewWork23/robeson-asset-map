'use client';

import { useState, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import { Provider, InsuranceType, Specialty, SPECIALTY_ICONS } from '@/types/provider';
import { sampleProviders } from '@/lib/sampleProviderData';

export default function ProvidersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedInsurance, setSelectedInsurance] = useState<string>('all');
  const [showTelehealth, setShowTelehealth] = useState(false);
  const [showAcceptingNew, setShowAcceptingNew] = useState(false);
  const [showSlidingScale, setShowSlidingScale] = useState(false);

  // Get unique values for filters
  const specialties = useMemo(() => {
    const specs = new Set<string>();
    sampleProviders.forEach(provider => {
      provider.specialties.forEach(spec => specs.add(spec));
    });
    return Array.from(specs).sort();
  }, []);

  const insuranceTypes = useMemo(() => {
    const types = new Set<string>();
    sampleProviders.forEach(provider => {
      provider.insuranceAccepted.forEach(ins => types.add(ins));
    });
    return Array.from(types).sort();
  }, []);

  // Filter providers based on search and filters
  const filteredProviders = useMemo(() => {
    return sampleProviders.filter(provider => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          provider.name.toLowerCase().includes(query) ||
          provider.organization.toLowerCase().includes(query) ||
          provider.specialties.some(s => s.toLowerCase().includes(query)) ||
          provider.servicesProvided.some(s => s.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // Specialty filter
      if (selectedSpecialty !== 'all' && !provider.specialties.includes(selectedSpecialty)) {
        return false;
      }

      // Insurance filter
      if (selectedInsurance !== 'all' && !provider.insuranceAccepted.includes(selectedInsurance)) {
        return false;
      }

      // Additional filters
      if (showTelehealth && !provider.telehealth) return false;
      if (showAcceptingNew && !provider.acceptingNewPatients) return false;
      if (showSlidingScale && !provider.slidingScale) return false;

      return true;
    });
  }, [searchQuery, selectedSpecialty, selectedInsurance, showTelehealth, showAcceptingNew, showSlidingScale]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="pt-20 pb-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Find a Provider
              <span className="ml-3 text-sm bg-yellow-400 text-black px-3 py-1 rounded-full font-normal">BETA</span>
            </h1>
            <p className="text-xl text-gray-600">
              Browse local healthcare providers by specialty, insurance, and services
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">Beta Feature - Sample Data Only</p>
              <p className="text-sm text-yellow-700 mt-1">
                The provider names, phone numbers, and other details shown on this page are fictitious and for demonstration purposes only. 
                This feature is currently in beta development.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          {/* Search Bar */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search providers
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, organization, or service..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Specialty Filter */}
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
                Specialty
              </label>
              <select
                id="specialty"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Specialties</option>
                {specialties.map(spec => (
                  <option key={spec} value={spec}>
                    {SPECIALTY_ICONS[spec] || '⚕️'} {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Insurance Filter */}
            <div>
              <label htmlFor="insurance" className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Accepted
              </label>
              <select
                id="insurance"
                value={selectedInsurance}
                onChange={(e) => setSelectedInsurance(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Insurance Types</option>
                {insuranceTypes.map(ins => (
                  <option key={ins} value={ins}>{ins}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showAcceptingNew}
                onChange={(e) => setShowAcceptingNew(e.target.checked)}
                className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Accepting New Patients</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showTelehealth}
                onChange={(e) => setShowTelehealth(e.target.checked)}
                className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Offers Telehealth</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showSlidingScale}
                onChange={(e) => setShowSlidingScale(e.target.checked)}
                className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Sliding Scale Fees</span>
            </label>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-6 mb-4">
          <p className="text-gray-600">
            Found <span className="font-semibold">{filteredProviders.length}</span> provider{filteredProviders.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Provider Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProviders.map(provider => (
            <div key={provider.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              {/* Provider Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {provider.name}, {provider.title}
                </h3>
                <p className="text-gray-600">{provider.organization}</p>
              </div>

              {/* Specialties */}
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Specialties:</p>
                <div className="flex flex-wrap gap-1">
                  {provider.specialties.map(spec => (
                    <span key={spec} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {SPECIALTY_ICONS[spec] || '⚕️'} {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Insurance */}
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Insurance:</p>
                <p className="text-sm text-gray-600">
                  {provider.insuranceAccepted.slice(0, 3).join(', ')}
                  {provider.insuranceAccepted.length > 3 && ` +${provider.insuranceAccepted.length - 3} more`}
                </p>
              </div>

              {/* Contact Info */}
              <div className="mb-3 space-y-1">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {provider.address}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {provider.phone}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {provider.acceptingNewPatients && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    ✓ Accepting New Patients
                  </span>
                )}
                {provider.telehealth && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    💻 Telehealth Available
                  </span>
                )}
                {provider.slidingScale && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    💰 Sliding Scale
                  </span>
                )}
              </div>

              {/* Languages */}
              {provider.languages.length > 1 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600">
                    Languages: {provider.languages.join(', ')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No providers found matching your criteria.</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import Link from 'next/link';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { filterOrganizations } from '@/lib/googleSheetsParser';

export default function Dashboard() {
  const { organizations, loading } = useOrganizations();

  // Calculate statistics
  const overdoseDeathRate = 35.8;
  const projectedDeaths = 42;
  const partialYearDeaths = 14;
  const monthsReported = 4;
  const totalMonths = 12;
  const changeFromPriorYear = -64;

  // Get substance use and mental health organizations
  const substanceUseOrgs = filterOrganizations(organizations, 'Mental Health & Substance Use');
  const crisisOrgs = organizations.filter(org => org.crisisService);

  // Calculate additional metrics
  const totalPopulation = 117000; // Approximate Robeson County population
  const nationalAverage = 21.5; // National overdose death rate per 100,000
  const stateAverage = 28.4; // NC average

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-900 to-red-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-2 inline-block">
            ← Back to Home
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3">
              Robeson County Opioid Crisis Dashboard
            </h1>
            <p className="text-xl text-white/90">
              Understanding and Combating the Overdose Epidemic
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {loading ? (
          <div className="space-y-4 mt-8">
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Key Statistics Banner */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8 mt-8 border-l-4 border-red-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">2024 Overdose Death Statistics</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-600">{overdoseDeathRate}</p>
                  <p className="text-sm text-gray-600 mt-1">per 100,000 residents</p>
                  <p className="text-xs text-gray-500 mt-1">Overdose Death Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-600">{projectedDeaths}</p>
                  <p className="text-sm text-gray-600 mt-1">projected deaths in 2024</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on {partialYearDeaths} deaths in {monthsReported} months
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-600">{Math.abs(changeFromPriorYear)}%</p>
                  <p className="text-sm text-gray-600 mt-1">decrease from prior year</p>
                  <p className="text-xs text-gray-500 mt-1">Trending in the right direction</p>
                </div>
              </div>
            </div>

            {/* Comparison Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Regional Comparison</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Robeson County</span>
                    <span className="text-sm font-bold text-red-600">{overdoseDeathRate} per 100k</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-red-600 h-4 rounded-full" 
                      style={{ width: `${(overdoseDeathRate / 40) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">North Carolina Average</span>
                    <span className="text-sm font-medium">{stateAverage} per 100k</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-blue-600 h-4 rounded-full" 
                      style={{ width: `${(stateAverage / 40) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">National Average</span>
                    <span className="text-sm font-medium">{nationalAverage} per 100k</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gray-600 h-4 rounded-full" 
                      style={{ width: `${(nationalAverage / 40) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4 p-4 bg-red-50 rounded-lg">
                ⚠️ Robeson County's overdose death rate is among the <strong>highest</strong> in North Carolina, 
                significantly exceeding both state and national averages.
              </p>
            </div>

            {/* Available Resources */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                  <span className="text-2xl">🏥</span>
                  Treatment Resources
                </h2>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600 mb-2">
                    {substanceUseOrgs.length}
                  </p>
                  <p className="text-gray-600 mb-4">
                    Mental health and substance use treatment centers available
                  </p>
                </div>
                <div className="text-center">
                  <Link 
                    href="/category/mental-health-substance-use"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Find Treatment →
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                  <span className="text-2xl">🆘</span>
                  Crisis Services
                </h2>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600 mb-2">
                    {crisisOrgs.length}
                  </p>
                  <p className="text-gray-600 mb-4">
                    24/7 crisis intervention services ready to help
                  </p>
                </div>
                <div className="text-center">
                  <Link 
                    href="/category/crisis-services"
                    className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Get Help Now →
                  </Link>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Together, We Can Make a Difference
              </h2>
              <p className="text-xl mb-6">
                While the numbers show improvement, every life matters. 
                Help is available, and recovery is possible.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href="tel:988"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                >
                  📞 Call 988 for Crisis Support
                </a>
                <Link
                  href="/near-me"
                  className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                >
                  📍 Find Help Near You
                </Link>
              </div>
            </div>

            {/* Data Note */}
            <div className="mt-8 text-sm text-gray-600 bg-gray-100 rounded-lg p-4">
              <p className="font-semibold mb-1">Data Note:</p>
              <p>
                The 2024 statistics are projected based on {partialYearDeaths} confirmed overdose deaths 
                reported in the first {monthsReported} months of the year. The {changeFromPriorYear}% 
                decrease from 2023 shows progress but highlights the ongoing need for intervention and support services.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
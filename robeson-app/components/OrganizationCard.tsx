import { Organization, CATEGORY_COLORS, CATEGORY_ICONS, Category } from '@/types/organization';
import { formatDistance } from '@/lib/locationUtils';

interface OrganizationCardProps {
  organization: Organization;
  showDistance?: boolean;
}

export default function OrganizationCard({ organization, showDistance = true }: OrganizationCardProps) {
  const categoryIcon = CATEGORY_ICONS[organization.category as Category] || '📍';
  
  const formatPhoneForTel = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const getGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <div className="bg-gray-50 p-4 rounded-t-lg border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl" role="img" aria-label={organization.category}>
                {categoryIcon}
              </span>
              <h3 className="text-lg font-bold text-gray-900">{organization.organizationName}</h3>
            </div>
            <p className="text-sm text-gray-600">{organization.serviceType}</p>
          </div>
          {organization.crisisService && (
            <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              🚨 Crisis
            </span>
          )}
        </div>
        {showDistance && organization.distance !== undefined && (
          <span className="inline-flex items-center mt-2 px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">
            📍 {formatDistance(organization.distance)} away
          </span>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-700 line-clamp-2">{organization.description}</p>
        
        {/* Services */}
        {organization.servicesOffered && (
          <div className="text-sm">
            <span className="font-semibold text-gray-700">Services:</span>
            <p className="text-gray-600 mt-1 line-clamp-2">{organization.servicesOffered}</p>
          </div>
        )}

        {/* Hours */}
        {organization.hours && (
          <div className="text-sm">
            <span className="font-semibold text-gray-700">Hours:</span>
            <p className="text-gray-600">{organization.hours}</p>
          </div>
        )}

        {/* Cost */}
        {organization.costPayment && (
          <div className="text-sm">
            <span className="font-semibold text-gray-700">Cost:</span>
            <p className="text-gray-600">{organization.costPayment}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 space-y-2">
          {organization.phone && (
            <a
              href={`tel:${formatPhoneForTel(organization.phone)}`}
              className="flex items-center justify-center w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              aria-label={`Call ${organization.organizationName} at ${organization.phone}`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call {organization.phone}
            </a>
          )}

          <div className="grid grid-cols-2 gap-2">
            {organization.address && (
              <a
                href={getGoogleMapsUrl(organization.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label={`Get directions to ${organization.organizationName}`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Directions
              </a>
            )}
            
            {organization.website && (
              <a
                href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                aria-label={`Visit ${organization.organizationName} website`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Website
              </a>
            )}
          </div>

          {organization.email && (
            <a
              href={`mailto:${organization.email}`}
              className="flex items-center justify-center w-full px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              aria-label={`Email ${organization.organizationName}`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
          )}
        </div>

        {/* Address */}
        {organization.address && (
          <div className="pt-2 text-xs text-gray-500 border-t">
            <p>{organization.address}</p>
          </div>
        )}
      </div>
    </div>
  );
}
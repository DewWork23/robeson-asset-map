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
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {organization.organizationName}
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xl">{categoryIcon}</span>
            <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${CATEGORY_COLORS[organization.category as Category] || 'bg-gray-500'}`}>
              {organization.category}
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
          <span>{organization.address}</span>
        </p>
        {organization.phone && (
          <p className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a href={`tel:${formatPhoneForTel(organization.phone)}`} className="text-blue-600 hover:underline">
              {organization.phone}
            </a>
          </p>
        )}
        {organization.servicesOffered && (
          <p className="mt-2">
            <strong>Services:</strong> {organization.servicesOffered}
          </p>
        )}

      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={`/map?org=${encodeURIComponent(organization.id)}`}
          className="flex-1 min-w-[110px] bg-blue-600 text-white px-3 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
        >
          View on Map
        </a>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(organization.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[110px] bg-purple-600 text-white px-3 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-purple-700 transition-colors inline-flex items-center justify-center"
        >
          Directions
        </a>
        {organization.phone && (
          <a
            href={`tel:${formatPhoneForTel(organization.phone)}`}
            className="flex-1 min-w-[110px] bg-green-600 text-white px-3 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-green-700 transition-colors inline-flex items-center justify-center"
          >
            Call Now
          </a>
        )}
        {organization.website && (
          <a
            href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[110px] bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-indigo-700 transition-colors inline-flex items-center justify-center"
          >
            Website
          </a>
        )}
      </div>
    </div>
  );
}
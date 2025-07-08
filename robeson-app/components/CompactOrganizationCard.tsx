import { Organization, CATEGORY_COLORS, CATEGORY_ICONS, Category } from '@/types/organization';
import { formatDistance } from '@/lib/locationUtils';

interface CompactOrganizationCardProps {
  organization: Organization;
  showDistance?: boolean;
  onZoomClick?: (organization: Organization) => void;
}

export default function CompactOrganizationCard({ organization, showDistance = true, onZoomClick }: CompactOrganizationCardProps) {
  const categoryIcon = CATEGORY_ICONS[organization.category as Category] || '📍';
  
  const formatPhoneForTel = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const getGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      {/* Header */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg flex-shrink-0" role="img" aria-label={organization.category}>
                {categoryIcon}
              </span>
              <h3 className="text-sm font-semibold text-gray-900 truncate">{organization.organizationName}</h3>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">{organization.category}</p>
          </div>
          {organization.crisisService && (
            <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded">
              🚨
            </span>
          )}
        </div>
        
        {/* Distance badge */}
        {showDistance && organization.distance !== undefined && (
          <span className="inline-flex items-center mt-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
            📍 {formatDistance(organization.distance)}
          </span>
        )}

        {/* Essential info */}
        <div className="mt-2 space-y-1">
          {organization.address && (
            <p className="text-xs text-gray-600 line-clamp-1">{organization.address}</p>
          )}
          
          {organization.hours && (
            <p className="text-xs text-gray-600">
              <span className="font-medium">Hours:</span> {organization.hours}
            </p>
          )}
        </div>

        {/* Compact action buttons */}
        <div className="mt-3 flex gap-2">
          {organization.phone && (
            <a
              href={`tel:${formatPhoneForTel(organization.phone)}`}
              className="flex-1 flex items-center justify-center px-2 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
              aria-label={`Call ${organization.organizationName}`}
            >
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call
            </a>
          )}
          
          {organization.address && (
            <a
              href={getGoogleMapsUrl(organization.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center px-2 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
              aria-label={`Get directions to ${organization.organizationName}`}
            >
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Directions
            </a>
          )}
          
          {onZoomClick && (
            <button
              onClick={() => onZoomClick(organization)}
              className="flex-1 flex items-center justify-center px-2 py-1.5 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors"
              aria-label={`Zoom to ${organization.organizationName} on map`}
            >
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              Zoom
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
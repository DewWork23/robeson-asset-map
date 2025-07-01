import { Organization, CATEGORY_ICONS, Category } from '@/types/organization';
import { formatDistance } from '@/lib/locationUtils';

interface MobileOrganizationDetailProps {
  organization: Organization | null;
  onClose: () => void;
  userLocation?: { lat: number; lon: number } | null;
}

export default function MobileOrganizationDetail({ organization, onClose, userLocation }: MobileOrganizationDetailProps) {
  if (!organization) return null;

  const categoryIcon = CATEGORY_ICONS[organization.category as Category] || '📍';
  
  const formatPhoneForTel = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const getGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[70vh] overflow-hidden">
        {/* Drag handle */}
        <div className="sticky top-0 bg-white z-10 pt-2 pb-1">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>
        
        {/* Header */}
        <div className="px-4 pb-3 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{categoryIcon}</span>
                <h3 className="text-lg font-semibold text-gray-900">{organization.organizationName}</h3>
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{organization.category}</p>
              {organization.crisisService && (
                <span className="inline-flex items-center mt-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded">
                  🚨 Crisis Service
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {userLocation && organization.distance !== undefined && (
            <span className="inline-flex items-center mt-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
              📍 {formatDistance(organization.distance)} away
            </span>
          )}
        </div>
        
        {/* Scrollable content */}
        <div className="overflow-y-auto px-4 py-3" style={{ maxHeight: 'calc(70vh - 120px)' }}>
          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {organization.phone && (
              <a
                href={`tel:${formatPhoneForTel(organization.phone)}`}
                className="flex items-center justify-center px-3 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Now
              </a>
            )}
            
            {organization.address && (
              <a
                href={getGoogleMapsUrl(organization.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-3 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Get Directions
              </a>
            )}
          </div>
          
          {/* Details */}
          <div className="space-y-3">
            {organization.address && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</h4>
                <p className="text-sm text-gray-900 mt-1">{organization.address}</p>
              </div>
            )}
            
            {organization.hours && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hours</h4>
                <p className="text-sm text-gray-900 mt-1">{organization.hours}</p>
              </div>
            )}
            
            {organization.phone && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</h4>
                <p className="text-sm text-gray-900 mt-1">{organization.phone}</p>
              </div>
            )}
            
            {organization.servicesOffered && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Services</h4>
                <p className="text-sm text-gray-900 mt-1">{organization.servicesOffered}</p>
              </div>
            )}
            
            {organization.description && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">About</h4>
                <p className="text-sm text-gray-900 mt-1">{organization.description}</p>
              </div>
            )}
            
            {organization.website && (
              <div>
                <a
                  href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visit Website
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
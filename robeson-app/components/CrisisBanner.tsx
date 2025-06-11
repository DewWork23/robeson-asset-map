import { Organization } from '@/types/organization';

interface CrisisBannerProps {
  organizations: Organization[];
}

export default function CrisisBanner({ organizations }: CrisisBannerProps) {
  if (organizations.length === 0) return null;

  return (
    <div className="bg-red-600 text-white p-4">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-lg font-bold mb-3 flex items-center justify-center">
          <span className="mr-2 text-2xl">🚨</span>
          Crisis Help Available 24/7
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          {organizations.slice(0, 3).map((org) => (
            <div key={org.id} className="flex flex-col items-center">
              <span className="font-semibold mb-1 text-xs">{org.organizationName}</span>
              {org.phone && (
                <a
                  href={`tel:${org.phone.replace(/\D/g, '')}`}
                  className="bg-white text-red-600 px-3 py-1 rounded-full font-medium hover:bg-gray-100 transition-colors inline-flex items-center"
                  aria-label={`Call ${org.organizationName} at ${org.phone}`}
                >
                  📞 {org.phone}
                </a>
              )}
            </div>
          ))}
          <div className="flex flex-col items-center">
            <span className="font-semibold mb-1 text-xs">National Suicide Prevention</span>
            <a
              href="tel:988"
              className="bg-white text-red-600 px-3 py-1 rounded-full font-medium hover:bg-gray-100 transition-colors inline-flex items-center"
              aria-label="Call National Suicide Prevention Lifeline at 988"
            >
              📞 988
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
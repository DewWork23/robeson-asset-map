export interface Organization {
  id: string;
  organizationName: string;
  category: string;
  serviceType: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  hours: string;
  servicesOffered: string;
  costPayment: string;
  description: string;
  crisisService: boolean;
  languages: string;
  specialNotes: string;
  latitude?: number; // Latitude from Google Sheets
  longitude?: number; // Longitude from Google Sheets
  distance?: number; // Distance in miles from user location
}

export type Category = 
  | 'Crisis Services'
  | 'Food Services'
  | 'Housing Services'
  | 'Healthcare Services'
  | 'Mental Health & Substance Use'
  | 'Government Services'
  | 'Tribal Services'
  | 'Community Services'
  | 'Community Groups & Development'
  | 'Faith-Based Services'
  | 'Legal Services'
  | 'Law Enforcement'
  | 'Education'
  | 'Pharmacy'
  | 'Cultural & Information Services';

export const CATEGORY_ICONS: Record<string, string> = {
  'Crisis Services': '🚨',
  'Food Services': '🍽️',
  'Housing Services': '🏠',
  'Healthcare Services': '🏥',
  'Mental Health & Substance Use': '🧠',
  'Government Services': '🏛️',
  'Tribal Services': '🪶',
  'Community Services': '🏘️',
  'Community Groups & Development': '👥',
  'Faith-Based Services': '⛪',
  'Legal Services': '⚖️',
  'Law Enforcement': '🚓',
  'Education': '📚',
  'Pharmacy': '💊',
  'Cultural & Information Services': '🎭'
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Crisis Services': 'bg-red-600',
  'Food Services': 'bg-green-600',
  'Housing Services': 'bg-blue-600',
  'Healthcare Services': 'bg-emerald-600',
  'Mental Health & Substance Use': 'bg-indigo-600',
  'Government Services': 'bg-gray-600',
  'Tribal Services': 'bg-amber-700',
  'Community Services': 'bg-orange-600',
  'Community Groups & Development': 'bg-amber-600',
  'Faith-Based Services': 'bg-purple-600',
  'Legal Services': 'bg-slate-600',
  'Law Enforcement': 'bg-red-700',
  'Education': 'bg-blue-700',
  'Pharmacy': 'bg-green-700',
  'Cultural & Information Services': 'bg-pink-600'
};
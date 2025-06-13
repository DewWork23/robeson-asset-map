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
  distance?: number; // Distance in miles from user location
}

export type Category = 
  | 'Crisis Services'
  | 'Healthcare Services'
  | 'Mental Health & Addiction'
  | 'Government Services'
  | 'Tribal Services'
  | 'Community Services'
  | 'Community Groups & Development'
  | 'Faith-Based Services'
  | 'Legal Services'
  | 'Law Enforcement'
  | 'Education'
  | 'Housing Services'
  | 'Pharmacy'
  | 'Cultural & Information Services';

export const CATEGORY_ICONS: Record<string, string> = {
  'Crisis Services': '🆘',
  'Healthcare Services': '🏥',
  'Mental Health & Addiction': '🧠',
  'Government Services': '🏛️',
  'Tribal Services': '🪶',
  'Community Services': '🏘️',
  'Community Groups & Development': '👥',
  'Faith-Based Services': '⛪',
  'Legal Services': '⚖️',
  'Law Enforcement': '🚓',
  'Education': '📚',
  'Housing Services': '🏠',
  'Pharmacy': '💊',
  'Cultural & Information Services': '🎭'
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Crisis Services': 'bg-red-600',
  'Healthcare Services': 'bg-emerald-600',
  'Mental Health & Addiction': 'bg-indigo-600',
  'Government Services': 'bg-gray-600',
  'Tribal Services': 'bg-amber-700',
  'Community Services': 'bg-orange-600',
  'Community Groups & Development': 'bg-amber-600',
  'Faith-Based Services': 'bg-purple-600',
  'Legal Services': 'bg-slate-600',
  'Law Enforcement': 'bg-red-700',
  'Education': 'bg-blue-700',
  'Housing Services': 'bg-indigo-600',
  'Pharmacy': 'bg-green-700',
  'Cultural & Information Services': 'bg-pink-600'
};
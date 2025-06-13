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
  | 'Free Programs' 
  | 'Faith-Based Programs'
  | 'Fee-Based Programs'
  | 'Healthcare/Treatment' 
  | 'Healthcare/Medical'
  | 'Healthcare/Public Health'
  | 'Mental Health'
  | 'Housing Services' 
  | 'Community Services'
  | 'Community Organizations'
  | 'Community Development'
  | 'Education'
  | 'Government Services'
  | 'Government/Tribal Services'
  | 'Law Enforcement'
  | 'Legal Services'
  | 'Information/Referral'
  | 'Cultural Services'
  | 'Labor Union'
  | 'Pharmacy';

export const CATEGORY_ICONS: Record<string, string> = {
  'Free Programs': '🤝',
  'Faith-Based Programs': '⛪',
  'Fee-Based Programs': '💵',
  'Healthcare/Treatment': '🏥',
  'Healthcare/Medical': '⚕️',
  'Healthcare/Public Health': '🏥',
  'Mental Health': '🧠',
  'Housing Services': '🏠',
  'Community Services': '🏘️',
  'Community Organizations': '👥',
  'Community Development': '🏗️',
  'Education': '📚',
  'Government Services': '🏛️',
  'Government/Tribal Services': '🪶',
  'Law Enforcement': '🚓',
  'Legal Services': '⚖️',
  'Information/Referral': 'ℹ️',
  'Cultural Services': '🎭',
  'Labor Union': '👷',
  'Pharmacy': '💊'
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Free Programs': 'bg-blue-600',
  'Faith-Based Programs': 'bg-purple-600',
  'Fee-Based Programs': 'bg-green-600',
  'Healthcare/Treatment': 'bg-emerald-600',
  'Healthcare/Medical': 'bg-teal-600',
  'Healthcare/Public Health': 'bg-cyan-600',
  'Mental Health': 'bg-indigo-600',
  'Housing Services': 'bg-indigo-600',
  'Community Services': 'bg-orange-600',
  'Community Organizations': 'bg-amber-600',
  'Community Development': 'bg-yellow-600',
  'Education': 'bg-blue-700',
  'Government Services': 'bg-gray-600',
  'Government/Tribal Services': 'bg-amber-700',
  'Law Enforcement': 'bg-red-700',
  'Legal Services': 'bg-slate-600',
  'Information/Referral': 'bg-gray-600',
  'Cultural Services': 'bg-pink-600',
  'Labor Union': 'bg-gray-700',
  'Pharmacy': 'bg-green-700'
};
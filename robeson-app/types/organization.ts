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
  | 'Treatment' 
  | 'Crisis Services' 
  | 'Housing' 
  | 'Food/Shelter' 
  | 'Transportation' 
  | 'Job Resources' 
  | 'Emergency Services' 
  | 'Harm Reduction' 
  | 'Information/Referral' 
  | 'Tribal Services'
  | 'Legal Services';

export const CATEGORY_ICONS: Record<Category, string> = {
  'Free Programs': '🤝',
  'Treatment': '🏥',
  'Crisis Services': '🚨',
  'Housing': '🏠',
  'Food/Shelter': '🍽️',
  'Transportation': '🚗',
  'Job Resources': '💼',
  'Emergency Services': '🚓',
  'Harm Reduction': '💊',
  'Information/Referral': 'ℹ️',
  'Tribal Services': '🪶',
  'Legal Services': '⚖️'
};

export const CATEGORY_COLORS: Record<Category, string> = {
  'Free Programs': 'bg-blue-600',
  'Treatment': 'bg-green-600',
  'Crisis Services': 'bg-red-600',
  'Housing': 'bg-blue-700',
  'Food/Shelter': 'bg-green-700',
  'Transportation': 'bg-gray-600',
  'Job Resources': 'bg-blue-600',
  'Emergency Services': 'bg-red-600',
  'Harm Reduction': 'bg-green-600',
  'Information/Referral': 'bg-gray-600',
  'Tribal Services': 'bg-blue-700',
  'Legal Services': 'bg-gray-700'
};
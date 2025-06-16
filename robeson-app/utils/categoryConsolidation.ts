export const CONSOLIDATED_CATEGORIES = [
  'Crisis Services',
  'Food Services',
  'Housing Services',
  'Healthcare Services',
  'Mental Health & Addiction',
  'Government Services',
  'Tribal Services',
  'Community Services',
  'Community Groups & Development',
  'Faith-Based Services',
  'Legal Services',
  'Law Enforcement',
  'Education',
  'Pharmacy',
  'Cultural & Information Services'
] as const;

export type ConsolidatedCategory = typeof CONSOLIDATED_CATEGORIES[number];

export const CATEGORY_MIGRATION_MAP: Record<string, ConsolidatedCategory> = {
  // Healthcare consolidation
  'Healthcare/Treatment': 'Healthcare Services',
  'Healthcare/Medical': 'Healthcare Services',
  'Healthcare/Public Health': 'Healthcare Services',
  'Mental Health': 'Mental Health & Addiction',
  
  // Government and Tribal separation
  'Government Services': 'Government Services',
  'Government/Tribal Services': 'Government Services', // Default to Government, will handle Tribal separately
  'Government & Tribal Services': 'Government Services', // For migration
  
  // Community consolidation
  'Community Services': 'Community Services',
  'Community Organizations': 'Community Groups & Development',
  'Community Development': 'Community Groups & Development',
  
  // Faith-based rename
  'Faith-Based Programs': 'Faith-Based Services',
  
  // Keep as is
  'Legal Services': 'Legal Services',
  'Law Enforcement': 'Law Enforcement',
  'Education': 'Education',
  'Housing Services': 'Housing Services',
  'Pharmacy': 'Pharmacy',
  
  // Cultural and information consolidation
  'Cultural Services': 'Cultural & Information Services',
  'Labor Union': 'Cultural & Information Services',
  'Information/Referral': 'Cultural & Information Services',
  
  // Programs need redistribution - temporary mapping
  'Free Programs': 'Community Services', // This will need manual review
  'Fee-Based Programs': 'Community Services' // This will need manual review
};

export const CONSOLIDATED_CATEGORY_ICONS: Record<ConsolidatedCategory, string> = {
  'Crisis Services': '🆘',
  'Food Services': '🍽️',
  'Housing Services': '🏠',
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
  'Pharmacy': '💊',
  'Cultural & Information Services': '🎭'
};

export const CONSOLIDATED_CATEGORY_COLORS: Record<ConsolidatedCategory, string> = {
  'Crisis Services': 'bg-red-600',
  'Food Services': 'bg-green-600',
  'Housing Services': 'bg-blue-600',
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
  'Pharmacy': 'bg-green-700',
  'Cultural & Information Services': 'bg-pink-600'
};
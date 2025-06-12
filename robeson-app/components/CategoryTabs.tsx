'use client';

import { Category, CATEGORY_ICONS, Organization } from '@/types/organization';

interface CategoryTabsProps {
  organizations: Organization[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export default function CategoryTabs({ 
  organizations, 
  selectedCategory, 
  onCategorySelect 
}: CategoryTabsProps) {
  const categories: Category[] = [
    'Free Programs',
    'Treatment', 
    'Crisis Services',
    'Housing',
    'Food/Shelter',
    'Transportation',
    'Job Resources',
    'Emergency Services',
    'Harm Reduction',
    'Information/Referral',
    'Tribal Services',
    'Legal Services',
  ];

  const getCategoryCount = (category: string) => {
    return organizations.filter(org => org.category === category).length;
  };

  const totalCount = organizations.length;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex gap-1 py-2 overflow-x-auto scrollbar-hide">
          {/* All Resources Tab */}
          <button
            onClick={() => onCategorySelect(null)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium text-sm
              whitespace-nowrap min-w-fit transition-all duration-200
              ${!selectedCategory || selectedCategory === 'All'
                ? 'bg-blue-600 text-white border-b-3 border-blue-600' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-b-3 border-transparent'
              }
            `}
            aria-pressed={!selectedCategory || selectedCategory === 'All'}
            aria-label={`Show all ${totalCount} resources`}
          >
            <span className="text-lg">🏢</span>
            <span>All Resources</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
              {totalCount}
            </span>
          </button>

          {/* Category Tabs */}
          {categories.map((category) => {
            const icon = CATEGORY_ICONS[category] || '📍';
            const count = getCategoryCount(category);
            const isCrisis = category === 'Crisis Services';
            const isSelected = selectedCategory === category;

            return (
              <button
                key={category}
                onClick={() => onCategorySelect(category)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium text-sm
                  whitespace-nowrap min-w-fit transition-all duration-200 relative
                  ${isSelected
                    ? isCrisis 
                      ? 'bg-red-600 text-white border-b-3 border-red-600'
                      : 'bg-blue-600 text-white border-b-3 border-blue-600'
                    : isCrisis
                      ? 'bg-red-50 text-red-700 hover:bg-red-100 border-b-3 border-transparent ring-2 ring-red-400 ring-offset-1'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-b-3 border-transparent'
                  }
                `}
                aria-pressed={isSelected}
                aria-label={`${category}: ${count} resources${isCrisis ? ', 24/7 help available' : ''}`}
              >
                <span className="text-lg">{icon}</span>
                <span>{category}</span>
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold
                  ${isSelected 
                    ? 'bg-white/20' 
                    : isCrisis 
                      ? 'bg-red-200 text-red-800'
                      : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {count}
                </span>
                {isCrisis && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Crisis Services Help Text */}
      {selectedCategory === 'Crisis Services' && (
        <div className="bg-red-600 text-white px-4 py-2 text-center">
          <p className="text-sm font-medium">
            🆘 Need immediate help? Call <span className="font-bold text-lg">988</span> for 24/7 crisis support
          </p>
        </div>
      )}
    </div>
  );
}
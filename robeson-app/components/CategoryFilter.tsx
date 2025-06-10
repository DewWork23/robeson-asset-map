import { CATEGORY_ICONS, CATEGORY_COLORS, Category } from '@/types/organization';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function CategoryFilter({ categories, selectedCategory, setSelectedCategory }: CategoryFilterProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">Filter by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          const icon = category === 'All' ? '📋' : CATEGORY_ICONS[category as Category] || '📍';
          const colorClass = category === 'All' 
            ? 'bg-gray-600' 
            : CATEGORY_COLORS[category as Category] || 'bg-gray-600';
          
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                relative min-h-[60px] p-4 rounded-lg text-white font-medium transition-all transform
                ${isSelected 
                  ? `${colorClass} scale-105 shadow-lg ring-4 ring-offset-2 ring-blue-500` 
                  : `${colorClass} opacity-80 hover:opacity-100 hover:scale-105`
                }
                focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500
              `}
              aria-pressed={isSelected}
              aria-label={`Filter by ${category} category`}
            >
              <div className="flex flex-col items-center justify-center space-y-1">
                <span className="text-2xl" role="img" aria-hidden="true">{icon}</span>
                <span className="text-xs sm:text-sm leading-tight text-center">
                  {category}
                </span>
              </div>
              {category === 'Crisis Services' && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
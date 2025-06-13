import { CATEGORY_ICONS, CATEGORY_COLORS, Category } from '@/types/organization';
import { useState } from 'react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function CategoryFilter({ categories, selectedCategory, setSelectedCategory }: CategoryFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-lg font-semibold text-gray-900 md:pointer-events-none"
        aria-expanded={isExpanded}
        aria-controls="category-filter"
      >
        <span>Filter by Category</span>
        <span className="md:hidden text-gray-500">
          {isExpanded ? '−' : '+'}
        </span>
      </button>
      <div 
        id="category-filter"
        className={`${isExpanded ? 'block' : 'hidden'} md:block grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3`}
      >
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
                relative min-h-[50px] sm:min-h-[60px] p-2 sm:p-4 rounded-lg text-white font-medium transition-all transform
                ${isSelected 
                  ? `${colorClass} scale-105 shadow-lg ring-2 sm:ring-4 ring-offset-1 sm:ring-offset-2 ring-blue-500` 
                  : `${colorClass} opacity-80 hover:opacity-100 hover:scale-105`
                }
                focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-offset-1 sm:focus:ring-offset-2 focus:ring-blue-500
              `}
              aria-pressed={isSelected}
              aria-label={`Filter by ${category} category`}
            >
              <div className="flex flex-col items-center justify-center space-y-0.5 sm:space-y-1">
                <span className="text-lg sm:text-2xl" role="img" aria-hidden="true">{icon}</span>
                <span className="text-[10px] sm:text-xs leading-tight text-center">
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
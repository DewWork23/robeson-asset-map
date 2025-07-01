'use client';

import { Category, CATEGORY_ICONS, CATEGORY_COLORS } from '@/types/organization';

interface CategorySelectionPromptProps {
  onCategorySelect: (category: Category | 'all') => void;
}

const categories: Category[] = [
  'Crisis Services',
  'Food Services',
  'Housing Services',
  'Healthcare Services',
  'Mental Health & Substance Use',
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
];

export default function CategorySelectionPrompt({ onCategorySelect }: CategorySelectionPromptProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Need help finding something?
          </h1>
          <p className="text-lg text-gray-600">
            Select a category below to view resources on the map
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className={`${CATEGORY_COLORS[category]} text-white rounded-lg p-4 hover:opacity-90 transition-opacity flex items-center space-x-3 shadow-md`}
            >
              <span className="text-2xl">{CATEGORY_ICONS[category]}</span>
              <span className="font-medium text-left">{category}</span>
            </button>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={() => onCategorySelect('all')}
            className="w-full bg-gray-700 text-white rounded-lg p-4 hover:bg-gray-800 transition-colors flex items-center justify-center space-x-3 shadow-md"
          >
            <span className="text-2xl">🗺️</span>
            <span className="font-medium">View All Categories</span>
          </button>
        </div>
      </div>
    </div>
  );
}
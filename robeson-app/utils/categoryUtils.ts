import { Category } from '@/types/organization';
import { CONSOLIDATED_CATEGORIES } from './categoryConsolidation';

export function categoryToSlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9-]/g, '');
}

export function slugToCategory(slug: string): string | null {
  const allCategories = ['All', ...CONSOLIDATED_CATEGORIES];
  
  const category = allCategories.find(cat => 
    categoryToSlug(cat) === slug
  );
  
  return category || null;
}

export function isValidCategory(category: string): boolean {
  const allCategories = ['All', ...CONSOLIDATED_CATEGORIES];
  return allCategories.includes(category);
}
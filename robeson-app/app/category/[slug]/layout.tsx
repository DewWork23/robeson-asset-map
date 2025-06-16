import { CONSOLIDATED_CATEGORIES } from '@/utils/categoryConsolidation';
import { categoryToSlug } from '@/utils/categoryUtils';

export async function generateStaticParams() {
  const allCategories = ['All', ...CONSOLIDATED_CATEGORIES];
  
  return allCategories.map((category) => ({
    slug: categoryToSlug(category)
  }));
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
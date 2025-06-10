'use client';

import { useEffect } from 'react';
import { withBasePath } from '@/lib/basePath';

export default function ManifestLink() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = withBasePath('/manifest.json');
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  
  return null;
}
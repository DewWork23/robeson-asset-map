'use client';

import { useEffect } from 'react';
import { withBasePath } from '@/lib/basePath';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register(withBasePath('/sw.js')).then(
          (registration) => {
            console.log('ServiceWorker registration successful:', registration.scope);
          },
          (err) => {
            console.log('ServiceWorker registration failed:', err);
          }
        );
      });
    }
  }, []);

  return null;
}
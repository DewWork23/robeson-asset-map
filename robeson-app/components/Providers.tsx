'use client';

import { ReactNode } from 'react';
import { OrganizationsProvider, useOrganizations } from '@/contexts/OrganizationsContext';
import MapPreloader from '@/components/MapPreloader';

interface ProvidersProps {
  children: ReactNode;
}

function ProvidersContent({ children }: ProvidersProps) {
  const { organizations } = useOrganizations();
  const dataReady = organizations.length > 0;
  
  return (
    <>
      {children}
      <MapPreloader dataReady={dataReady} />
    </>
  );
}

export function Providers({ children }: ProvidersProps) {
  return (
    <OrganizationsProvider>
      <ProvidersContent>{children}</ProvidersContent>
    </OrganizationsProvider>
  );
}
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Organization } from '@/types/organization';
import { loadOrganizationsFromGoogleSheets } from '@/lib/googleSheetsParser';

interface OrganizationsContextType {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const OrganizationsContext = createContext<OrganizationsContextType | undefined>(undefined);

interface OrganizationsProviderProps {
  children: ReactNode;
}

export function OrganizationsProvider({ children }: OrganizationsProviderProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loadOrganizationsFromGoogleSheets();
      setOrganizations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
      console.error('Error loading organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const value: OrganizationsContextType = {
    organizations,
    loading,
    error,
    refetch: fetchOrganizations,
  };

  return (
    <OrganizationsContext.Provider value={value}>
      {children}
    </OrganizationsContext.Provider>
  );
}

export function useOrganizations() {
  const context = useContext(OrganizationsContext);
  if (context === undefined) {
    throw new Error('useOrganizations must be used within an OrganizationsProvider');
  }
  return context;
}
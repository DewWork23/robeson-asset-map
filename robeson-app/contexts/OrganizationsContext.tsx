'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Organization } from '@/types/organization';
import { loadOrganizationsFromGoogleSheets } from '@/lib/googleSheetsParser';
import { supabase } from '@/lib/supabase';
import type { OrganizationRecord } from '@/lib/supabase';

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
      
      console.log('Loading organizations from Supabase...');
      
      // Try to load from Supabase first
      const { data: supabaseOrgs, error: supabaseError } = await supabase
        .from('organizations')
        .select('*')
        .order('organization_name');
      
      if (supabaseError) {
        console.error('Error loading from Supabase:', supabaseError);
        throw supabaseError;
      }
      
      if (supabaseOrgs && supabaseOrgs.length > 0) {
        console.log('Loaded', supabaseOrgs.length, 'organizations from Supabase');
        
        // Convert Supabase records to Organization format
        const organizations: Organization[] = supabaseOrgs.map((record: OrganizationRecord) => ({
          id: record.id,
          organizationName: record.organization_name,
          category: record.category,
          serviceType: record.service_type || '',
          address: record.address || '',
          phone: record.phone || '',
          email: record.email || '',
          website: record.website || '',
          hours: record.hours || '',
          servicesOffered: record.services_offered || '',
          costPayment: record.cost_payment || '',
          description: record.description || '',
          crisisService: record.crisis_service,
          languages: record.languages || '',
          specialNotes: record.special_notes || '',
          latitude: record.latitude || undefined,
          longitude: record.longitude || undefined
        }));
        
        setOrganizations(organizations);
      } else {
        // Fallback to Google Sheets if Supabase is empty
        console.log('Supabase empty, falling back to Google Sheets...');
        const data = await loadOrganizationsFromGoogleSheets();
        setOrganizations(data);
      }
    } catch (err) {
      // Final fallback to Google Sheets if Supabase fails
      console.error('Supabase failed, falling back to Google Sheets:', err);
      try {
        const data = await loadOrganizationsFromGoogleSheets();
        setOrganizations(data);
      } catch (fallbackErr) {
        setError(fallbackErr instanceof Error ? fallbackErr.message : 'Failed to load organizations');
        console.error('Error loading organizations from both sources:', fallbackErr);
      }
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
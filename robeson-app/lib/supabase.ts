import { createClient } from '@supabase/supabase-js'

// Database types
export interface EventRecord {
  id: string;
  title: string;
  date: string;
  end_date: string | null;
  start_time: string;
  end_time: string;
  location: string;
  description: string;
  category: string;
  organizer: string;
  contact_email: string | null;
  contact_phone: string | null;
  link: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationRecord {
  id: string;
  organization_name: string;
  category: string;
  service_type: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours: string | null;
  services_offered: string | null;
  cost_payment: string | null;
  description: string | null;
  crisis_service: boolean;
  languages: string | null;
  special_notes: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
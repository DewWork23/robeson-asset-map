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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
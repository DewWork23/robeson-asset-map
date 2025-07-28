import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a custom fetch that can handle proxy if needed
const customFetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
  try {
    // Convert input to string if it's a URL object
    const url = input instanceof URL ? input.toString() : input;
    
    // First try direct connection
    const response = await fetch(url, { ...init, signal: AbortSignal.timeout(3000) });
    return response;
  } catch (error) {
    // If direct connection fails, you could implement a fallback here
    // For now, we'll just throw the error
    throw error;
  }
};

// Create Supabase client with custom fetch
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch,
  },
  auth: {
    persistSession: false,
  },
});
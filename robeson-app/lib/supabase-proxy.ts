import { createClient } from '@supabase/supabase-js'

// Function to detect if we need to use the proxy
function shouldUseProxy(): boolean {
  // You can implement logic here to detect if user is on corporate network
  // For now, we'll check if the direct Supabase URL is accessible
  return false; // Will be set dynamically
}

// Create Supabase client with proxy support
export function createSupabaseClient() {
  const directUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const proxyUrl = '/api/supabase'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  // For the proxy to work, we need to use the proxy URL as the base
  // but Supabase client expects a full URL, so we need to construct it
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${proxyUrl}`
    : directUrl;
  
  // Check if we should use proxy (you can make this more sophisticated)
  const useProxy = typeof window !== 'undefined' && window.location.hostname.includes('robeson.help');
  
  const supabaseUrl = useProxy ? baseUrl : directUrl;
  
  return createClient(supabaseUrl.replace('/rest/v1', ''), supabaseAnonKey, {
    auth: {
      persistSession: false, // Disable auth for now since we're using anon access
    },
  });
}
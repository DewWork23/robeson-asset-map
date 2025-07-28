import { NextApiRequest, NextApiResponse } from 'next';

// This creates a proxy endpoint that forwards all Supabase requests
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the path after /api/supabase/
  const { path } = req.query;
  const supabasePath = Array.isArray(path) ? path.join('/') : path || '';
  
  // Construct the Supabase URL
  const supabaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${supabasePath}`;
  
  // Forward the request to Supabase
  try {
    const response = await fetch(supabaseUrl, {
      method: req.method,
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': req.headers.prefer as string || '',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    // Get the response data
    const data = await response.text();
    
    // Forward the response status and headers
    res.status(response.status);
    
    // Set CORS headers to allow your domain
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, apikey, Authorization, Prefer');
    
    // Send the response
    res.send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed' });
  }
}
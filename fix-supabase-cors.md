# Fixing Supabase CORS Issues

The CORS error you're seeing typically happens due to one of these issues:

## 1. Check Supabase Dashboard Settings

### API Settings
1. Go to Settings → API in your Supabase dashboard
2. Verify that your URL is correct: `https://whzaibvijurovtevwiny.supabase.co`
3. Make sure the project is not paused or inactive

### CORS Configuration
1. Go to Settings → API → CORS Configuration
2. Ensure that `https://robeson.help` is in the allowed origins
3. If there's a field for "Allowed Origins", it should include:
   - `https://robeson.help`
   - `http://localhost:3000` (for development)
   - `http://localhost:3001` (if using different port)

## 2. Run the Diagnostic SQL Script

Run the `fix-supabase-cors.sql` script in your SQL Editor to:
- Verify RLS is enabled
- Check that policies exist
- Ensure anon role has proper permissions

## 3. Test the API Directly

Try accessing this URL directly in your browser:
```
https://whzaibvijurovtevwiny.supabase.co/rest/v1/organizations?select=*&order=organization_name.asc&apikey=YOUR_ANON_KEY
```

Replace YOUR_ANON_KEY with your actual anon key.

## 4. Alternative: Update Supabase Client Configuration

If CORS issues persist, you might need to configure the Supabase client with additional headers:
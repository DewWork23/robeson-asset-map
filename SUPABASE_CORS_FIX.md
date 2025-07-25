# Fixing Supabase CORS and Authentication Issues

## 1. Get the Correct API Keys

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/whzaibvijurovtevwiny
2. Navigate to **Settings → API**
3. Find these keys:
   - **Project URL**: `https://whzaibvijurovtevwiny.supabase.co`
   - **anon public**: This should start with `eyJ...` (this is a JWT token)
   - **service_role** (keep this secret, don't use in frontend)

## 2. Update Your Environment Variables

Your current key `sb_publishable_au290K_bxnJQZie5eXJzZw__qCvQWfH` looks like a publishable key format.

Update `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://whzaibvijurovtevwiny.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (copy the full anon public key here)
```

## 3. Fix Row Level Security Policies

Run the SQL script `fix-rls-policies.sql` in your Supabase SQL Editor to:
- Fix the contradictory policies on the organizations table
- Remove the temp_import table (security risk)
- Ensure consistent public access

## 4. Configure Authentication URLs

1. Go to **Authentication → URL Configuration**
2. Set these values:
   - **Site URL**: `https://robeson.help`
   - **Redirect URLs**: 
     - `https://robeson.help`
     - `http://localhost:3000`
     - `http://localhost:3001`

## 5. Additional CORS Configuration (if needed)

If CORS issues persist after fixing the above, you may need to:

1. Check if your Supabase project has any API Gateway or Edge Function settings that might be blocking requests
2. Verify that your domain doesn't have any reverse proxy or CDN that might be modifying headers

## 6. Test the Connection

After making these changes:
1. Update your local `.env.local` file with the correct anon key
2. Restart your Next.js development server
3. Deploy the changes to production
4. Test both local and production environments

## Troubleshooting

If you still get CORS errors:
- Check browser console for the exact error message
- Verify the Supabase URL doesn't have a trailing slash
- Ensure you're using HTTPS for production
- Check if browser extensions might be blocking requests
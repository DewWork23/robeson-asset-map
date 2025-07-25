# Supabase Setup Instructions

## 1. Set up the Database

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Copy and paste the entire contents of `supabase-setup.sql`
4. Click "Run" to create the events table and policies

## 2. Get Your API Keys

1. In your Supabase project, click "Settings" (gear icon) in the left sidebar
2. Click "API" under Project Settings
3. Copy these values:
   - **Project URL**: This is your `SUPABASE_URL`
   - **anon public** key: This is your `SUPABASE_ANON_KEY`

## 3. Add Environment Variables

Add these to your `.env.local` file in the `robeson-app` directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Keep your existing Google Sheets variables for now
NEXT_PUBLIC_GOOGLE_SHEET_ID=your_existing_sheet_id
NEXT_PUBLIC_GOOGLE_API_KEY=your_existing_api_key
```

## 4. Import Existing Events (Optional)

If you want to import your existing events from Google Sheets:

1. Export your Google Sheet as CSV
2. In Supabase dashboard, go to "Table Editor"
3. Click on the "events" table
4. Click "Insert" → "Import data from CSV"
5. Map the columns appropriately

## 5. Update GitHub Secrets

For deployment, add these secrets to your GitHub repository:
1. Go to Settings → Secrets and variables → Actions
2. Add:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_ANON_KEY`: Your anon key

## Security Notes

- The `anon` key is safe to use in client-side code
- Row Level Security (RLS) policies control access
- Current setup allows public read/write (can be restricted later)

## Testing

After setup, you can test by:
1. Going to "Table Editor" in Supabase
2. Manually adding a test event
3. Checking if it appears in your app
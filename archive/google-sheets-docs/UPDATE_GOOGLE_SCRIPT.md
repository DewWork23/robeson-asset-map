# Update Google Apps Script Instructions

The Google Apps Script has been updated to handle the new Link field. You need to redeploy the script in your Google account.

## Steps to Update:

1. **Go to your existing Google Apps Script project**
   - Visit script.google.com
   - Open your existing Events submission script

2. **Replace the entire code with the updated version**
   - Copy all the code from `google-apps-script.js` in this repository
   - Select all (Ctrl+A or Cmd+A) in the script editor
   - Paste the new code

3. **Save the script**
   - Click the save icon or press Ctrl+S (Cmd+S on Mac)

4. **Create a new deployment**
   - Click "Deploy" → "New Deployment"
   - Choose "Web App" as the type
   - Set:
     - Execute as: Me
     - Who has access: Anyone
   - Click "Deploy"

5. **Update your environment variable**
   - Copy the new Web App URL
   - Update `NEXT_PUBLIC_GOOGLE_SCRIPT_URL` in your `.env.local` file with the new URL
   - Restart your development server

## What Changed:

1. Added "Link" to all header rows
2. Updated the `addEvent` function to include the link field
3. Updated the `updateEvent` function to handle 13 columns instead of 12
4. The script now properly stores event links in column N

## Important Note:

You may need to manually add the "Link" header to column N in your existing Google Sheet if it's not there already.
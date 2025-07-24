# Google Sheets Integration for Events Calendar

This guide explains how to set up Google Sheets integration for the community events calendar, allowing non-technical admins to add events without touching code.

## Overview

The system works in two parts:
1. **Reading events**: The app reads events directly from your Google Sheet (already configured)
2. **Writing events**: Admins submit events through the form, which writes to the sheet via Google Apps Script

## Setup Instructions

### Step 1: Deploy the Google Apps Script

1. Review the deployment instructions in `DEPLOY_GOOGLE_SCRIPT.md`
2. Deploy the script from `google-apps-script.js` to your Google account
3. Copy the Web App URL you receive after deployment

### Step 2: Configure Your Application

Add the Google Apps Script URL to your GitHub Secrets:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add a new secret named `GOOGLE_SCRIPT_URL`
3. Paste your Web App URL as the value
4. The next GitHub Pages deployment will include this configuration

### Step 3: Test the Integration

1. Login as admin (password: SPARC)
2. Click "Add Event"
3. Fill out the form and submit
4. Check your Google Sheet - the event should appear immediately
5. Refresh the calendar page - the event should be visible

## How It Works

### Event Submission Flow
1. Admin fills out the event form
2. Form data is sent to your Google Apps Script endpoint
3. Apps Script adds a new row to your Google Sheet
4. The calendar reads from the sheet on next page load

### Data Structure
Events are stored with these columns in your sheet:
- Title
- Date
- Start Time
- End Time
- Location
- Description
- Category
- Organizer
- Contact Email (optional)
- Contact Phone (optional)
- Submitted At (timestamp)

### Fallback Behavior
If Google Sheets integration is not configured or fails:
- Events are saved to browser's local storage
- Admin sees instructions to manually copy/paste to GitHub
- This ensures events are never lost

## Benefits

1. **No Code Changes**: Admins can add events without touching GitHub
2. **Immediate Updates**: Events appear on next page refresh
3. **Central Management**: All events in one Google Sheet
4. **Easy Editing**: Use Google Sheets interface to edit/delete events
5. **Access Control**: Sheet permissions control who can edit events directly

## Troubleshooting

### Events not appearing after submission
1. Check that NEXT_PUBLIC_GOOGLE_SCRIPT_URL is set correctly
2. Verify the Google Apps Script is deployed with "Anyone" access
3. Check browser console for errors
4. Look at Apps Script execution logs

### Permission errors
1. Ensure the Apps Script is set to execute as "Me" (your account)
2. Verify "Who has access" is set to "Anyone"
3. Check that your Google Sheet has appropriate sharing settings

### Events not showing on calendar
1. Verify your sheet has the correct column headers
2. Check that NEXT_PUBLIC_GOOGLE_SHEET_ID is correct
3. Ensure NEXT_PUBLIC_GOOGLE_API_KEY is valid
4. Check browser console for API errors
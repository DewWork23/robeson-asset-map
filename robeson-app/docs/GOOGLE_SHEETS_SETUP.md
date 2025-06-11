# Google Sheets Database Setup Guide

This guide explains how to set up a Google Spreadsheet as the database for the Robeson County Asset Map.

## Benefits of Using Google Sheets

- **Easy Maintenance**: Update addresses, phone numbers, and other information directly in Google Sheets
- **Collaborative Editing**: Multiple team members can update information simultaneously
- **Version History**: Google Sheets automatically tracks changes
- **No Database Server Required**: Reduces hosting complexity and costs
- **Real-time Updates**: Changes appear on the website immediately after refresh

## Setup Instructions

### 1. Create Your Google Spreadsheet

1. Create a new Google Sheet or use an existing one
2. Set up columns in this exact order:
   - A: Organization Name
   - B: Category
   - C: Service Type
   - D: Address
   - E: Phone
   - F: Email
   - G: Website
   - H: Hours
   - I: Services Offered
   - J: Cost/Payment
   - K: Description
   - L: Crisis Service (Yes/No)
   - M: Languages
   - N: Special Notes

### 2. Make the Sheet Publicly Readable

1. Click "Share" button in Google Sheets
2. Click "Change to anyone with the link"
3. Set permission to "Viewer"
4. Copy the spreadsheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`

### 3. Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

### 4. Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. (Optional) Restrict the API key:
   - Click on the API key to edit
   - Under "API restrictions", select "Restrict key"
   - Select "Google Sheets API"
   - Under "Website restrictions", add your domain

### 5. Configure the Application

1. Create a `.env.local` file in the `robeson-app` directory
2. Add your credentials:
   ```
   NEXT_PUBLIC_GOOGLE_SHEET_ID=your_spreadsheet_id_here
   NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here
   ```

### 6. Deploy and Test

1. Deploy your application
2. The app will now fetch data from your Google Sheet
3. Any changes made to the sheet will appear after refreshing the website

## Data Management Tips

- **Regular Backups**: Download CSV backups of your data periodically
- **Data Validation**: Use Google Sheets data validation features to ensure consistency
- **Access Control**: Only give edit access to trusted team members
- **Column Protection**: Lock the header row to prevent accidental changes

## Troubleshooting

- **Data Not Loading**: Check that the sheet is public and API credentials are correct
- **Fallback to CSV**: The app automatically falls back to the local CSV file if Google Sheets fails
- **API Limits**: Google Sheets API has quotas; for high-traffic sites, consider caching

## Security Considerations

- The Google Sheet must be publicly readable (no authentication required)
- Never store sensitive information that shouldn't be public
- Use API key restrictions to prevent unauthorized usage
- Monitor API usage in Google Cloud Console
# Google Apps Script Deployment Instructions

Follow these steps to deploy the Google Apps Script that will handle writing events to your Google Sheet:

## 1. Access Google Apps Script
1. Go to [script.google.com](https://script.google.com)
2. Sign in with the same Google account that owns the spreadsheet

## 2. Create New Project
1. Click "New Project"
2. Name it something like "Robeson Events Writer"

## 3. Add the Code
1. Delete any default code in the editor
2. Copy all the code from `google-apps-script.js`
3. Paste it into the editor

## 4. Run Setup Function (Optional but Recommended)
1. In the dropdown menu at the top, select `setupSpreadsheet`
2. Click the "Run" button
3. Grant permissions when prompted
4. This will add headers to your sheet if they don't exist

## 5. Deploy as Web App
1. Click "Deploy" → "New Deployment"
2. Click the gear icon ⚙️ and select "Web app"
3. Configure:
   - **Description**: "Event submission endpoint"
   - **Execute as**: "Me" (your email)
   - **Who has access**: "Anyone" (required for public access)
4. Click "Deploy"
5. **IMPORTANT**: Copy the Web App URL - you'll need this!

## 6. Add to GitHub Secrets
Since you're using GitHub Pages, you need to add the URL as a GitHub Secret:

1. Go to your repository on GitHub
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Name: `GOOGLE_SCRIPT_URL`
5. Value: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec` (paste your actual URL)
6. Click "Add secret"

## 7. Test the Endpoint
You can test if it's working by visiting the URL in your browser. You should see:
```json
{"message":"Event submission endpoint is active"}
```

## Troubleshooting
- If you get permission errors, make sure the web app is set to "Anyone" access
- Check the spreadsheet permissions - it should be at least viewable by anyone with the link
- In Apps Script, go to "View" → "Executions" to see logs if something goes wrong

## Security Note
The script runs with your Google account permissions but only exposes the specific functionality we've coded. It can only append rows to your sheet - it cannot read or delete data.
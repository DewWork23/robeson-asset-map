# GitHub Secrets Setup Guide

This guide explains how to securely configure your Google Sheets API credentials using GitHub Secrets.

## Why Use GitHub Secrets?

- **Security**: API keys are never exposed in your code or repository
- **Easy Management**: Update credentials without changing code
- **Build-time Injection**: Credentials are only available during the build process

## Setup Instructions

### 1. Create Your API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google Sheets API
4. Create an API Key
5. Restrict the API key to:
   - Google Sheets API only
   - Your domain (optional but recommended)

### 2. Add Secrets to GitHub

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

   **Secret 1:**
   - Name: `GOOGLE_SHEET_ID`
   - Value: Your Google Sheet ID (from the URL)
   
   **Secret 2:**
   - Name: `GOOGLE_API_KEY`
   - Value: Your Google API Key
   
   **Secret 3:** (Optional - for event submission)
   - Name: `GOOGLE_SCRIPT_URL`
   - Value: Your Google Apps Script Web App URL (from deploying the script)

### 3. Verify Setup

The GitHub Action workflow will automatically use these secrets during deployment. You can verify it's working by:

1. Making a commit to trigger the workflow
2. Checking the Actions tab in GitHub
3. Viewing your deployed site

## Local Development

For local development, continue using `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_SHEET_ID=your_sheet_id
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key
NEXT_PUBLIC_GOOGLE_SCRIPT_URL=your_script_url  # Optional - for event submission
```

This file is gitignored and won't be committed.

## Troubleshooting

- **Build fails**: Check that both secrets are properly set in GitHub
- **Data not loading**: Verify the Sheet ID is correct and the sheet is publicly viewable
- **API errors**: Check API key restrictions and quotas in Google Cloud Console

## Security Best Practices

1. **Never commit API keys** to your repository
2. **Rotate keys regularly** if they're ever exposed
3. **Use API key restrictions** in Google Cloud Console
4. **Monitor usage** in Google Cloud Console

## Important Notes

- The Sheet ID (847266271) is already in the workflow but stored as a secret for consistency
- If credentials are missing, the app automatically falls back to the CSV file
- GitHub Pages deployments use the secrets from the repository settings
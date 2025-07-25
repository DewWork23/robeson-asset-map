// Google Apps Script to trigger GitHub rebuild when sheet changes
// 1. Open your Google Sheet
// 2. Go to Extensions → Apps Script
// 3. Paste this code and save
// 4. Click "Deploy" → "New Deployment"
// 5. Set trigger: Edit → Current project's triggers → Add trigger → On change

const GITHUB_OWNER = 'YOUR_GITHUB_USERNAME';
const GITHUB_REPO = 'robeson-asset-map';
const GITHUB_TOKEN = 'YOUR_GITHUB_PAT'; // Personal Access Token with repo scope

function onEdit(e) {
  // Debounce - only trigger after 5 seconds of no edits
  PropertiesService.getScriptProperties().setProperty('lastEdit', new Date().getTime());
  
  Utilities.sleep(5000);
  
  const lastEdit = PropertiesService.getScriptProperties().getProperty('lastEdit');
  const timeDiff = new Date().getTime() - parseInt(lastEdit);
  
  if (timeDiff >= 5000) {
    triggerGitHubRebuild();
  }
}

function triggerGitHubRebuild() {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`;
  
  const payload = {
    event_type: 'sheet-updated'
  };
  
  const options = {
    method: 'post',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload)
  };
  
  try {
    UrlFetchApp.fetch(url, options);
    console.log('GitHub rebuild triggered successfully');
  } catch (error) {
    console.error('Failed to trigger rebuild:', error);
  }
}
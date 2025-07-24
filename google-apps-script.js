// Google Apps Script Code
// Deploy this as a Web App in your Google Account
// 1. Go to script.google.com
// 2. Create a new project
// 3. Paste this code
// 4. Click Deploy > New Deployment
// 5. Choose "Web App" as the type
// 6. Set "Execute as: Me" and "Who has access: Anyone"
// 7. Copy the Web App URL for use in your Next.js app

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Open the spreadsheet
    const sheet = SpreadsheetApp.openById('1a6iGXkroz1IeH3O2DNrHi1UqnoCfX6N37eDRtWuySbs');
    // Force use of Events sheet - create it if it doesn't exist
    let eventsSheet = sheet.getSheetByName('Events');
    if (!eventsSheet) {
      eventsSheet = sheet.insertSheet('Events');
      // Add headers
      eventsSheet.appendRow([
        'Title', 'Date', 'Start Time', 'End Time', 'Location', 
        'Description', 'Category', 'Organizer', 'Contact Email', 
        'Contact Phone', 'Submitted At'
      ]);
    }
    
    // Add the new event data
    eventsSheet.appendRow([
      data.title,
      data.date,
      data.startTime || '',
      data.endTime || '',
      data.location || '',
      data.description || '',
      data.category || '',
      data.organizer || '',
      data.contactEmail || '',
      data.contactPhone || '',
      new Date().toISOString() // timestamp
    ]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Event added successfully' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (optional - for testing)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      message: 'Event submission endpoint is active' 
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Function to set up the spreadsheet with headers (run once)
function setupSpreadsheet() {
  const sheet = SpreadsheetApp.openById('1a6iGXkroz1IeH3O2DNrHi1UqnoCfX6N37eDRtWuySbs');
  let eventsSheet = sheet.getSheetByName('Events');
  if (!eventsSheet) {
    eventsSheet = sheet.insertSheet('Events');
  }
  
  // Set headers if the sheet is empty
  if (eventsSheet.getLastRow() === 0) {
    eventsSheet.appendRow([
      'Title',
      'Date',
      'Start Time',
      'End Time',
      'Location',
      'Description',
      'Category',
      'Organizer',
      'Contact Email',
      'Contact Phone',
      'Submitted At'
    ]);
  }
}
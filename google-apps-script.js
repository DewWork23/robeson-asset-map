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
    
    // Check action type
    if (data.action === 'delete') {
      return deleteEvent(data);
    } else if (data.action === 'update') {
      return updateEvent(data);
    } else {
      return addEvent(data);
    }
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

// Add new event
function addEvent(data) {
  const sheet = SpreadsheetApp.openById('1a6iGXkroz1IeH3O2DNrHi1UqnoCfX6N37eDRtWuySbs');
  let eventsSheet = sheet.getSheetByName('Events');
  if (!eventsSheet) {
    eventsSheet = sheet.insertSheet('Events');
    // Add headers
    eventsSheet.appendRow([
      'Event ID', 'Title', 'Date', 'End Date', 'Start Time', 'End Time', 'Location', 
      'Description', 'Category', 'Organizer', 'Contact Email', 
      'Contact Phone', 'Submitted At'
    ]);
  }
  
  // Add the new event data with ID in first column
  const newRow = eventsSheet.getLastRow() + 1;
  eventsSheet.appendRow([
    data.id || Date.now().toString(),
    data.title,
    data.date,
    data.endDate || data.date,
    data.startTime || '',
    data.endTime || '',
    data.location || '',
    data.description || '',
    data.category || '',
    data.organizer || '',
    data.contactEmail || '',
    data.contactPhone || '',
    new Date().toISOString()
  ]);
  
  return ContentService
    .createTextOutput(JSON.stringify({ 
      success: true, 
      message: 'Event added successfully',
      row: newRow
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Update existing event
function updateEvent(data) {
  const sheet = SpreadsheetApp.openById('1a6iGXkroz1IeH3O2DNrHi1UqnoCfX6N37eDRtWuySbs');
  const eventsSheet = sheet.getSheetByName('Events');
  
  if (!eventsSheet) {
    throw new Error('Events sheet not found');
  }
  
  // Find the row with matching ID
  const dataRange = eventsSheet.getDataRange();
  const values = dataRange.getValues();
  let rowToUpdate = -1;
  
  for (let i = 1; i < values.length; i++) { // Skip header row
    if (values[i][0] === data.id) {
      rowToUpdate = i + 1; // +1 because sheet rows are 1-indexed
      break;
    }
  }
  
  if (rowToUpdate === -1) {
    throw new Error('Event not found with ID: ' + data.id);
  }
  
  // Update the row
  eventsSheet.getRange(rowToUpdate, 2, 1, 12).setValues([[
    data.title,
    data.date,
    data.endDate || data.date,
    data.startTime || '',
    data.endTime || '',
    data.location || '',
    data.description || '',
    data.category || '',
    data.organizer || '',
    data.contactEmail || '',
    data.contactPhone || '',
    new Date().toISOString()
  ]]);
  
  return ContentService
    .createTextOutput(JSON.stringify({ 
      success: true, 
      message: 'Event updated successfully',
      row: rowToUpdate
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Delete event
function deleteEvent(data) {
  const sheet = SpreadsheetApp.openById('1a6iGXkroz1IeH3O2DNrHi1UqnoCfX6N37eDRtWuySbs');
  const eventsSheet = sheet.getSheetByName('Events');
  
  if (!eventsSheet) {
    throw new Error('Events sheet not found');
  }
  
  // Find the row with matching ID
  const dataRange = eventsSheet.getDataRange();
  const values = dataRange.getValues();
  let rowToDelete = -1;
  
  for (let i = 1; i < values.length; i++) { // Skip header row
    if (values[i][0] === data.id) {
      rowToDelete = i + 1; // +1 because sheet rows are 1-indexed
      break;
    }
  }
  
  if (rowToDelete === -1) {
    throw new Error('Event not found with ID: ' + data.id);
  }
  
  // Delete the row
  eventsSheet.deleteRow(rowToDelete);
  
  return ContentService
    .createTextOutput(JSON.stringify({ 
      success: true, 
      message: 'Event deleted successfully'
    }))
    .setMimeType(ContentService.MimeType.JSON);
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
      'Event ID',
      'Title',
      'Date',
      'End Date',
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
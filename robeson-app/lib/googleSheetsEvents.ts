// Google Sheets service for Events
const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
const EVENTS_RANGE = 'Events!A:H'; // We'll use a separate "Events" sheet

export interface EventData {
  id?: string;
  title: string;
  date: string; // ISO string
  time: string;
  location: string;
  description: string;
  category: string;
  organizer: string;
}

// Load events from Google Sheets
export async function loadEventsFromGoogleSheets(): Promise<EventData[]> {
  try {
    if (!SHEET_ID || !API_KEY) {
      console.warn('Google Sheets credentials not found');
      return [];
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${EVENTS_RANGE}?key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Failed to fetch events from Google Sheets');
      return [];
    }
    
    const data = await response.json();
    const rows = data.values || [];
    
    if (rows.length <= 1) {
      return []; // No data or only headers
    }
    
    // Skip header row and map data
    const events: EventData[] = rows.slice(1).map((row: string[], index: number) => ({
      id: (index + 1).toString(),
      title: row[0] || '',
      date: row[1] || '',
      time: row[2] || '',
      location: row[3] || '',
      description: row[4] || '',
      category: row[5] || '',
      organizer: row[6] || '',
    }));
    
    // Filter out empty rows
    return events.filter(event => event.title && event.date);
  } catch (error) {
    console.error('Error loading events from Google Sheets:', error);
    return [];
  }
}

// Note: Google Sheets API with API key only supports READ operations
// For WRITE operations, you need OAuth2 or a service account
export async function appendEventToGoogleSheets(event: EventData): Promise<boolean> {
  // Store event locally in sessionStorage as a temporary solution
  try {
    const storedEvents = sessionStorage.getItem('pendingEvents');
    const pending = storedEvents ? JSON.parse(storedEvents) : [];
    pending.push({
      ...event,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString()
    });
    sessionStorage.setItem('pendingEvents', JSON.stringify(pending));
    
    console.log('Event stored locally. To save to Google Sheets, you need to:', 
      '\n1. Copy this data to your Google Sheet manually, or',
      '\n2. Set up a backend service with proper authentication');
    
    return true;
  } catch (error) {
    console.error('Error storing event locally:', error);
    return false;
  }
}

// Get locally stored pending events
export function getPendingEvents(): EventData[] {
  try {
    const storedEvents = sessionStorage.getItem('pendingEvents');
    return storedEvents ? JSON.parse(storedEvents) : [];
  } catch {
    return [];
  }
}
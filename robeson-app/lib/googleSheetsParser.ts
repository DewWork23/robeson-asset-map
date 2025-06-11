import { Organization } from '@/types/organization';
import { calculateDistance, getCoordinatesFromAddress } from './locationUtils';

// Google Sheets API configuration
// Note: For GitHub Pages deployment, credentials are embedded since env vars aren't supported
const SHEET_ID = '847266271';
const API_KEY = 'AIzaSyAL3IbdigULyQOcCWFX7CVu-_CG1ETXXWk';
const RANGE = 'Sheet1!A:N'; // Adjust range as needed

export async function loadOrganizationsFromGoogleSheets(): Promise<Organization[]> {
  try {
    // Build the Google Sheets API URL
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    
    const data = await response.json();
    const rows = data.values;
    
    if (!rows || rows.length === 0) {
      return [];
    }
    
    // Skip header row and map data
    const organizations: Organization[] = rows.slice(1).map((row: string[], index: number) => ({
      id: (index + 1).toString(),
      organizationName: row[0] || '',
      category: row[1] || '',
      serviceType: row[2] || '',
      address: row[3] || '',
      phone: row[4] || '',
      email: row[5] || '',
      website: row[6] || '',
      hours: row[7] || '',
      servicesOffered: row[8] || '',
      costPayment: row[9] || '',
      description: row[10] || '',
      crisisService: row[11]?.toLowerCase() === 'yes',
      languages: row[12] || '',
      specialNotes: row[13] || ''
    }));
    
    return organizations;
  } catch (error) {
    console.error('Error loading organizations from Google Sheets:', error);
    // Fallback to CSV if Google Sheets fails
    return loadOrganizationsFromCSV();
  }
}

// Fallback function to load from CSV
async function loadOrganizationsFromCSV(): Promise<Organization[]> {
  try {
    const { withBasePath } = await import('./basePath');
    const response = await fetch(withBasePath('/robeson_county.csv'));
    const text = await response.text();
    
    const lines = text.split('\n').filter(line => line.trim());
    const organizations: Organization[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length >= 14) {
        const org: Organization = {
          id: i.toString(),
          organizationName: values[0] || '',
          category: values[1] || '',
          serviceType: values[2] || '',
          address: values[3] || '',
          phone: values[4] || '',
          email: values[5] || '',
          website: values[6] || '',
          hours: values[7] || '',
          servicesOffered: values[8] || '',
          costPayment: values[9] || '',
          description: values[10] || '',
          crisisService: values[11]?.toLowerCase() === 'yes',
          languages: values[12] || '',
          specialNotes: values[13] || ''
        };
        organizations.push(org);
      }
    }
    
    return organizations;
  } catch (error) {
    console.error('Error loading organizations from CSV:', error);
    return [];
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export function filterOrganizations(
  organizations: Organization[], 
  category?: string,
  searchTerm?: string,
  userLocation?: { lat: number; lon: number }
): Organization[] {
  let filtered = [...organizations];
  
  if (category && category !== 'All') {
    filtered = filtered.filter(org => org.category === category);
  }
  
  if (searchTerm && !userLocation) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(org => 
      org.organizationName.toLowerCase().includes(term) ||
      org.servicesOffered.toLowerCase().includes(term) ||
      org.description.toLowerCase().includes(term) ||
      org.address.toLowerCase().includes(term)
    );
  }
  
  // If user location is provided, calculate distances
  if (userLocation) {
    filtered = filtered.map(org => {
      const orgCoords = getCoordinatesFromAddress(org.address);
      if (orgCoords) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lon,
          orgCoords.lat,
          orgCoords.lon
        );
        return { ...org, distance };
      }
      return org;
    });
    
    // Sort by distance (closest first)
    filtered.sort((a, b) => {
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });
  } else {
    // Sort crisis services to the top when not using location
    filtered.sort((a, b) => {
      if (a.crisisService && !b.crisisService) return -1;
      if (!a.crisisService && b.crisisService) return 1;
      return 0;
    });
  }
  
  return filtered;
}
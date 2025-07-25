import { Organization } from '@/types/organization';
import { calculateDistance, getCoordinatesFromAddress } from './locationUtils';
import { CONSOLIDATED_CATEGORIES, CATEGORY_MIGRATION_MAP } from '@/utils/categoryConsolidation';

// Google Sheets API configuration
// These values are injected at build time via GitHub Actions
const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
const RANGE = 'A:P'; // Extended to include Latitude (O) and Longitude (P) columns

// Cache key and duration
const CACHE_KEY = 'robeson_resources_cache_v19'; // Force new cache - fixed lat/lon column positions
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes for testing

interface CachedData {
  organizations: Organization[];
  timestamp: number;
}

function getCachedData(): Organization[] | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CachedData = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - data.timestamp < CACHE_DURATION) {
      console.log('Using cached data');
      return data.organizations;
    }
    
    // Cache expired
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

function setCachedData(organizations: Organization[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data: CachedData = {
      organizations,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
}

export async function loadOrganizationsFromGoogleSheets(): Promise<Organization[]> {
  // Try to get cached data first
  const cached = getCachedData();
  if (cached) {
    return cached;
  }
  
  try {
    // Check if credentials are available
    if (!SHEET_ID || !API_KEY) {
      console.warn('Google Sheets credentials not found, falling back to CSV');
      console.log('SHEET_ID:', SHEET_ID ? `${SHEET_ID.substring(0, 8)}...` : 'empty');
      console.log('API_KEY:', API_KEY ? `${API_KEY.substring(0, 8)}...` : 'empty');
      return loadOrganizationsFromCSV();
    }
    
    console.log('Fetching fresh data from Google Sheets...');
    console.log('Using SHEET_ID:', SHEET_ID.substring(0, 8) + '...');
    
    // Build the Google Sheets API URL
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets API error:', errorText);
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    
    const data = await response.json();
    const rows = data.values;
    
    if (!rows || rows.length === 0) {
      console.warn('No data found in Google Sheet');
      return [];
    }
    
    console.log(`Successfully fetched ${rows.length} rows from Google Sheets`);
    
    // Debug: Show headers
    if (rows.length > 0) {
      console.log('Headers:', rows[0]);
      console.log('Number of columns:', rows[0].length);
    }
    
    // Skip header row and map data
    const organizations: Organization[] = rows.slice(1).map((row: string[], index: number) => {
      // Debug can be re-enabled if needed
      // if (index < 3) {
      //   console.log(`Row ${index + 1}: ${row[0]} at ${row[3]} - Lat: ${row[4]}, Lon: ${row[5]}`);
      // }
      
      const org = {
        id: (index + 1).toString(),
        organizationName: row[0] || '',
        category: row[1] || '',
        serviceType: row[2] || '',
        address: row[3] || '',
        latitude: row[4] ? parseFloat(row[4]) : undefined,  // Column E (index 4)
        longitude: row[5] ? parseFloat(row[5]) : undefined, // Column F (index 5)
        phone: row[6] || '',     // Column G (index 6)
        email: row[7] || '',     // Column H (index 7)
        website: row[8] || '',   // Column I (index 8)
        hours: row[9] || '',     // Column J (index 9)
        servicesOffered: row[10] || '',  // Column K (index 10)
        costPayment: row[11] || '',      // Column L (index 11)
        description: row[12] || '',      // Column M (index 12)
        crisisService: row[13]?.toLowerCase() === 'yes', // Column N (index 13)
        languages: row[14] || '',        // Column O (index 14)
        specialNotes: row[15] || ''      // Column P (index 15)
      };
      
      
      return org;
    });
    
    
    // Debug: Count organizations with and without coordinates
    const withCoords = organizations.filter(org => org.latitude && org.longitude).length;
    const withoutCoords = organizations.filter(org => !org.latitude || !org.longitude).length;
    console.log(`Organizations with coordinates: ${withCoords}, without: ${withoutCoords}`);
    
    // Cache the data
    setCachedData(organizations);
    
    return organizations;
  } catch (error) {
    console.error('Error loading organizations from Google Sheets:', error);
    
    // If it's a timeout, try cache one more time
    if (error instanceof Error && error.name === 'AbortError') {
      const cached = getCachedData();
      if (cached) return cached;
    }
    
    // Fallback to CSV if Google Sheets fails
    return loadOrganizationsFromCSV();
  }
}

// Primary function to load from CSV
async function loadOrganizationsFromCSV(): Promise<Organization[]> {
  // Check cache first
  const cached = getCachedData();
  if (cached) {
    return cached;
  }
  
  try {
    console.log('Loading data from CSV file...');
    const { withBasePath } = await import('./basePath');
    const response = await fetch(withBasePath('/consolidated_robeson_migrated.csv'));
    const text = await response.text();
    
    const lines = text.split('\n').filter(line => line.trim());
    const organizations: Organization[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length >= 14) {
        const originalCategory = values[1] || '';
        
        // Normalize category using migration map
        let normalizedCategory = CATEGORY_MIGRATION_MAP[originalCategory] || originalCategory;
        
        // Special handling for Tribal Services
        if (originalCategory === 'Government/Tribal Services') {
          const orgName = (values[0] || '').toLowerCase();
          const serviceType = (values[2] || '').toLowerCase();
          const servicesOffered = (values[8] || '').toLowerCase();
          
          if (serviceType.includes('tribal') || 
              orgName.includes('tribe') || orgName.includes('tribal') || 
              orgName.includes('lumbee') || orgName.includes('indian') ||
              servicesOffered.includes('tribal')) {
            normalizedCategory = 'Tribal Services';
          }
        }
        
        // Handle Food Services (not in original categories but needed)
        if (!CONSOLIDATED_CATEGORIES.includes(normalizedCategory as any)) {
          const services = (values[8] || '').toLowerCase();
          const name = (values[0] || '').toLowerCase();
          
          if (services.includes('food') || services.includes('meal') || 
              services.includes('pantry') || services.includes('kitchen') ||
              name.includes('food bank') || name.includes('soup kitchen')) {
            normalizedCategory = 'Food Services';
          } else if (services.includes('crisis') || values[11]?.toLowerCase() === 'yes') {
            normalizedCategory = 'Crisis Services';
          } else {
            normalizedCategory = 'Community Services';
          }
        }
        
        const org: Organization = {
          id: i.toString(),
          organizationName: values[0] || '',
          category: normalizedCategory,
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
      } else {
        console.warn(`Skipping line ${i + 1}: insufficient columns (${values.length} found, 14 required)`);
      }
    }
    
    console.log(`Successfully loaded ${organizations.length} organizations from CSV`);
    
    // Cache the CSV data too
    setCachedData(organizations);
    
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
    if (category === 'Crisis Services') {
      // For Crisis Services, show all organizations flagged as crisis
      filtered = filtered.filter(org => org.crisisService);
    } else if (category === 'Food Services') {
      // For Food Services, show organizations providing food assistance
      filtered = filtered.filter(org => {
        const services = org.servicesOffered.toLowerCase();
        const name = org.organizationName.toLowerCase();
        const serviceType = org.serviceType.toLowerCase();
        
        // Exclude support groups and other non-food services
        if (serviceType.includes('support group') || name.includes('anonymous') || name.includes('al-anon')) {
          return false;
        }
        
        // Include organizations that specifically mention food services
        return services.includes('food') ||
               services.includes('meal') ||
               services.includes('pantry') ||
               services.includes('kitchen') ||
               services.includes('nutrition') ||
               services.includes('feeding') ||
               name.includes('food bank') ||
               name.includes('soup kitchen');
      });
    } else if (category === 'Healthcare Services') {
      // For Healthcare Services, exclude support groups but include related crisis services
      filtered = filtered.filter(org => {
        const serviceType = org.serviceType.toLowerCase();
        // Exclude support groups from healthcare
        if (serviceType.includes('support group')) {
          return false;
        }
        
        // Direct category match
        if (org.category === category) return true;
        
        // Include healthcare-related crisis services
        if (org.crisisService && org.category === 'Crisis Services') {
          const healthcareServiceTypes = [
            'Hospital/Medical Services',
            'Healthcare',
            'Medical Services',
            'Comprehensive Health Services',
            'Integrated Healthcare',
            'Public Health Services'
          ];
          return healthcareServiceTypes.includes(org.serviceType);
        }
        
        return false;
      });
    } else {
      // For all other categories, show exact matches PLUS crisis services that belong to this category
      filtered = filtered.filter(org => {
        // Direct category match
        if (org.category === category) return true;
        
        // For crisis services, check if they belong to this category based on service type
        if (org.crisisService && org.category === 'Crisis Services') {
          // Map service types to categories
          const serviceTypeMap: Record<string, string> = {
            // Law Enforcement
            'Police Services': 'Law Enforcement',
            'Sheriff Services': 'Law Enforcement',
            
            // Mental Health & Substance Use
            'Mental Health Services': 'Mental Health & Substance Use',
            'Substance Abuse Treatment': 'Mental Health & Substance Use',
            'Mental Health/Addiction': 'Mental Health & Substance Use',
            'Mental Health/Developmental Services': 'Mental Health & Substance Use',
            'Mental Health/Substance Abuse': 'Mental Health & Substance Use',
            'Addiction Medicine': 'Mental Health & Substance Use',
            'Behavioral Health/Medical': 'Mental Health & Substance Use',
            'Behavioral Health/Peer Support': 'Mental Health & Substance Use',
            'Opioid Treatment': 'Mental Health & Substance Use',
            'Opioid Recovery': 'Mental Health & Substance Use',
            'Substance Abuse Prevention/Recovery': 'Mental Health & Substance Use',
            'Substance Use Prevention/Recovery': 'Mental Health & Substance Use',
            'Youth Substance Abuse Prevention': 'Mental Health & Substance Use',
            'Therapeutic Foster Care/Behavioral Health': 'Mental Health & Substance Use',
            
            // Healthcare
            'Healthcare': 'Healthcare Services',
            'Medical Services': 'Healthcare Services',
            'Hospital/Medical Services': 'Healthcare Services',
            'Comprehensive Health Services': 'Healthcare Services',
            'Integrated Healthcare': 'Healthcare Services',
            'Public Health Services': 'Healthcare Services',
            
            // Tribal
            'Tribal Services': 'Tribal Services',
            
            // Government
            'Municipal Services': 'Government Services',
            'Social Services': 'Government Services',
            
            // Legal
            'Legal Services': 'Legal Services',
            'Legal/Prosecution': 'Legal Services',
            'Drug Court': 'Legal Services',
            'Child Advocacy': 'Legal Services',
            
            // Community Services
            'Support Services': 'Community Services',
            'Community Services': 'Community Services',
            'Crisis Services': 'Community Services',
            'Support Group': 'Community Services',
            'Harm Reduction': 'Community Services',
            'Mobile Harm Reduction': 'Community Services',
            'Biopsychosocial Support': 'Community Services',
            'Community Resilience': 'Community Services',
            'Disaster Recovery': 'Community Services',
            'Disaster Relief/Humanitarian': 'Community Services',
            'Healing/Educational Resources': 'Community Services',
            'Inclusive Community Support': 'Community Services',
            'Opioid Crisis Prevention': 'Community Services',
            'Offender Rehabilitation': 'Community Services',
            'Resource Gap Bridging': 'Community Services',
            'Equine-Assisted Learning': 'Community Services',
            
            // Faith-Based
            'Faith-Based Services': 'Faith-Based Services',
            'Faith-Based Recovery': 'Faith-Based Services'
          };
          
          return serviceTypeMap[org.serviceType] === category;
        }
        
        return false;
      });
    }
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

  // Apply crisis priority sorting when in Crisis Services category
  if (category === 'Crisis Services') {
    filtered.sort((a, b) => {
      // Define priority order for crisis services (lower number = higher priority)
      const getCrisisPriority = (org: Organization): number => {
        const name = org.organizationName.toLowerCase();
        
        // Highest priority - immediate life-threatening situations
        if (name.includes('suicide prevention') || name === 'suicide prevention hotline') return 1;
        if (name.includes('crisis text line')) return 2;
        if (name.includes('crisis intervention')) return 3;
        
        // Emergency medical services
        if (name.includes('unc health southeastern')) return 4;
        
        // Law enforcement (for immediate physical danger) - prioritize Sheriff's Office
        if (name.includes('sheriff')) return 5;
        if (name.includes('police department')) return 20; // Lower priority for local PDs
        
        // Domestic/sexual violence (immediate safety concerns)
        if (name.includes('domestic violence')) return 6;
        if (name.includes('sexual assault')) return 7;
        
        // Mental health crisis services
        if (name.includes('southeastern integrated care')) return 8;
        if (name.includes('life net services')) return 9;
        if (name.includes('monarch')) return 10;
        if (name.includes('carter clinic')) return 11;
        
        // Substance abuse treatment (urgent but not immediate crisis)
        if (name.includes('lumberton treatment center')) return 12;
        if (name.includes('harm reduction')) return 13;
        if (name.includes('breeches buoy')) return 14;
        if (name.includes('tae\'s pathway')) return 15;
        
        // Support services and other crisis resources
        if (name.includes('stop the pain')) return 16;
        if (name.includes('hope alive')) return 17;
        if (name.includes('christian recovery')) return 18;
        
        // Other crisis services
        return 19;
      };
      
      const priorityA = getCrisisPriority(a);
      const priorityB = getCrisisPriority(b);
      
      // If same priority, maintain original order
      if (priorityA === priorityB) {
        // If location is available, sort by distance within same priority
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return 0;
      }
      
      return priorityA - priorityB;
    });
  }
  
  return filtered;
}
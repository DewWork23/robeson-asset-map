// Haversine formula to calculate distance between two coordinates
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Radius of Earth in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI/180);
}

// Approximate coordinates for major Robeson County locations
// In a production app, you'd use a geocoding API
export const locationCoordinates: Record<string, { lat: number; lon: number }> = {
  // Pembroke area (including UNC Pembroke)
  'pembroke': { lat: 34.6807, lon: -79.1953 },
  'uncp': { lat: 34.6874, lon: -79.2025 },
  
  // Lumberton (county seat)
  'lumberton': { lat: 34.6182, lon: -79.0086 },
  
  // Other towns
  'fairmont': { lat: 34.4960, lon: -79.1142 },
  'maxton': { lat: 34.7352, lon: -79.3489 },
  'red springs': { lat: 34.8152, lon: -79.1831 },
  'st. pauls': { lat: 34.8068, lon: -78.9728 },
  'st pauls': { lat: 34.8068, lon: -78.9728 }, // Alternative spelling
  'rowland': { lat: 34.5368, lon: -79.2917 },
  'parkton': { lat: 34.9018, lon: -79.0117 },
  'shannon': { lat: 34.8930, lon: -79.1176 },
  'orrum': { lat: 34.4652, lon: -79.0097 },
  
  // Additional cities found in the data
  'fayetteville': { lat: 35.0527, lon: -78.8784 },
  'raeford': { lat: 34.9777, lon: -79.2242 },
  'laurinburg': { lat: 34.7741, lon: -79.4628 },
  
  // Default center of Robeson County
  'default': { lat: 34.6400, lon: -79.1100 }
};

// Track addresses to add offsets for duplicate locations
const addressOffsets = new Map<string, number>();

// Reset function to clear offsets when needed
export function resetLocationOffsets() {
  addressOffsets.clear();
}

// Get coordinates from address string
export function getCoordinatesFromAddress(address: string, isCrisisService: boolean = false): { lat: number; lon: number } | null {
  const addressLower = address.toLowerCase();
  
  // Skip if no address
  if (!address || address.trim() === '') {
    return null;
  }
  
  let baseCoords: { lat: number; lon: number } | null = null;
  let matchedLocation: string | null = null;
  
  // First, try to extract city from standard address format (e.g., "123 Main St, Lumberton, NC 28358")
  const addressParts = address.split(',');
  if (addressParts.length >= 2) {
    // Get the city part (usually the second-to-last part)
    const cityPart = addressParts[addressParts.length - 2]?.trim().toLowerCase();
    
    // Check if this city is in our coordinates
    for (const [key, coords] of Object.entries(locationCoordinates)) {
      if (key === 'default') continue;
      
      if (cityPart && cityPart.includes(key)) {
        baseCoords = { ...coords };
        matchedLocation = key;
        break;
      }
    }
  }
  
  // If no match from city extraction, fall back to searching the full address
  if (!baseCoords) {
    for (const [key, coords] of Object.entries(locationCoordinates)) {
      if (key === 'default') continue;
      
      // For cities outside Robeson County, only match if they appear as the city name
      if (key === 'fayetteville' || key === 'raeford' || key === 'laurinburg') {
        // Look for pattern where the city name appears before NC/North Carolina
        // but NOT as part of a street name (e.g., "Fayetteville Road")
        const cityPattern = new RegExp(`\\b${key}\\s*(,\\s*)?(nc|north carolina)\\b`, 'i');
        const streetPattern = new RegExp(`\\b${key}\\s+(road|rd|street|st|avenue|ave|boulevard|blvd|drive|dr|lane|ln|way|court|ct|place|pl)\\b`, 'i');
        
        // Match if it's followed by NC/North Carolina and NOT followed by a street suffix
        if (cityPattern.test(address) && !streetPattern.test(address)) {
          baseCoords = { ...coords };
          matchedLocation = key;
          break;
        }
      } else {
        // For Robeson County locations, check if the city name appears after a comma
        // This helps avoid matching street names like "Pembroke Road"
        const cityAfterCommaPattern = new RegExp(`,\\s*${key}\\b`, 'i');
        const endOfAddressPattern = new RegExp(`\\b${key}\\s*(,\\s*)?(nc|north carolina)?\\s*\\d*$`, 'i');
        
        if (cityAfterCommaPattern.test(address) || endOfAddressPattern.test(address)) {
          baseCoords = { ...coords };
          matchedLocation = key;
          break;
        }
      }
    }
  }
  
  // Special case for UNCP
  if (!baseCoords && (addressLower.includes('university of north carolina') || addressLower.includes('uncp'))) {
    baseCoords = { ...locationCoordinates.uncp };
    matchedLocation = 'uncp';
  }
  
  // Default to county center if no match
  if (!baseCoords) {
    baseCoords = { ...locationCoordinates.default };
    console.log(`No city match found for address: "${address}", defaulting to county center`);
  } else {
    console.log(`Matched "${address}" to ${matchedLocation}`);
  }
  
  // Create a stable offset based on the full address to prevent shuffling
  // Use the full address as the key, not just the coordinates
  const offsetKey = address.toLowerCase().trim();
  let offsetIndex = addressOffsets.get(offsetKey);
  
  if (offsetIndex === undefined) {
    // Get all addresses at this location
    const locationKey = `${baseCoords.lat},${baseCoords.lon}`;
    const addressesAtLocation = Array.from(addressOffsets.entries())
      .filter(([addr, _]) => {
        const coords = { lat: baseCoords.lat, lon: baseCoords.lon };
        // Check if this address maps to the same base coordinates
        return addr !== offsetKey && getBaseCoordinatesForAddress(addr) === locationKey;
      }).length;
    
    offsetIndex = addressesAtLocation;
    addressOffsets.set(offsetKey, offsetIndex);
  }
  
  if (offsetIndex > 0) {
    // Use different offset scale for crisis services vs regular pins
    const scaleFactor = isCrisisService ? 0.0003 : 0.00008; // Smaller offsets
    
    // Create a spiral pattern for more natural distribution
    const angle = offsetIndex * 2.39996; // Golden angle in radians
    const radius = Math.sqrt(offsetIndex) * scaleFactor;
    
    baseCoords.lat += radius * Math.cos(angle);
    baseCoords.lon += radius * Math.sin(angle) * 1.3; // Adjust for longitude scaling at this latitude
  }
  
  return baseCoords;
}

// Helper function to get base coordinates without offset
function getBaseCoordinatesForAddress(address: string): string {
  const addressLower = address.toLowerCase();
  
  // Same logic as above but just return the location key
  const addressParts = address.split(',');
  if (addressParts.length >= 2) {
    const cityPart = addressParts[addressParts.length - 2]?.trim().toLowerCase();
    for (const [key, coords] of Object.entries(locationCoordinates)) {
      if (key === 'default') continue;
      if (cityPart && cityPart.includes(key)) {
        return `${coords.lat},${coords.lon}`;
      }
    }
  }
  
  // Return default if no match
  return `${locationCoordinates.default.lat},${locationCoordinates.default.lon}`;
}

// Format distance for display
export function formatDistance(miles: number): string {
  if (miles < 0.1) {
    return 'Less than 0.1 miles';
  } else if (miles < 1) {
    return `${(miles).toFixed(1)} miles`;
  } else {
    return `${Math.round(miles)} miles`;
  }
}
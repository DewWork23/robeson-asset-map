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
  
  // Lumberton (county seat) - using different areas for better distribution
  'lumberton': { lat: 34.6182, lon: -79.0086 },
  'north lumberton': { lat: 34.6400, lon: -79.0086 },
  'south lumberton': { lat: 34.5964, lon: -79.0086 },
  'east lumberton': { lat: 34.6182, lon: -78.9868 },
  'west lumberton': { lat: 34.6182, lon: -79.0304 },
  
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

// Common street patterns and their approximate offsets from city center
const streetPatterns: Record<string, { latOffset: number; lonOffset: number }> = {
  // Major roads/highways
  'highway': { latOffset: 0.02, lonOffset: 0 },
  'hwy': { latOffset: 0.02, lonOffset: 0 },
  'route': { latOffset: 0.02, lonOffset: 0 },
  'interstate': { latOffset: 0.03, lonOffset: 0 },
  
  // Directional indicators
  'north': { latOffset: 0.015, lonOffset: 0 },
  'south': { latOffset: -0.015, lonOffset: 0 },
  'east': { latOffset: 0, lonOffset: 0.015 },
  'west': { latOffset: 0, lonOffset: -0.015 },
  'ne': { latOffset: 0.011, lonOffset: 0.011 },
  'nw': { latOffset: 0.011, lonOffset: -0.011 },
  'se': { latOffset: -0.011, lonOffset: 0.011 },
  'sw': { latOffset: -0.011, lonOffset: -0.011 },
  
  // Common street types (slight variations)
  'main': { latOffset: 0, lonOffset: 0 },
  'elm': { latOffset: 0.005, lonOffset: 0.003 },
  'oak': { latOffset: -0.003, lonOffset: 0.005 },
  'pine': { latOffset: 0.004, lonOffset: -0.004 },
  'martin luther king': { latOffset: 0.008, lonOffset: 0 },
  'mlk': { latOffset: 0.008, lonOffset: 0 },
  
  // Numbered streets
  '1st': { latOffset: -0.008, lonOffset: -0.008 },
  '2nd': { latOffset: -0.006, lonOffset: -0.006 },
  '3rd': { latOffset: -0.004, lonOffset: -0.004 },
  '4th': { latOffset: -0.002, lonOffset: -0.002 },
  '5th': { latOffset: 0, lonOffset: 0 },
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
  
  // Apply street-level adjustments based on address patterns
  const streetLower = addressLower;
  
  // Check for numbered addresses to create slight variations
  const streetNumberMatch = address.match(/^(\d+)\s+/);
  if (streetNumberMatch) {
    const streetNumber = parseInt(streetNumberMatch[1]);
    // Create a small offset based on street number
    const numberOffset = (streetNumber % 100) * 0.00001;
    baseCoords.lat += numberOffset;
    baseCoords.lon += (streetNumber % 50) * 0.00001;
  }
  
  // Apply offsets based on street patterns
  for (const [pattern, offset] of Object.entries(streetPatterns)) {
    if (streetLower.includes(pattern)) {
      baseCoords.lat += offset.latOffset;
      baseCoords.lon += offset.lonOffset;
      console.log(`Applied street pattern offset for "${pattern}" in "${address}"`);
      break; // Only apply first matching pattern
    }
  }
  
  // Special handling for specific Lumberton areas
  if (matchedLocation === 'lumberton' && !addressLower.includes('pembroke')) {
    if (streetLower.includes('fayetteville road') || streetLower.includes('fayetteville rd')) {
      baseCoords.lat += 0.025; // North side
    } else if (streetLower.includes('elizabethtown')) {
      baseCoords.lat -= 0.020; // South side
    } else if (streetLower.includes('5th')) {
      baseCoords.lon -= 0.015; // West side
    }
  }
  
  // For organizations at the same address, we need to offset them
  // Use a combination of base location and a counter for stable offsets
  const locationKey = `${matchedLocation || 'default'}_${Math.round(baseCoords.lat * 10000)}_${Math.round(baseCoords.lon * 10000)}`;
  
  // Get or create an array of addresses at this location
  if (!addressOffsets.has(locationKey)) {
    addressOffsets.set(locationKey, 0);
  }
  
  // Check if we've seen this exact address before
  const fullAddressKey = `${locationKey}::${address.toLowerCase().trim()}`;
  let offsetIndex = 0;
  
  // Get all entries that start with this location key
  let addressesAtLocation = 0;
  for (const [key, value] of addressOffsets.entries()) {
    if (key.startsWith(locationKey + '::')) {
      addressesAtLocation++;
      if (key === fullAddressKey) {
        offsetIndex = value as number;
      }
    }
  }
  
  // If this is a new address at this location, assign it the next index
  if (!addressOffsets.has(fullAddressKey)) {
    offsetIndex = addressesAtLocation;
    addressOffsets.set(fullAddressKey, offsetIndex);
  }
  
  // Apply offset if this isn't the first organization at this location
  if (offsetIndex > 0) {
    // Smaller offsets now that we have street-level distribution
    const scaleFactor = isCrisisService ? 0.0003 : 0.0002; // Reduced offsets
    
    // Create a circular pattern for better distribution
    const angleStep = (2 * Math.PI) / Math.max(8, addressesAtLocation); // Divide circle by number of items
    const angle = offsetIndex * angleStep;
    
    // Base radius that increases slightly with more items
    const baseRadius = scaleFactor * (1 + Math.floor(offsetIndex / 8) * 0.5);
    
    baseCoords.lat += baseRadius * Math.cos(angle);
    baseCoords.lon += baseRadius * Math.sin(angle) * 1.2; // Adjust for longitude scaling
  }
  
  return baseCoords;
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
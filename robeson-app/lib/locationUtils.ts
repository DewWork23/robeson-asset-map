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
export function getCoordinatesFromAddress(address: string): { lat: number; lon: number } | null {
  const addressLower = address.toLowerCase();
  
  // Skip if no address
  if (!address || address.trim() === '') {
    return null;
  }
  
  let baseCoords: { lat: number; lon: number } | null = null;
  
  // Check for specific locations
  // Look for city/town names but avoid matching them in street names
  for (const [key, coords] of Object.entries(locationCoordinates)) {
    if (key === 'default') continue;
    
    // For cities outside Robeson County, only match if they appear as the city name
    // This prevents matching "Fayetteville Road" as Fayetteville city
    if (key === 'fayetteville' || key === 'raeford' || key === 'laurinburg') {
      // Look for pattern where the city name appears before NC/North Carolina
      // but NOT as part of a street name (e.g., "Fayetteville Road")
      // Pattern matches: "City NC" but not "City Road/Street/Ave/etc"
      const cityPattern = new RegExp(`\\b${key}\\s+(nc|north carolina)\\b`, 'i');
      const streetPattern = new RegExp(`\\b${key}\\s+(road|rd|street|st|avenue|ave|boulevard|blvd|drive|dr|lane|ln|way|court|ct|place|pl)\\b`, 'i');
      
      // Match if it's followed by NC/North Carolina and NOT followed by a street suffix
      if (cityPattern.test(address) && !streetPattern.test(address)) {
        baseCoords = { ...coords };
        break;
      }
    } else {
      // For Robeson County locations, use normal matching
      if (addressLower.includes(key)) {
        baseCoords = { ...coords };
        break;
      }
    }
  }
  
  // Special case for UNCP
  if (!baseCoords && (addressLower.includes('university of north carolina') || addressLower.includes('uncp'))) {
    baseCoords = { ...locationCoordinates.uncp };
  }
  
  // Default to county center if no match
  if (!baseCoords) {
    baseCoords = { ...locationCoordinates.default };
  }
  
  // Add a much smaller offset to prevent exact overlapping
  // This should only slightly separate pins, letting the clustering handle the rest
  const offsetKey = `${baseCoords.lat},${baseCoords.lon}`;
  const offsetCount = addressOffsets.get(offsetKey) || 0;
  addressOffsets.set(offsetKey, offsetCount + 1);
  
  if (offsetCount > 0) {
    // Use a much smaller offset that keeps pins very close together
    // This prevents false pins while still allowing individual selection
    const scaleFactor = 0.0001; // Much smaller offset - about 10 meters
    
    // Simple grid pattern for predictable placement
    const row = Math.floor(Math.sqrt(offsetCount));
    const col = offsetCount - (row * row);
    
    // Apply minimal offset
    baseCoords.lat += row * scaleFactor;
    baseCoords.lon += col * scaleFactor;
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
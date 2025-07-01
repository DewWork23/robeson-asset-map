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
  for (const [key, coords] of Object.entries(locationCoordinates)) {
    if (key === 'default') continue;
    if (addressLower.includes(key)) {
      baseCoords = { ...coords };
      break;
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
  
  // Add a smart offset to prevent exact overlapping
  // This creates a circular pattern with proper spacing
  const offsetKey = `${baseCoords.lat},${baseCoords.lon}`;
  const offsetCount = addressOffsets.get(offsetKey) || 0;
  addressOffsets.set(offsetKey, offsetCount + 1);
  
  if (offsetCount > 0) {
    // Create a sunflower pattern for optimal spacing
    const goldenAngle = 137.5077640500378; // Golden angle in degrees
    const scaleFactor = 0.008; // Significantly increased for better visibility
    
    // Calculate position using sunflower seed arrangement
    const angle = (offsetCount * goldenAngle * Math.PI) / 180;
    const radius = scaleFactor * Math.sqrt(offsetCount);
    
    // Add slight randomization to prevent perfect patterns
    const randomOffset = 0.0001;
    const randomAngle = (Math.random() - 0.5) * randomOffset;
    const randomRadius = (Math.random() - 0.5) * randomOffset;
    
    // Apply offset with randomization
    baseCoords.lat += (radius + randomRadius) * Math.cos(angle + randomAngle);
    baseCoords.lon += (radius + randomRadius) * Math.sin(angle + randomAngle);
    
    // For very crowded areas (>20 pins), increase spacing even more
    if (offsetCount > 20) {
      const extraSpacing = 0.002 * Math.floor(offsetCount / 20);
      baseCoords.lat += extraSpacing * Math.cos(angle);
      baseCoords.lon += extraSpacing * Math.sin(angle);
    }
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
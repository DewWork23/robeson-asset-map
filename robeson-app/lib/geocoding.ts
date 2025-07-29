// Simple geocoding service for addresses in Robeson County
// In production, you'd want to use a proper geocoding API like Google Maps or Mapbox

import { locationCoordinates } from './locationUtils';

export interface GeocodingResult {
  lat: number;
  lon: number;
  displayName: string;
}

// Enhanced address parser for common Robeson County addresses
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  if (!address || address.trim() === '') {
    return null;
  }

  const addressLower = address.toLowerCase().trim();
  
  // Common street name patterns in Robeson County
  const streetPatterns = [
    { pattern: /\b(main|1st|2nd|3rd|4th|5th|elm|oak|pine|church|school|center)\s*(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|way|pkwy|parkway)\b/i, type: 'street' },
    { pattern: /\b(highway|hwy|route|rt|us|nc)\s*[\d]+\b/i, type: 'highway' },
    { pattern: /\b(po box|p\.o\.|post office box)\s*[\d]+\b/i, type: 'pobox' }
  ];

  // Extract town/city from address
  let detectedTown: string | null = null;
  let townCoords: { lat: number; lon: number } | null = null;
  
  // First, check if it matches any known locations
  for (const [key, coords] of Object.entries(locationCoordinates)) {
    if (key === 'default') continue;
    
    // Check for city/town match
    if (addressLower.includes(key)) {
      detectedTown = key;
      townCoords = coords;
      break;
    }
  }

  // Check for zip codes and map to towns
  const zipCodeMap: Record<string, string> = {
    '28358': 'lumberton',
    '28372': 'pembroke',
    '28340': 'fairmont',
    '28364': 'maxton',
    '28377': 'red springs',
    '28384': 'st. pauls',
    '28383': 'rowland',
    '28371': 'parkton',
    '28369': 'orrum'
  };

  for (const [zip, town] of Object.entries(zipCodeMap)) {
    if (addressLower.includes(zip)) {
      const coords = locationCoordinates[town];
      if (coords && !detectedTown) {
        detectedTown = town;
        townCoords = coords;
      }
    }
  }

  // If we found a town/city, check if this is a street address
  if (townCoords && detectedTown) {
    // Check if address contains street information
    let hasStreetInfo = false;
    for (const { pattern } of streetPatterns) {
      if (pattern.test(address)) {
        hasStreetInfo = true;
        break;
      }
    }
    
    // If it's a street address, add a small random offset to show it's a specific location
    if (hasStreetInfo) {
      // Add small random offset (roughly 0.1-0.5 miles) to indicate specific location
      const offsetLat = (Math.random() - 0.5) * 0.01;
      const offsetLon = (Math.random() - 0.5) * 0.01;
      
      return {
        lat: townCoords.lat + offsetLat,
        lon: townCoords.lon + offsetLon,
        displayName: address.trim()
      };
    } else {
      // Just the town/city name
      const townName = detectedTown.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return {
        lat: townCoords.lat,
        lon: townCoords.lon,
        displayName: `${townName}, NC`
      };
    }
  }

  // If no match found, return center of Robeson County
  return {
    lat: locationCoordinates.default.lat,
    lon: locationCoordinates.default.lon,
    displayName: 'Robeson County, NC'
  };
}

// Validate if coordinates are within Robeson County area
export function isWithinRobesonCounty(lat: number, lon: number): boolean {
  const robesonCenter = { lat: 34.6400, lon: -79.1100 };
  const distance = Math.sqrt(
    Math.pow(lat - robesonCenter.lat, 2) + 
    Math.pow(lon - robesonCenter.lon, 2)
  );
  
  // Roughly 0.7 degrees ~ 50 miles
  return distance < 0.7;
}
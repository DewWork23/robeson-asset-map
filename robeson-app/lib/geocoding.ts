// Simple geocoding service for addresses in Robeson County
// In production, you'd want to use a proper geocoding API like Google Maps or Mapbox

import { locationCoordinates } from './locationUtils';

export interface GeocodingResult {
  lat: number;
  lon: number;
  displayName: string;
}

// Simple address parser for common Robeson County addresses
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  if (!address || address.trim() === '') {
    return null;
  }

  const addressLower = address.toLowerCase().trim();

  // First, check if it matches any known locations
  for (const [key, coords] of Object.entries(locationCoordinates)) {
    if (key === 'default') continue;
    
    // Check for exact city/town match
    if (addressLower.includes(key)) {
      return {
        lat: coords.lat,
        lon: coords.lon,
        displayName: key.charAt(0).toUpperCase() + key.slice(1) + ', NC'
      };
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
      if (coords) {
        return {
          lat: coords.lat,
          lon: coords.lon,
          displayName: town.charAt(0).toUpperCase() + town.slice(1) + ', NC ' + zip
        };
      }
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
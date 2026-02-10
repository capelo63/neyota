/**
 * Geocoding utilities for converting addresses to coordinates
 * Uses Nominatim (OpenStreetMap) API - free and no API key required
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName?: string;
}

/**
 * Geocode an address to get latitude and longitude
 * @param city City name
 * @param postalCode Postal code
 * @param country Country (default: France)
 * @returns Coordinates or null if not found
 */
export async function geocodeAddress(
  city: string,
  postalCode: string,
  country: string = 'France'
): Promise<GeocodingResult | null> {
  try {
    // Build query string
    const query = `${postalCode} ${city}, ${country}`;
    const encodedQuery = encodeURIComponent(query);

    // Call Nominatim API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'NEYOTA-Platform/1.0', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      console.error('Geocoding API error:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.warn('No geocoding results for:', query);
      return null;
    }

    const result = data[0];

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Update profile or project with geocoded location
 * This is a helper that can be called from API routes
 */
export async function updateLocationCoordinates(
  supabase: any,
  table: 'profiles' | 'projects',
  id: string,
  city: string,
  postalCode: string
): Promise<boolean> {
  try {
    const coords = await geocodeAddress(city, postalCode);

    if (!coords) {
      console.warn(`Could not geocode: ${city}, ${postalCode}`);
      return false;
    }

    const { error } = await supabase
      .from(table)
      .update({
        latitude: coords.latitude,
        longitude: coords.longitude,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating coordinates:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateLocationCoordinates:', error);
    return false;
  }
}

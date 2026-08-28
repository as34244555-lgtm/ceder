export interface NearbyMosque {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
}

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export async function fetchNearbyMosques(
  latitude: number,
  longitude: number,
  radiusMeters = 5000,
): Promise<NearbyMosque[]> {
  // node + way + relation; merkez nokta için `out center` kullanılır.
  const query = `[out:json][timeout:20];(
  node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${latitude},${longitude});
  way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${latitude},${longitude});
  relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${latitude},${longitude});
);out center 40;`;

  let lastError: unknown = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const elements: Array<{
        id: number;
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags?: Record<string, string>;
      }> = json.elements ?? [];

      return elements
        .map((el) => {
          const lat = el.lat ?? el.center?.lat;
          const lon = el.lon ?? el.center?.lon;
          if (lat === undefined || lon === undefined) return null;
          return {
            id: el.id,
            name: el.tags?.['name'] ?? 'İsimsiz Cami',
            latitude: lat,
            longitude: lon,
            distanceKm: haversineKm(latitude, longitude, lat, lon),
          };
        })
        .filter((m): m is NearbyMosque => m !== null)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 30);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error('Camiler alınamadı.');
}

export function getDirectionsUrl(mosque: NearbyMosque): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`;
}

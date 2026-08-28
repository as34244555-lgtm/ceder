/** Helal restoran / market araması (OpenStreetMap Overpass). */

export interface HalalPlace {
  id: number;
  name: string;
  kind: string;
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

const OVERPASS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export async function fetchHalalPlaces(
  latitude: number,
  longitude: number,
  radiusMeters = 4000,
): Promise<HalalPlace[]> {
  const query = `[out:json][timeout:25];(
  node["amenity"~"restaurant|cafe|fast_food"]["diet:halal"="yes"](around:${radiusMeters},${latitude},${longitude});
  node["amenity"~"restaurant|cafe|fast_food"]["cuisine"~"halal",i](around:${radiusMeters},${latitude},${longitude});
  node["shop"~"supermarket|convenience|butcher"]["diet:halal"="yes"](around:${radiusMeters},${latitude},${longitude});
  node["name"~"helal|halal|حلال",i]["amenity"~"restaurant|cafe|fast_food"](around:${radiusMeters},${latitude},${longitude});
  way["amenity"~"restaurant|cafe|fast_food"]["diet:halal"="yes"](around:${radiusMeters},${latitude},${longitude});
);out center 50;`;

  for (const endpoint of OVERPASS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      if (!res.ok) continue;
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
          if (lat == null || lon == null) return null;
          const tags = el.tags ?? {};
          return {
            id: el.id,
            name: tags.name ?? tags['name:tr'] ?? 'Helal mekân',
            kind: tags.amenity ?? tags.shop ?? 'place',
            latitude: lat,
            longitude: lon,
            distanceKm: haversineKm(latitude, longitude, lat, lon),
          } satisfies HalalPlace;
        })
        .filter((x): x is HalalPlace => x !== null)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 30);
    } catch {
      // sonraki endpoint
    }
  }
  return [];
}

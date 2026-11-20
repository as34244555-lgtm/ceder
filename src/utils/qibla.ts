const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;
const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Verilen konumdan Kâbe'ye olan kıble açısını (kuzeyden saat yönünde derece) hesaplar. */
export function calculateQiblaBearing(latitude: number, longitude: number): number {
  const phi1 = toRad(latitude);
  const phi2 = toRad(KAABA_LAT);
  const deltaLambda = toRad(KAABA_LON - longitude);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = toDeg(Math.atan2(y, x));
  return (theta + 360) % 360;
}

/** Verilen konumdan Kâbe'ye olan mesafeyi km cinsinden hesaplar (haversine formülü). */
export function calculateDistanceToKaabaKm(latitude: number, longitude: number): number {
  const phi1 = toRad(latitude);
  const phi2 = toRad(KAABA_LAT);
  const deltaPhi = toRad(KAABA_LAT - latitude);
  const deltaLambda = toRad(KAABA_LON - longitude);

  const a =
    Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

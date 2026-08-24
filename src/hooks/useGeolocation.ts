import { useCallback, useState } from 'react';

export interface Coords {
  latitude: number;
  longitude: number;
}

type GeoStatus = 'idle' | 'loading' | 'success' | 'error';

export function useGeolocation() {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback((opts?: { highAccuracy?: boolean }) => {
    if (!('geolocation' in navigator)) {
      setStatus('error');
      setError('Tarayıcınız konum servisini desteklemiyor.');
      return Promise.resolve(false);
    }
    setStatus('loading');
    setError(null);
    const highAccuracy = opts?.highAccuracy ?? true;
    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setStatus('success');
          resolve(true);
        },
        (err) => {
          setStatus('error');
          setError(
            err.code === err.PERMISSION_DENIED
              ? 'Konum izni verilmedi. Ayarlar’dan şehir seçerek devam edin.'
              : 'Konumunuz alınamadı. Ayarlar’dan şehir seçerek devam edin.',
          );
          resolve(false);
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 20000 : 10000,
          maximumAge: highAccuracy ? 30_000 : 5 * 60 * 1000,
        },
      );
    });
  }, []);

  return { status, coords, error, requestLocation };
}

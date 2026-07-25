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

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('error');
      setError('Tarayıcınız konum servisini desteklemiyor.');
      return;
    }
    setStatus('loading');
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus('success');
      },
      (err) => {
        setStatus('error');
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Konum izni verilmedi. Lütfen şehir seçerek devam edin.'
            : 'Konumunuz alınamadı. Lütfen şehir seçerek devam edin.',
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  return { status, coords, error, requestLocation };
}

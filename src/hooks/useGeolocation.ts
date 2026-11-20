import { useCallback, useState } from 'react';

export interface Coords {
  latitude: number;
  longitude: number;
}

type GeoStatus = 'idle' | 'loading' | 'success' | 'error';

export interface RequestLocationOptions {
  highAccuracy?: boolean;
  /** Hata ve yükleniyor durumunu ekrana basmaz; kayıtlı konum durur. */
  silent?: boolean;
  maximumAge?: number;
}

export function useGeolocation() {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback((opts?: RequestLocationOptions) => {
    if (!('geolocation' in navigator)) {
      if (!opts?.silent) {
        setStatus('error');
        setError('Tarayıcınız konum servisini desteklemiyor.');
      }
      return Promise.resolve(false);
    }
    const silent = opts?.silent ?? false;
    if (!silent) {
      setStatus('loading');
      setError(null);
    }
    const highAccuracy = opts?.highAccuracy ?? true;
    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setStatus('success');
          setError(null);
          resolve(true);
        },
        (err) => {
          if (!silent) {
            setStatus('error');
            setError(
              err.code === err.PERMISSION_DENIED
                ? 'Konum izni verilmedi. Ayarlar’dan şehir seçerek devam edin.'
                : 'Konumunuz alınamadı. Ayarlar’dan şehir seçerek devam edin.',
            );
          }
          resolve(false);
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 20000 : 12000,
          maximumAge: opts?.maximumAge ?? (highAccuracy ? 60_000 : 10 * 60 * 1000),
        },
      );
    });
  }, []);

  return { status, coords, error, requestLocation };
}

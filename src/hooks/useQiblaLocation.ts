import { useEffect, useRef, useState } from 'react';
import { geocodeCity } from '../api/geocode';
import { useGeolocation } from './useGeolocation';
import type { LocationInfo } from '../types';

interface Coords {
  latitude: number;
  longitude: number;
}

/**
 * Kıble açısı için bir koordinat elde etmeye çalışır. Sırasıyla:
 * 1) Uygulamanın genelinde zaten bilinen konum (GPS ile alınmışsa doğrudan,
 *    şehir seçilmişse şehir adından yaklaşık koordinat).
 * 2) Kullanıcı "Konumumu Kullan" butonuna basarsa taze ve daha hassas GPS.
 * 3) Her ikisi de başarısız olursa (izin reddi vb.), kullanıcının bu ekrandan
 *    doğrudan bir şehir seçebilmesi için manuel geri dönüş.
 */
export function useQiblaLocation(appLocation: LocationInfo | null) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const resolvedForKeyRef = useRef<string | null>(null);

  const gps = useGeolocation();

  useEffect(() => {
    if (!appLocation) return;

    if (appLocation.source === 'gps' && appLocation.latitude !== undefined && appLocation.longitude !== undefined) {
      setCoords({ latitude: appLocation.latitude, longitude: appLocation.longitude });
      setResolveError(null);
      return;
    }

    if (appLocation.source === 'city' && appLocation.city) {
      const key = `${appLocation.city}:${appLocation.country}`;
      if (resolvedForKeyRef.current === key) return;
      resolvedForKeyRef.current = key;
      setResolving(true);
      setResolveError(null);
      void geocodeCity(appLocation.city, appLocation.country).then((result) => {
        setResolving(false);
        if (result) {
          setCoords(result);
        } else {
          setResolveError('Şehir konumu bulunamadı.');
        }
      });
    }
  }, [appLocation]);

  useEffect(() => {
    if (gps.status === 'success' && gps.coords) {
      setCoords(gps.coords);
      setResolveError(null);
    }
    if (gps.status === 'error' && gps.error && !coords) {
      setResolveError(gps.error);
    }
  }, [gps.status, gps.coords, gps.error, coords]);

  const setManualCoords = (c: Coords) => {
    setCoords(c);
    setResolveError(null);
  };

  return {
    coords,
    resolving: resolving || gps.status === 'loading',
    resolveError,
    requestPreciseLocation: gps.requestLocation,
    setManualCoords,
  };
}

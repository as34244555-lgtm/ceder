import { useMemo, useState } from 'react';
import { Landmark, LocateFixed, Compass as CompassIcon, Loader2, MapPin } from 'lucide-react';
import { useQiblaLocation } from '../hooks/useQiblaLocation';
import { useCompassHeading } from '../hooks/useCompassHeading';
import { calculateDistanceToKaabaKm, calculateQiblaBearing } from '../utils/qibla';
import { geocodeCity } from '../api/geocode';
import { primeAudio } from '../utils/sound';
import { TURKISH_CITIES } from '../data/cities';
import type { LocationInfo } from '../types';

interface QiblaCompassProps {
  location: LocationInfo | null;
}

export function QiblaCompass({ location }: QiblaCompassProps) {
  const { coords, resolving, resolveError, requestPreciseLocation, setManualCoords } =
    useQiblaLocation(location);
  const { heading, permission, requestAccess } = useCompassHeading();
  const [fallbackCity, setFallbackCity] = useState('');
  const [fallbackLoading, setFallbackLoading] = useState(false);

  const qibla = useMemo(() => {
    if (!coords) return null;
    return {
      bearing: calculateQiblaBearing(coords.latitude, coords.longitude),
      distanceKm: calculateDistanceToKaabaKm(coords.latitude, coords.longitude),
    };
  }, [coords]);

  const handleUseLocation = () => {
    primeAudio();
    requestPreciseLocation();
  };

  const handleFallbackCity = async (city: string) => {
    setFallbackCity(city);
    setFallbackLoading(true);
    const result = await geocodeCity(city, 'Turkey');
    setFallbackLoading(false);
    if (result) setManualCoords(result);
  };

  const needsCompassPermission = permission === 'unknown' || permission === 'denied';
  const diskRotation = heading !== null ? -heading : 0;

  return (
    <div className="w-full flex flex-col items-center gap-6 fade-in-up">
      <div className="glass-card rounded-3xl p-6 sm:p-8 w-full flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm uppercase tracking-[0.2em]">
          <CompassIcon className="h-4 w-4 text-gold-400" />
          Kıble Pusulası
        </div>

        {!coords ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center w-full">
            {resolving ? (
              <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Konum belirleniyor…
              </div>
            ) : (
              <>
                <p className="text-[var(--text-secondary)] text-sm max-w-xs">
                  Kıble yönünü hesaplayabilmek için konumunuza ihtiyacımız var.
                </p>
                <button
                  type="button"
                  onClick={handleUseLocation}
                  className="flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium bg-gold-400/90 text-night-950 hover:bg-gold-300 active:scale-[0.98] transition"
                >
                  <LocateFixed className="h-4 w-4" />
                  Daha Hassas Konum İçin GPS Kullan
                </button>
                {resolveError && <p className="text-red-300 text-xs max-w-xs">{resolveError}</p>}

                <div className="flex items-center gap-2 w-full max-w-xs mt-2 glass-card rounded-2xl px-3 py-2.5">
                  <MapPin className="h-4 w-4 text-gold-400 shrink-0" />
                  <select
                    value={fallbackCity}
                    onChange={(e) => void handleFallbackCity(e.target.value)}
                    className="bg-transparent text-[var(--text-primary)] text-sm outline-none w-full cursor-pointer [&>option]:text-black"
                    aria-label="Şehir seçerek kıbleyi hesapla"
                  >
                    <option value="" disabled>
                      Veya şehir seçin…
                    </option>
                    {TURKISH_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {fallbackLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="relative h-64 w-64 sm:h-72 sm:w-72 select-none">
              <div className="absolute inset-0 rounded-full border border-[var(--border-soft-strong)]" />
              <div className="absolute inset-4 rounded-full border border-[var(--border-soft)]" />

              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1 z-10">
                <div className="h-0 w-0 border-x-8 border-x-transparent border-b-[14px] border-b-gold-400" />
              </div>

              <div
                className="absolute inset-0 transition-transform duration-200 ease-out"
                style={{ transform: `rotate(${diskRotation}deg)` }}
              >
                {[
                  { label: 'K', angle: 0 },
                  { label: 'D', angle: 90 },
                  { label: 'G', angle: 180 },
                  { label: 'B', angle: 270 },
                ].map(({ label, angle }) => (
                  <div
                    key={label}
                    className="absolute left-1/2 top-1/2 text-sm font-semibold text-[var(--text-secondary)]"
                    style={{
                      transform: `rotate(${angle}deg) translate(0, -110px) rotate(${-angle}deg)`,
                    }}
                  >
                    {label}
                  </div>
                ))}

                {qibla && (
                  <div
                    className="absolute left-1/2 top-1/2 flex flex-col items-center gap-1"
                    style={{
                      transform: `rotate(${qibla.bearing}deg) translate(0, -95px) rotate(${-qibla.bearing}deg)`,
                    }}
                  >
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400 text-night-950 shadow-lg pulse-glow"
                      style={{ transform: `rotate(${qibla.bearing}deg)` }}
                    >
                      <Landmark className="h-5 w-5" />
                    </div>
                  </div>
                )}

                <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--border-soft-strong)]" />
              </div>
            </div>

            {qibla && (
              <div className="text-center">
                <p className="text-3xl font-semibold text-gold-300 tabular-nums">
                  {Math.round(qibla.bearing)}°
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Kâbe'ye kuş uçuşu {Math.round(qibla.distanceKm).toLocaleString('tr-TR')} km
                </p>
              </div>
            )}

            {needsCompassPermission && (
              <button
                type="button"
                onClick={requestAccess}
                className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium bg-[var(--accent-soft-bg)] text-[var(--accent-soft-text)] border border-[var(--accent-soft-border)] hover:brightness-110 transition"
              >
                <CompassIcon className="h-4 w-4" />
                Pusulayı Etkinleştir
              </button>
            )}

            {heading === null && !needsCompassPermission && (
              <p className="text-xs text-[var(--text-muted)] text-center max-w-xs">
                Cihazınız pusula verisi göndermiyor; ok, kuzeye göre sabit kıble açısını
                gösteriyor. Telefonunuzu düz tutup yavaşça 8 çizerek kalibre edebilirsiniz.
              </p>
            )}

            <button
              type="button"
              onClick={handleUseLocation}
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition"
            >
              <LocateFixed className="h-3.5 w-3.5" />
              Hassas GPS konumuyla güncelle
            </button>
          </>
        )}
      </div>
    </div>
  );
}

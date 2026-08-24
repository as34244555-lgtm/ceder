import { useMemo, useEffect } from 'react';
import { Landmark, Compass as CompassIcon, Loader2 } from 'lucide-react';
import { useQiblaLocation } from '../hooks/useQiblaLocation';
import { useCompassHeading } from '../hooks/useCompassHeading';
import { calculateDistanceToKaabaKm, calculateQiblaBearing } from '../utils/qibla';
import type { LocationInfo } from '../types';

interface QiblaCompassProps {
  location: LocationInfo | null;
}

export function QiblaCompass({ location }: QiblaCompassProps) {
  const { coords, resolving, resolveError } = useQiblaLocation(location);
  const { heading, permission, supported, usingAbsolute, requestAccess } = useCompassHeading();

  const qibla = useMemo(() => {
    if (!coords) return null;
    return {
      bearing: calculateQiblaBearing(coords.latitude, coords.longitude),
      distanceKm: calculateDistanceToKaabaKm(coords.latitude, coords.longitude),
    };
  }, [coords]);

  // İzin verilmişse veya gerekmiyorsa dinleyiciyi aç
  useEffect(() => {
    if (permission === 'unnecessary' || permission === 'granted') {
      void requestAccess();
    }
  }, [permission, requestAccess]);

  const needsCompassPermission = permission === 'unknown' || permission === 'denied';
  const live = heading !== null && qibla !== null;
  /** Cihaza göre kıble oku: yukarı = telefonun bakış yönü */
  const needleRotation = live ? qibla.bearing - heading : (qibla?.bearing ?? 0);
  const turnDelta = live ? ((((needleRotation % 360) + 540) % 360) - 180) : 0;
  const aligned = live && Math.abs(turnDelta) < 12;

  const turnHint = (() => {
    if (!live) return null;
    if (aligned) return 'Kıble yönündesiniz';
    return turnDelta > 0
      ? `${Math.round(Math.abs(turnDelta))}° sağa dönün`
      : `${Math.round(Math.abs(turnDelta))}° sola dönün`;
  })();

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
                  Kıble için konum gerekli. Ayarlar’dan şehir seçin veya GPS izni verin.
                </p>
                {resolveError && <p className="text-red-300 text-xs max-w-xs">{resolveError}</p>}
              </>
            )}
          </div>
        ) : (
          <>
            <div className="relative h-64 w-64 sm:h-72 sm:w-72 select-none">
              <div className="absolute inset-0 rounded-full border border-[var(--border-soft-strong)]" />
              <div className="absolute inset-4 rounded-full border border-[var(--border-soft)]" />

              {/* Telefon yönü (sabit üst ok) */}
              <div className="absolute left-1/2 top-1 -translate-x-1/2 z-20 flex flex-col items-center">
                <div className="h-0 w-0 border-x-[7px] border-x-transparent border-b-[12px] border-b-[var(--text-primary)]" />
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
                  ön
                </span>
              </div>

              {/* Kıble oku — heading’e göre döner */}
              <div
                className="absolute inset-0 transition-transform duration-150 ease-out"
                style={{ transform: `rotate(${needleRotation}deg)` }}
              >
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[108px] flex flex-col items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-night-950 shadow-lg ${
                      aligned ? 'bg-emerald-400 pulse-glow' : 'bg-gold-400 pulse-glow'
                    }`}
                  >
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div className="mt-1 h-16 w-1 rounded-full bg-gradient-to-b from-gold-400 to-transparent" />
                </div>
              </div>

              <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--border-soft-strong)] z-10" />
            </div>

            {qibla && (
              <div className="text-center">
                <p className="text-3xl font-semibold text-gold-300 tabular-nums">
                  {Math.round(qibla.bearing)}°
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Kâbe'ye kuş uçuşu {Math.round(qibla.distanceKm).toLocaleString('tr-TR')} km
                </p>
                {turnHint && (
                  <p
                    className={`text-sm font-medium mt-2 ${
                      aligned ? 'text-emerald-300' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {turnHint}
                  </p>
                )}
              </div>
            )}

            {needsCompassPermission && supported && (
              <button
                type="button"
                onClick={() => void requestAccess()}
                className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium bg-[var(--accent-soft-bg)] text-[var(--accent-soft-text)] border border-[var(--accent-soft-border)] hover:brightness-110 transition"
              >
                <CompassIcon className="h-4 w-4" />
                Pusulayı Etkinleştir
              </button>
            )}

            {heading === null && !needsCompassPermission && (
              <p className="text-xs text-[var(--text-muted)] text-center max-w-xs">
                Pusula verisi bekleniyor. Telefonu yatay tutun ve yavaşça 8 çizin. Konum Ayarlar’dan
                güncellenebilir.
              </p>
            )}

            {heading !== null && !usingAbsolute && (
              <p className="text-[10px] text-[var(--text-faint)] text-center max-w-xs">
                Göreli sensör kullanılıyor; sapma olursa cihazı kalibre edin.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Landmark, Compass as CompassIcon, Loader2, Crosshair } from 'lucide-react';
import { useQiblaLocation } from '../hooks/useQiblaLocation';
import { useCompassHeading } from '../hooks/useCompassHeading';
import { calculateDistanceToKaabaKm, calculateQiblaBearing } from '../utils/qibla';
import type { LocationInfo } from '../types';

interface QiblaCompassProps {
  location: LocationInfo | null;
}

export function QiblaCompass({ location }: QiblaCompassProps) {
  const { coords, resolving, resolveError } = useQiblaLocation(location);
  const {
    heading,
    permission,
    supported,
    source,
    accuracy,
    requestAccess,
    calibrateToNorth,
    hasCalibration,
  } = useCompassHeading();
  const [busy, setBusy] = useState(false);
  const [calMsg, setCalMsg] = useState<string | null>(null);

  const qibla = useMemo(() => {
    if (!coords) return null;
    return {
      bearing: calculateQiblaBearing(coords.latitude, coords.longitude),
      distanceKm: calculateDistanceToKaabaKm(coords.latitude, coords.longitude),
    };
  }, [coords]);

  const needsPermission = permission === 'unknown' || permission === 'denied';
  const live = heading !== null && qibla !== null;
  const needleRotation = live ? qibla.bearing - heading : (qibla?.bearing ?? 0);
  const turnDelta = live ? ((((needleRotation % 360) + 540) % 360) - 180) : 0;
  const aligned = live && Math.abs(turnDelta) < 10;

  const turnHint = (() => {
    if (!live) return null;
    if (aligned) return 'Kıble yönündesiniz ✓';
    return turnDelta > 0
      ? `${Math.round(Math.abs(turnDelta))}° sağa dönün`
      : `${Math.round(Math.abs(turnDelta))}° sola dönün`;
  })();

  const handleEnable = async () => {
    setBusy(true);
    setCalMsg(null);
    const ok = await requestAccess();
    setBusy(false);
    if (!ok) setCalMsg('Pusula izni verilmedi veya sensör yok.');
  };

  const handleCalibrate = () => {
    const ok = calibrateToNorth();
    setCalMsg(
      ok
        ? 'Kalibre edildi: şu an baktığınız yön kuzey kabul edildi.'
        : 'Önce pusulayı etkinleştirip telefonu hareket ettirin.',
    );
  };

  const accuracyLabel =
    accuracy === 3
      ? 'Yüksek doğruluk'
      : accuracy === 2
        ? 'Orta doğruluk'
        : accuracy === 1
          ? 'Düşük — 8 çizerek kalibre edin'
          : accuracy === 0
            ? 'Kalibrasyon gerekli — 8 çizin'
            : null;

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
                  Kıble için konum gerekli. Ayarlar’dan şehir seçin veya GPS verin.
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

              <div className="absolute left-1/2 top-1 -translate-x-1/2 z-20 flex flex-col items-center">
                <div className="h-0 w-0 border-x-[7px] border-x-transparent border-b-[12px] border-b-[var(--text-primary)]" />
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
                  ön
                </span>
              </div>

              {/* Sabit K/D/G/B (cihaz çerçevesi) — heading ile döner */}
              <div
                className="absolute inset-0 transition-transform duration-75 ease-out"
                style={{ transform: `rotate(${heading !== null ? -heading : 0}deg)` }}
              >
                {[
                  { label: 'K', angle: 0 },
                  { label: 'D', angle: 90 },
                  { label: 'G', angle: 180 },
                  { label: 'B', angle: 270 },
                ].map(({ label, angle }) => (
                  <div
                    key={label}
                    className="absolute left-1/2 top-1/2 text-xs font-semibold text-[var(--text-muted)]"
                    style={{
                      transform: `rotate(${angle}deg) translate(0, -118px) rotate(${-angle}deg)`,
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div
                className="absolute inset-0 transition-transform duration-75 ease-out"
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
                  <div className="mt-1 h-16 w-1.5 rounded-full bg-gradient-to-b from-gold-400 to-transparent" />
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
                {live && (
                  <p className="text-xs text-[var(--text-faint)] mt-1 tabular-nums">
                    Pusula: {Math.round(heading)}°
                    {source ? ` · ${source}` : ''}
                  </p>
                )}
                {turnHint && (
                  <p
                    className={`text-base font-semibold mt-2 ${
                      aligned ? 'text-emerald-300' : 'text-gold-300'
                    }`}
                  >
                    {turnHint}
                  </p>
                )}
                {accuracyLabel && (
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">{accuracyLabel}</p>
                )}
              </div>
            )}

            {(needsPermission || heading === null) && supported && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleEnable()}
                className="flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold bg-gold-400/90 text-night-950 hover:bg-gold-300 active:scale-[0.98] transition disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CompassIcon className="h-4 w-4" />
                )}
                Pusulayı Başlat
              </button>
            )}

            {!supported && (
              <p className="text-xs text-red-300 text-center max-w-xs">
                Bu cihaz/tarayıcı pusula desteklemiyor. Kıble açısı ({qibla ? Math.round(qibla.bearing) : '—'}°)
                kuzeye göre sabittir.
              </p>
            )}

            {heading === null && supported && !needsPermission && (
              <p className="text-xs text-[var(--text-muted)] text-center max-w-xs">
                Sensör bekleniyor… Telefonu yatay tutun, yavaşça 8 çizin, sonra tekrar «Pusulayı Başlat».
              </p>
            )}

            {heading !== null && (source === 'relative' || hasCalibration) && (
              <button
                type="button"
                onClick={handleCalibrate}
                className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-medium bg-[var(--surface-soft)] text-[var(--text-secondary)] border border-[var(--border-soft)] hover:brightness-110 transition"
              >
                <Crosshair className="h-3.5 w-3.5" />
                Şu an baktığım yön kuzey (kalibre et)
              </button>
            )}

            {calMsg && (
              <p className="text-xs text-[var(--text-secondary)] text-center max-w-xs">{calMsg}</p>
            )}

            <p className="text-[10px] text-[var(--text-faint)] text-center max-w-xs leading-relaxed">
              Altın Kâbe işaretini üstteki «ön» okuyla hizalayana kadar dönün. Manyetik alan için
              telefonu metalden uzak tutun.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

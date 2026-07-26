import { useEffect, useState } from 'react';
import { Loader2, MapPin, Navigation2, RefreshCw } from 'lucide-react';
import { useQiblaLocation } from '../hooks/useQiblaLocation';
import { fetchNearbyMosques, getDirectionsUrl, type NearbyMosque } from '../api/mosques';
import type { LocationInfo } from '../types';

interface NearbyMosquesProps {
  location: LocationInfo | null;
}

export function NearbyMosques({ location }: NearbyMosquesProps) {
  const { coords, resolving, resolveError, requestPreciseLocation } = useQiblaLocation(location);
  const [mosques, setMosques] = useState<NearbyMosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    setError(null);
    fetchNearbyMosques(coords.latitude, coords.longitude)
      .then(setMosques)
      .catch(() => setError('Camiler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.'))
      .finally(() => setLoading(false));
  }, [coords]);

  return (
    <div className="w-full flex flex-col gap-4 fade-in-up">
      <div className="glass-card rounded-2xl p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gold-400" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Yakındaki Camiler</h3>
        </div>
        <button
          type="button"
          onClick={requestPreciseLocation}
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Hassas konum
        </button>
      </div>

      {(resolving || loading) && (
        <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)] py-6">
          <Loader2 className="h-4 w-4 animate-spin" /> Aranıyor…
        </div>
      )}

      {!coords && !resolving && resolveError && (
        <p className="text-red-300 text-sm text-center">{resolveError}</p>
      )}

      {error && <p className="text-red-300 text-sm text-center">{error}</p>}

      {!loading && coords && mosques.length === 0 && !error && (
        <p className="text-[var(--text-muted)] text-sm text-center py-6">
          Yakınınızda kayıtlı cami bulunamadı. OpenStreetMap veritabanı bu bölgede eksik
          olabilir.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {mosques.map((mosque) => (
          <a
            key={mosque.id}
            href={getDirectionsUrl(mosque)}
            target="_blank"
            rel="noreferrer"
            className="glass-card rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-[var(--surface-soft-strong)] transition"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {mosque.name}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {mosque.distanceKm < 1
                  ? `${Math.round(mosque.distanceKm * 1000)} m`
                  : `${mosque.distanceKm.toFixed(1)} km`}
              </p>
            </div>
            <Navigation2 className="h-4 w-4 text-gold-400 shrink-0" />
          </a>
        ))}
      </div>

      <p className="text-[11px] text-[var(--text-muted)] text-center">
        Veriler OpenStreetMap katkıcılarından alınmaktadır.
      </p>
    </div>
  );
}

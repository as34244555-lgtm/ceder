import { useEffect, useState } from 'react';
import { MapPinned, Navigation, Utensils } from 'lucide-react';
import { fetchHalalPlaces, type HalalPlace } from '../api/halalPlaces';
import type { LocationInfo } from '../types';

interface Props {
  location: LocationInfo;
}

export function HalalPlacesScreen({ location }: Props) {
  const [places, setPlaces] = useState<HalalPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lat = location.latitude;
  const lon = location.longitude;

  useEffect(() => {
    if (lat == null || lon == null) {
      setError('Helal mekânlar için konum (GPS) gerekir. Ana ekrandan konum alın.');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchHalalPlaces(lat, lon)
      .then((list) => {
        if (!cancelled) setPlaces(list);
      })
      .catch(() => {
        if (!cancelled) setError('Helal mekânlar alınamadı.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  return (
    <div className="w-full flex flex-col gap-3 fade-in-up">
      <div className="glass-card rounded-2xl px-4 py-3 flex gap-3">
        <Utensils className="h-5 w-5 text-gold-300 shrink-0" />
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Helal Mekânlar</p>
          <p className="text-xs text-[var(--text-muted)]">
            OpenStreetMap üzerinden helal işaretli restoran / market (© OSM contributors).
          </p>
        </div>
      </div>
      {loading && <p className="text-xs text-[var(--text-muted)]">Aranıyor…</p>}
      {error && <p className="text-xs text-red-300/90">{error}</p>}
      {!loading && !error && places.length === 0 && lat != null && (
        <p className="text-xs text-[var(--text-muted)]">Yakında işaretli helal mekân bulunamadı.</p>
      )}
      {places.map((p) => (
        <a
          key={p.id}
          href={`https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 hover:bg-[var(--surface-soft-strong)] transition"
        >
          <MapPinned className="h-4 w-4 text-gold-300 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[var(--text-primary)] truncate">{p.name}</p>
            <p className="text-[11px] text-[var(--text-muted)]">
              {p.kind} · {p.distanceKm.toFixed(1)} km
            </p>
          </div>
          <Navigation className="h-4 w-4 text-[var(--text-muted)]" />
        </a>
      ))}
    </div>
  );
}

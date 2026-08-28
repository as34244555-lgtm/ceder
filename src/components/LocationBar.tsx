import { useState } from 'react';
import { LocateFixed, MapPin, Loader2, Globe2 } from 'lucide-react';
import { TURKISH_CITIES } from '../data/cities';

interface LocationBarProps {
  selectedCity: string;
  onCityChange: (city: string, country: string) => void;
  onUseLocation: () => void;
  locationLoading: boolean;
  activeLabel: string;
  isUsingGps: boolean;
}

export function LocationBar({
  selectedCity,
  onCityChange,
  onUseLocation,
  locationLoading,
  activeLabel,
  isUsingGps,
}: LocationBarProps) {
  const [worldMode, setWorldMode] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [customCountry, setCustomCountry] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCity.trim() && customCountry.trim()) {
      onCityChange(customCity.trim(), customCountry.trim());
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        {worldMode ? (
          <form
            onSubmit={handleCustomSubmit}
            className="flex items-center gap-2 glass-card rounded-2xl px-4 py-3 flex-1 flex-wrap sm:flex-nowrap"
          >
            <Globe2 className="h-4 w-4 text-gold-400 shrink-0" />
            <input
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              placeholder="Şehir (örn. Berlin)"
              className="bg-transparent text-[var(--text-primary)] text-sm outline-none flex-1 min-w-[100px] placeholder:text-[var(--text-faint)]"
            />
            <input
              value={customCountry}
              onChange={(e) => setCustomCountry(e.target.value)}
              placeholder="Ülke (örn. Germany)"
              className="bg-transparent text-[var(--text-primary)] text-sm outline-none flex-1 min-w-[100px] placeholder:text-[var(--text-faint)]"
            />
            <button
              type="submit"
              className="text-xs font-medium text-night-950 bg-gold-400 rounded-lg px-3 py-1.5 shrink-0"
            >
              Uygula
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2 glass-card rounded-2xl px-4 py-3 flex-1">
            <MapPin className="h-4 w-4 text-gold-400 shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value, 'Turkey')}
              disabled={locationLoading}
              className="bg-transparent text-[var(--text-primary)] text-sm sm:text-base outline-none w-full cursor-pointer disabled:opacity-50 [&>option]:text-black"
              aria-label="Şehir seç"
            >
              {TURKISH_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="button"
          onClick={onUseLocation}
          disabled={locationLoading}
          className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium
            bg-gold-400/90 text-night-950 hover:bg-gold-300 active:scale-[0.98] transition
            disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
        >
          {locationLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Konumumu Kullan</span>
          <span className="sm:hidden">Konumum</span>
        </button>
      </div>

      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setWorldMode((v) => !v)}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] underline underline-offset-2"
        >
          {worldMode ? 'Türkiye illerinden seç' : 'Türkiye dışında bir şehir mi arıyorsun?'}
        </button>
        {isUsingGps && (
          <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            📍 {activeLabel}
          </span>
        )}
      </div>
    </div>
  );
}

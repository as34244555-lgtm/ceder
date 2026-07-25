import { LocateFixed, MapPin, Loader2 } from 'lucide-react';
import { TURKISH_CITIES } from '../data/cities';

interface LocationBarProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
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
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
      <div className="flex items-center gap-2 glass-card rounded-2xl px-4 py-3 flex-1">
        <MapPin className="h-4 w-4 text-gold-400 shrink-0" />
        <select
          value={selectedCity}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={locationLoading}
          className="bg-transparent text-white text-sm sm:text-base outline-none w-full cursor-pointer disabled:opacity-50 [&>option]:text-black"
          aria-label="Şehir seç"
        >
          {TURKISH_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

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
        Konumumu Kullan
      </button>

      {isUsingGps && (
        <span className="hidden sm:flex items-center text-xs text-emerald-200/70 px-1">
          📍 {activeLabel}
        </span>
      )}
    </div>
  );
}

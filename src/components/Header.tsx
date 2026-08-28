import { Moon } from 'lucide-react';

interface HeaderProps {
  gregorianDateLabel?: string;
  hijriDate?: string;
  /** Aktif konum etiketi (şehir / GPS) */
  locationLabel?: string;
  onLocationClick?: () => void;
}

export function Header({
  gregorianDateLabel,
  hijriDate,
  locationLabel,
  onLocationClick,
}: HeaderProps) {
  return (
    <header className="flex flex-col items-center gap-2 pt-8 pb-4 text-center px-4">
      <div className="flex items-center gap-2.5 text-gold-300">
        <Moon className="h-7 w-7 fill-gold-400 text-gold-400" strokeWidth={1.5} />
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-wide text-[var(--text-primary)]">
          Ezan Vakti Ultra
        </h1>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">
        {gregorianDateLabel ?? 'Bugün'}
        {hijriDate ? ` · ${hijriDate}` : ''}
      </p>
      {locationLabel && (
        <button
          type="button"
          onClick={onLocationClick}
          className="text-xs text-[var(--text-muted)] hover:text-gold-300 transition underline-offset-2 hover:underline"
        >
          📍 {locationLabel}
          {onLocationClick ? ' · Ayarlardan değiştir' : ''}
        </button>
      )}
    </header>
  );
}

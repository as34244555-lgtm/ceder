import { Moon } from 'lucide-react';

interface HeaderProps {
  gregorianDateLabel?: string;
  hijriDate?: string;
}

export function Header({ gregorianDateLabel, hijriDate }: HeaderProps) {
  return (
    <header className="flex flex-col items-center gap-2 pt-8 pb-4 text-center px-4">
      <div className="flex items-center gap-2 text-gold-300">
        <Moon className="h-6 w-6 fill-gold-400 text-gold-400" strokeWidth={1.5} />
        <span className="text-sm font-medium tracking-[0.25em] uppercase text-[var(--text-secondary)]">
          Ezan Vakti
        </span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">Namaz Vakitleri</h1>
      <p className="text-sm text-[var(--text-secondary)]">
        {gregorianDateLabel ?? 'Bugün'}
        {hijriDate ? ` · ${hijriDate}` : ''}
      </p>
    </header>
  );
}

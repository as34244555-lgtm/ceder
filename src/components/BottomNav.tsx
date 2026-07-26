import { Clock, Compass, CalendarDays, ListChecks, Grid2x2 } from 'lucide-react';
import type { PrimaryTabId, TabId } from '../types';

interface BottomNavProps {
  active: TabId;
  onChange: (tab: PrimaryTabId) => void;
}

const TABS: { id: PrimaryTabId; label: string; icon: typeof Clock }[] = [
  { id: 'home', label: 'Vakitler', icon: Clock },
  { id: 'tracker', label: 'Namazlarım', icon: ListChecks },
  { id: 'qibla', label: 'Kıble', icon: Compass },
  { id: 'calendar', label: 'Takvim', icon: CalendarDays },
  { id: 'more', label: 'Daha', icon: Grid2x2 },
];

const SECONDARY_SCREENS: TabId[] = ['zikir', 'esma', 'guide', 'ramadan', 'zakat', 'mosques', 'settings'];

export function BottomNav({ active, onChange }: BottomNavProps) {
  const effectiveActive: PrimaryTabId = SECONDARY_SCREENS.includes(active)
    ? 'more'
    : (active as PrimaryTabId);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--border-soft)] bg-[var(--nav-bg)] backdrop-blur-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-4xl items-stretch justify-around px-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === effectiveActive;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors min-w-0"
            >
              <Icon
                className={`h-5 w-5 ${isActive ? 'text-gold-300' : 'text-[var(--text-faint)]'}`}
                strokeWidth={isActive ? 2 : 1.75}
              />
              <span
                className={`text-[10px] sm:text-[11px] font-medium truncate px-0.5 ${
                  isActive ? 'text-gold-200' : 'text-[var(--text-faint)]'
                }`}
              >
                {tab.label}
              </span>
              {isActive && <span className="h-1 w-1 rounded-full bg-gold-300" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

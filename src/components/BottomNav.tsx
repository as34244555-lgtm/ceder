import { Clock, Compass, CalendarDays, Sparkles, Settings } from 'lucide-react';
import type { TabId } from '../types';

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: typeof Clock }[] = [
  { id: 'home', label: 'Vakitler', icon: Clock },
  { id: 'qibla', label: 'Kıble', icon: Compass },
  { id: 'calendar', label: 'Takvim', icon: CalendarDays },
  { id: 'zikir', label: 'Zikir', icon: Sparkles },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--border-soft)] bg-[var(--nav-bg)] backdrop-blur-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-4xl items-stretch justify-around px-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors"
            >
              <Icon
                className={`h-5 w-5 ${isActive ? 'text-gold-300' : 'text-[var(--text-faint)]'}`}
                strokeWidth={isActive ? 2 : 1.75}
              />
              <span
                className={`text-[11px] font-medium ${
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

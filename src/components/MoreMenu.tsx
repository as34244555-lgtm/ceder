import {
  MessageCircleQuestion,
  Sparkles,
  BookOpenText,
  GraduationCap,
  Moon,
  Calculator,
  MapPinned,
  Settings as SettingsIcon,
  ChevronRight,
} from 'lucide-react';
import type { SecondaryScreenId } from '../types';

interface MoreMenuProps {
  onNavigate: (screen: SecondaryScreenId) => void;
  isRamadan: boolean;
}

export function MoreMenu({ onNavigate, isRamadan }: MoreMenuProps) {
  const items: {
    id: SecondaryScreenId;
    label: string;
    description: string;
    icon: typeof Sparkles;
    badge?: string;
  }[] = [
    {
      id: 'assistant',
      label: 'Dini Asistan',
      description: 'Dini sorulara anında cevap',
      icon: MessageCircleQuestion,
      badge: 'Yeni',
    },
    {
      id: 'zikir',
      label: 'Zikir & Dualar',
      description: 'Dijital tesbih ve günlük dualar',
      icon: Sparkles,
    },
    {
      id: 'esma',
      label: "Esmaü'l-Hüsna",
      description: "Allah'ın (c.c.) 99 güzel ismi",
      icon: BookOpenText,
    },
    {
      id: 'guide',
      label: 'Namaz Nasıl Kılınır?',
      description: 'Rekat sayıları ve adımlar',
      icon: GraduationCap,
    },
    {
      id: 'ramadan',
      label: 'Ramazan Modu',
      description: 'İftar/sahur geri sayımı, oruç takvimi',
      icon: Moon,
      badge: isRamadan ? 'Aktif' : undefined,
    },
    {
      id: 'zakat',
      label: 'Zekât & Fitre Hesaplama',
      description: 'Nisap kontrolü, zekât ve fitre tutarı',
      icon: Calculator,
    },
    {
      id: 'mosques',
      label: 'Yakındaki Camiler',
      description: 'Konumunuza en yakın camiler',
      icon: MapPinned,
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      description: 'Tema, ses, bildirim, hesaplama yöntemi',
      icon: SettingsIcon,
    },
  ];

  return (
    <div className="w-full flex flex-col gap-2 fade-in-up">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className="glass-card rounded-2xl px-4 py-3.5 flex items-center gap-3 hover:bg-[var(--surface-soft-strong)] transition text-left"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400/15 text-gold-300">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent-soft-bg)] text-[var(--accent-soft-text)] font-medium">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] truncate">{item.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
          </button>
        );
      })}
    </div>
  );
}

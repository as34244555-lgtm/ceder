import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DUAS } from '../data/duas';

export function DuasList() {
  const [openId, setOpenId] = useState<string | null>(DUAS[0]?.id ?? null);

  return (
    <div className="w-full flex flex-col gap-2">
      {DUAS.map((dua) => {
        const isOpen = openId === dua.id;
        return (
          <div key={dua.id} className="glass-card rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : dua.id)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left"
            >
              <span className="font-medium text-[var(--text-primary)]">{dua.title}</span>
              <ChevronDown
                className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 flex flex-col gap-3 fade-in-up">
                <p className="text-lg leading-loose text-gold-200 text-right" dir="rtl" lang="ar">
                  {dua.arabic}
                </p>
                <p className="text-sm text-[var(--text-secondary)] italic">{dua.transliteration}</p>
                <p className="text-sm text-[var(--text-muted)]">{dua.meaning}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

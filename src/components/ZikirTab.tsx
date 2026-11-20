import { useState } from 'react';
import { TasbihCounter } from './TasbihCounter';
import { DuasList } from './DuasList';

type SubTab = 'tasbih' | 'dualar';

export function ZikirTab() {
  const [subTab, setSubTab] = useState<SubTab>('tasbih');

  return (
    <div className="w-full flex flex-col items-center gap-4 fade-in-up">
      <div className="glass-card rounded-2xl p-1 flex w-full max-w-xs">
        {(
          [
            { id: 'tasbih', label: 'Tesbih' },
            { id: 'dualar', label: 'Dualar' },
          ] as { id: SubTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
              subTab === tab.id
                ? 'bg-gold-400/90 text-night-950'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'tasbih' ? <TasbihCounter /> : <DuasList />}
    </div>
  );
}

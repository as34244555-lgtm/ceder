import { RotateCcw } from 'lucide-react';
import { DHIKR_OPTIONS } from '../data/dhikr';
import { useTasbih } from '../hooks/useTasbih';

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // yoksay
    }
  }
}

export function TasbihCounter() {
  const { selected, count, selectDhikr, increment, reset } = useTasbih();

  const progress = Math.min(100, (count / selected.defaultTarget) * 100);
  const justCompleted = count > 0 && count % selected.defaultTarget === 0;

  const handleTap = () => {
    increment();
    vibrate(justCompleted ? [20, 40, 20] : 12);
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 w-full flex flex-col items-center gap-5">
      <div className="flex flex-wrap justify-center gap-2 w-full">
        {DHIKR_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => selectDhikr(option.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              option.id === selected.id
                ? 'bg-gold-400/90 text-night-950'
                : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:bg-[var(--surface-soft-strong)]'
            }`}
          >
            {option.turkish}
          </button>
        ))}
      </div>

      <p className="text-xl text-gold-200 font-arabic" dir="rtl" lang="ar">
        {selected.arabic}
      </p>

      <button
        type="button"
        onClick={handleTap}
        className="relative flex h-48 w-48 sm:h-56 sm:w-56 items-center justify-center rounded-full active:scale-[0.97] transition-transform"
        aria-label="Say"
      >
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#f2c14e"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 90}
            strokeDashoffset={2 * Math.PI * 90 * (1 - progress / 100)}
            className="transition-[stroke-dashoffset] duration-300 ease-out"
          />
        </svg>
        <div className="flex flex-col items-center gap-1 rounded-full bg-emerald-950/40 h-36 w-36 sm:h-40 sm:w-40 justify-center">
          <span className="text-5xl font-bold text-[var(--text-primary)] tabular-nums">{count}</span>
          <span className="text-xs text-[var(--text-muted)]">/ {selected.defaultTarget}</span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => {
          reset();
          vibrate(8);
        }}
        className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Sıfırla
      </button>
    </div>
  );
}

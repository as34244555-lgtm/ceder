import { BookOpen } from 'lucide-react';
import { getDailyWisdom } from '../data/dailyWisdom';

export function DailyWisdomCard() {
  const wisdom = getDailyWisdom();

  return (
    <div className="glass-card rounded-2xl p-4 w-full fade-in-up">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[var(--text-muted)] mb-2">
        <BookOpen className="h-3.5 w-3.5 text-gold-400" />
        Günün {wisdom.type === 'ayet' ? 'Ayeti' : 'Hadisi'}
      </div>
      <p className="text-sm text-[var(--text-primary)] leading-relaxed">“{wisdom.text}”</p>
      <p className="text-xs text-[var(--text-muted)] mt-2">{wisdom.source}</p>
    </div>
  );
}

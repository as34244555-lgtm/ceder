import { ESMAUL_HUSNA } from '../data/esmaulHusna';

export function EsmaulHusnaList() {
  return (
    <div className="w-full flex flex-col gap-4 fade-in-up">
      <p className="text-center text-sm text-[var(--text-muted)] px-2">
        Esmaü'l-Hüsna: Allah'ın (c.c.) Kur'an-ı Kerim ve hadislerde geçen 99 güzel ismi.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ESMAUL_HUSNA.map((esma) => (
          <div
            key={esma.no}
            className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-400/15 text-gold-300 text-xs font-semibold">
              {esma.no}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-lg text-gold-200 font-arabic" dir="rtl" lang="ar">
                  {esma.arabic}
                </span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {esma.transliteration}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{esma.meaning}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

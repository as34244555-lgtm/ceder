import { PRAYER_GUIDE, PRAYER_STEPS_SUMMARY } from '../data/prayerGuide';

const TYPE_COLORS: Record<string, string> = {
  farz: 'text-gold-300',
  sünnet: 'text-emerald-300',
  vacip: 'text-sky-300',
  nafile: 'text-[var(--text-muted)]',
};

export function PrayerGuideScreen() {
  return (
    <div className="w-full flex flex-col gap-4 fade-in-up">
      <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Namaz Nasıl Kılınır? (Genel Adımlar)
        </h3>
        <ol className="flex flex-col gap-2">
          {PRAYER_STEPS_SUMMARY.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-[var(--text-secondary)]">
              <span className="shrink-0 text-gold-300 font-semibold">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-2">
        {PRAYER_GUIDE.map((prayer) => (
          <div key={prayer.key} className="glass-card rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">{prayer.name}</h4>
              <span className="text-xs text-[var(--text-muted)]">{prayer.totalRakat} rekat</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {prayer.steps.map((step) => (
                <span key={step.label} className="text-xs text-[var(--text-secondary)]">
                  <span className={`font-semibold ${TYPE_COLORS[step.type]}`}>{step.rakat}</span>{' '}
                  {step.label}
                </span>
              ))}
            </div>
            {prayer.note && <p className="text-[11px] text-[var(--text-muted)]">{prayer.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

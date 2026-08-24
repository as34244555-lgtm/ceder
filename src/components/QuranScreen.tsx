import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Bookmark,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Pause,
  Play,
  Search,
} from 'lucide-react';
import { QURAN_SURAHS } from '../data/quranSurahs';
import {
  ayahAudioUrl,
  fetchSurahWithTranslation,
  loadBookmark,
  loadHatim,
  loadMemorize,
  saveBookmark,
  toggleHatimSurah,
  toggleMemorize,
  type QuranAyah,
  type QuranEditionPair,
} from '../api/quran';

const MEAL_OPTIONS: { id: QuranEditionPair; label: string }[] = [
  { id: 'tr.diyanet', label: 'Diyanet' },
  { id: 'tr.yazir', label: 'Yazır' },
  { id: 'en.sahih', label: 'Sahih (EN)' },
];

const MEAL_LABELS: Record<QuranEditionPair, string> = {
  'tr.diyanet': 'Diyanet meal',
  'tr.yazir': 'Elmalılı Yazır meal',
  'en.sahih': 'Sahih International',
};

export function QuranScreen() {
  const [query, setQuery] = useState('');
  const [surahNumber, setSurahNumber] = useState<number | null>(null);
  const [ayahs, setAyahs] = useState<QuranAyah[]>([]);
  const [meal, setMeal] = useState<QuranEditionPair>('tr.diyanet');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [bookmark, setBookmark] = useState(() => loadBookmark());
  const [hatim, setHatim] = useState(() => loadHatim());
  const [memorizeMap, setMemorizeMap] = useState(() => loadMemorize());
  const [memorizeMode, setMemorizeMode] = useState(false);
  const [revealedAyahs, setRevealedAyahs] = useState<Set<number>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filtered = QURAN_SURAHS.filter(
    (s) =>
      !query.trim() ||
      s.name.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr')) ||
      String(s.number) === query.trim(),
  );

  useEffect(() => {
    if (surahNumber == null) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setRevealedAyahs(new Set());
    void fetchSurahWithTranslation(surahNumber, meal)
      .then((data) => {
        if (!cancelled) setAyahs(data);
      })
      .catch(() => {
        if (!cancelled) setError('Sure yüklenemedi. İnternet bağlantınızı kontrol edin.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [surahNumber, meal]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const togglePlay = (ayah: QuranAyah) => {
    if (playing === ayah.globalNumber) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.src = ayahAudioUrl(ayah.globalNumber);
    audio.onended = () => setPlaying(null);
    void audio.play().then(() => setPlaying(ayah.globalNumber)).catch(() => setPlaying(null));
  };

  const handleBookmark = (ayah: number) => {
    if (surahNumber == null) return;
    const next = { surah: surahNumber, ayah };
    saveBookmark(next);
    setBookmark(next);
  };

  const handleHatimToggle = (surah: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setHatim(toggleHatimSurah(surah));
  };

  const handleMemorizeToggle = (ayah: number) => {
    if (surahNumber == null) return;
    setMemorizeMap(toggleMemorize(surahNumber, ayah));
  };

  const revealAyah = (ayah: number) => {
    setRevealedAyahs((prev) => new Set(prev).add(ayah));
  };

  const isAyahMemorized = (ayah: number) => {
    if (surahNumber == null) return false;
    return memorizeMap[`${surahNumber}:${ayah}`] === true;
  };

  const openBookmark = () => {
    if (!bookmark) return;
    setSurahNumber(bookmark.surah);
  };

  if (surahNumber != null) {
    const meta = QURAN_SURAHS.find((s) => s.number === surahNumber);

    return (
      <div className="w-full flex flex-col gap-3 fade-in-up">
        <button
          type="button"
          onClick={() => {
            audioRef.current?.pause();
            setPlaying(null);
            setSurahNumber(null);
            setAyahs([]);
          }}
          className="self-start text-xs text-gold-300 hover:underline"
        >
          ← Sure listesi
        </button>

        <div className="glass-card rounded-2xl px-4 py-3 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {meta?.number}. {meta?.name}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {meta?.revelationType} · {meta?.numberOfAyahs} ayet · {MEAL_LABELS[meal]} · Alafasy
                tilavet
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleHatimToggle(surahNumber)}
              className={`shrink-0 rounded-lg p-2 transition ${
                hatim.includes(surahNumber)
                  ? 'bg-emerald-400/20 text-emerald-300'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-soft)]'
              }`}
              aria-label={hatim.includes(surahNumber) ? 'Hatimden çıkar' : 'Hatim olarak işaretle'}
            >
              <Check className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {MEAL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMeal(opt.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  meal === opt.id
                    ? 'bg-gold-400/90 text-night-950'
                    : 'bg-[var(--surface-soft)] text-[var(--text-muted)] hover:bg-[var(--surface-soft-strong)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMemorizeMode((v) => !v)}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition ${
              memorizeMode
                ? 'bg-gold-400/20 text-gold-300 border border-gold-400/40'
                : 'bg-[var(--surface-soft)] text-[var(--text-muted)] border border-[var(--border-soft)]'
            }`}
          >
            {memorizeMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            Ezber modu {memorizeMode ? 'açık' : 'kapalı'}
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] px-1">
            <Loader2 className="h-4 w-4 animate-spin" /> Sure yükleniyor…
          </div>
        )}
        {error && <p className="text-xs text-red-300/90 px-1">{error}</p>}

        <div className="flex flex-col gap-3">
          {ayahs.map((ayah) => {
            const memorized = isAyahMemorized(ayah.numberInSurah);
            const isCurrentBookmark =
              bookmark?.surah === surahNumber && bookmark.ayah === ayah.numberInSurah;
            const showTranslation =
              !memorizeMode || revealedAyahs.has(ayah.numberInSurah) || memorized;

            return (
              <div
                key={ayah.numberInSurah}
                className={`glass-card rounded-2xl px-4 py-3 flex flex-col gap-2 ${
                  isCurrentBookmark ? 'ring-1 ring-gold-400/40' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--text-muted)]">
                      Ayet {ayah.numberInSurah}
                    </span>
                    {memorized && (
                      <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] text-emerald-300">
                        Ezberlendi
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleBookmark(ayah.numberInSurah)}
                      className={`rounded-lg p-1.5 transition ${
                        isCurrentBookmark
                          ? 'text-gold-300 bg-gold-400/15'
                          : 'text-[var(--text-muted)] hover:bg-gold-400/10 hover:text-gold-300'
                      }`}
                      aria-label="Yer imi"
                    >
                      <Bookmark className={`h-4 w-4 ${isCurrentBookmark ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMemorizeToggle(ayah.numberInSurah)}
                      className={`rounded-lg p-1.5 transition ${
                        memorized
                          ? 'text-emerald-300 bg-emerald-400/15'
                          : 'text-[var(--text-muted)] hover:bg-emerald-400/10 hover:text-emerald-300'
                      }`}
                      aria-label="Ezber işareti"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePlay(ayah)}
                      className="rounded-lg p-1.5 text-gold-300 hover:bg-gold-400/10"
                      aria-label="Tilavet"
                    >
                      {playing === ayah.globalNumber ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <p
                  className="text-xl leading-loose text-[var(--text-primary)] text-right"
                  dir="rtl"
                  lang="ar"
                >
                  {ayah.arabic}
                </p>
                {showTranslation ? (
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {ayah.translation}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => revealAyah(ayah.numberInSurah)}
                    className="self-start rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-soft-strong)] transition"
                  >
                    Meali göster
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const hatimCount = hatim.length;

  return (
    <div className="w-full flex flex-col gap-3 fade-in-up">
      <div className="glass-card rounded-2xl px-4 py-3 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400/15 text-gold-300">
          <BookOpen className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-[var(--text-primary)]">Kur’an-ı Kerim</p>
            <span className="shrink-0 rounded-full bg-gold-400/15 px-2.5 py-0.5 text-[11px] font-semibold text-gold-300">
              Hatim {hatimCount}/114
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Arapça metin, meal seçimi ve tilavet. Açılan sureler cihazda önbelleğe alınır.
          </p>
        </div>
      </div>

      {bookmark && (
        <button
          type="button"
          onClick={openBookmark}
          className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 text-left hover:bg-[var(--surface-soft-strong)] transition"
        >
          <Bookmark className="h-4 w-4 shrink-0 text-gold-300 fill-gold-300" />
          <div className="min-w-0">
            <span className="inline-block rounded-full bg-gold-400/15 px-2 py-0.5 text-[10px] font-semibold text-gold-300 mb-1">
              Kaldığın yer
            </span>
            <p className="text-sm text-[var(--text-primary)]">
              {QURAN_SURAHS.find((s) => s.number === bookmark.surah)?.name ?? `Sure ${bookmark.surah}`}
              {' · '}Ayet {bookmark.ayah}
            </p>
          </div>
        </button>
      )}

      <div className="flex flex-wrap gap-2">
        {MEAL_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setMeal(opt.id)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
              meal === opt.id
                ? 'bg-gold-400/90 text-night-950'
                : 'bg-[var(--surface-soft)] text-[var(--text-muted)] hover:bg-[var(--surface-soft-strong)]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <label className="glass-card rounded-2xl px-3 py-2 flex items-center gap-2">
        <Search className="h-4 w-4 text-[var(--text-muted)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sure ara (ör. Yâsîn)"
          className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-faint)]"
        />
      </label>

      <div className="flex flex-col gap-1.5 max-h-[min(62vh,640px)] overflow-y-auto">
        {filtered.map((s) => {
          const completed = hatim.includes(s.number);
          const isBookmarkSurah = bookmark?.surah === s.number;

          return (
            <button
              key={s.number}
              type="button"
              onClick={() => setSurahNumber(s.number)}
              className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 text-left hover:bg-[var(--surface-soft-strong)] transition"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                  completed ? 'bg-emerald-400/20 text-emerald-300' : 'text-gold-300'
                }`}
              >
                {completed ? <Check className="h-4 w-4" /> : s.number}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm text-[var(--text-primary)]">{s.name}</p>
                  {isBookmarkSurah && (
                    <span className="rounded-full bg-gold-400/15 px-2 py-0.5 text-[10px] font-medium text-gold-300">
                      Kaldığın yer
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {s.revelationType} · {s.numberOfAyahs} ayet
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => handleHatimToggle(s.number, e)}
                className={`shrink-0 rounded-lg p-2 transition ${
                  completed
                    ? 'text-emerald-300 bg-emerald-400/10'
                    : 'text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--surface-soft)]'
                }`}
                aria-label={completed ? 'Hatimden çıkar' : 'Hatim olarak işaretle'}
              >
                <Check className="h-4 w-4" />
              </button>
            </button>
          );
        })}
      </div>
    </div>
  );
}

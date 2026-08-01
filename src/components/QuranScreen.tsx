import { useEffect, useRef, useState } from 'react';
import { BookOpen, Loader2, Pause, Play, Search } from 'lucide-react';
import { QURAN_SURAHS } from '../data/quranSurahs';
import { ayahAudioUrl, fetchSurahWithTranslation, type QuranAyah } from '../api/quran';

export function QuranScreen() {
  const [query, setQuery] = useState('');
  const [surahNumber, setSurahNumber] = useState<number | null>(null);
  const [ayahs, setAyahs] = useState<QuranAyah[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
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
    void fetchSurahWithTranslation(surahNumber)
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
  }, [surahNumber]);

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
        <div className="glass-card rounded-2xl px-4 py-3">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {meta?.number}. {meta?.name}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {meta?.revelationType} · {meta?.numberOfAyahs} ayet · Diyanet meal · Alafasy tilavet
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] px-1">
            <Loader2 className="h-4 w-4 animate-spin" /> Sure yükleniyor…
          </div>
        )}
        {error && <p className="text-xs text-red-300/90 px-1">{error}</p>}
        <div className="flex flex-col gap-3">
          {ayahs.map((ayah) => (
            <div key={ayah.numberInSurah} className="glass-card rounded-2xl px-4 py-3 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-[var(--text-muted)]">Ayet {ayah.numberInSurah}</span>
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
              <p
                className="text-xl leading-loose text-[var(--text-primary)] text-right"
                dir="rtl"
                lang="ar"
              >
                {ayah.arabic}
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{ayah.translation}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3 fade-in-up">
      <div className="glass-card rounded-2xl px-4 py-3 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400/15 text-gold-300">
          <BookOpen className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Kur’an-ı Kerim</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Arapça metin, Diyanet Türkçe meal ve tilavet. Açılan sureler cihazda önbelleğe alınır.
          </p>
        </div>
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
        {filtered.map((s) => (
          <button
            key={s.number}
            type="button"
            onClick={() => setSurahNumber(s.number)}
            className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 text-left hover:bg-[var(--surface-soft-strong)] transition"
          >
            <span className="w-8 text-center text-xs font-semibold text-gold-300">{s.number}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-[var(--text-primary)]">{s.name}</p>
              <p className="text-[11px] text-[var(--text-muted)]">
                {s.revelationType} · {s.numberOfAyahs} ayet
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

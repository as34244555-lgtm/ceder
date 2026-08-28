import { AlertTriangle, Loader2, WifiOff } from 'lucide-react';

interface StatusBannerProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  offlineCache?: boolean;
}

export function StatusBanner({ loading, error, onRetry, offlineCache }: StatusBannerProps) {
  if (!loading && !error && !offlineCache) return null;

  if (!loading && !error && offlineCache) {
    return (
      <div className="w-full rounded-2xl px-4 py-2.5 text-xs flex items-center justify-center gap-2 fade-in-up bg-[var(--surface-soft)] text-[var(--text-muted)] border border-[var(--border-soft)]">
        <WifiOff className="h-3.5 w-3.5" />
        <span>Çevrimdışı önbellekten gösteriliyor</span>
        <button type="button" onClick={onRetry} className="underline underline-offset-2">
          Yenile
        </button>
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-2xl px-4 py-3 text-sm flex items-center justify-center gap-2 fade-in-up ${
        error ? 'bg-red-500/15 text-red-200 border border-red-400/30' : 'text-[var(--text-secondary)]'
      }`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {error && <AlertTriangle className="h-4 w-4" />}
      <span>{loading ? 'Vakitler getiriliyor…' : error}</span>
      {error && (
        <button
          type="button"
          onClick={onRetry}
          className="underline underline-offset-2 hover:text-[var(--text-primary)] ml-1"
        >
          Tekrar dene
        </button>
      )}
    </div>
  );
}

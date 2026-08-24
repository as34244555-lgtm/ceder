import { MapPin, Bell, Sparkles } from 'lucide-react';

interface OnboardingPermissionsProps {
  onComplete: (opts: { notificationsGranted: boolean; locationRequested: boolean }) => void;
  onRequestNotifications: () => Promise<boolean>;
  onRequestLocation: () => void;
}

export function OnboardingPermissions({
  onComplete,
  onRequestNotifications,
  onRequestLocation,
}: OnboardingPermissionsProps) {
  const handleAllow = async () => {
    const notificationsGranted = await onRequestNotifications();
    onRequestLocation();
    onComplete({ notificationsGranted, locationRequested: true });
  };

  const handleSkip = () => {
    onComplete({ notificationsGranted: false, locationRequested: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md glass-card rounded-3xl p-6 flex flex-col gap-5 fade-in-up">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400/15 text-gold-300">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">Ezan Vakti Ultra</p>
            <p className="text-xs text-[var(--text-muted)]">İzinler — bir kez sorulur</p>
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Ezan vakti geldiğinde sesli uyarı ve bildirim gönderebilmemiz, konumunuza göre doğru
          vakitleri gösterebilmemiz için izinlere ihtiyacımız var. Bu ekran yalnızca bir kez
          çıkar.
        </p>

        <ul className="flex flex-col gap-3">
          <li className="flex gap-3 rounded-2xl bg-[var(--surface-soft)] px-4 py-3">
            <Bell className="h-5 w-5 text-gold-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Bildirimler</p>
              <p className="text-xs text-[var(--text-muted)]">
                Ezan vakti ve hatırlatmalar — kalıcı izin (bir kez)
              </p>
            </div>
          </li>
          <li className="flex gap-3 rounded-2xl bg-[var(--surface-soft)] px-4 py-3">
            <MapPin className="h-5 w-5 text-gold-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Konum</p>
              <p className="text-xs text-[var(--text-muted)]">
                Bulunduğunuz yere göre namaz vakitleri
              </p>
            </div>
          </li>
        </ul>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void handleAllow()}
            className="w-full rounded-2xl bg-gold-400/90 text-night-950 py-3.5 text-sm font-semibold hover:bg-gold-300 transition"
          >
            İzin ver ve devam et
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="w-full rounded-2xl py-2.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            Şimdilik geç
          </button>
        </div>
      </div>
    </div>
  );
}

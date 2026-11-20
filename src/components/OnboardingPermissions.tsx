import { MapPin, Bell, Compass, Sparkles, Battery, AlarmClock } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { DEVELOPER_NAME } from '../constants/legal';

interface OnboardingPermissionsProps {
  onComplete: (opts: {
    notificationsGranted: boolean;
    locationGranted: boolean;
    compassGranted: boolean;
  }) => void;
  /** Tek jestte tüm izinleri ister; sonuçları döner. */
  onRequestAllPermissions: () => Promise<{
    notificationsGranted: boolean;
    locationGranted: boolean;
    compassGranted: boolean;
  }>;
}

export function OnboardingPermissions({
  onComplete,
  onRequestAllPermissions,
}: OnboardingPermissionsProps) {
  const isNative = Capacitor.isNativePlatform();

  const handleAllow = async () => {
    const result = await onRequestAllPermissions();
    onComplete(result);
  };

  const handleSkip = () => {
    onComplete({
      notificationsGranted: false,
      locationGranted: false,
      compassGranted: false,
    });
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
            <p className="text-xs text-[var(--text-muted)]">Geliştirici: {DEVELOPER_NAME}</p>
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Ezan uyarısı, doğru vakitler ve kıble pusulası için gerekli izinleri tek seferde
          istiyoruz. Bu ekran bir daha sorulmaz.
        </p>

        <ul className="flex flex-col gap-3">
          <li className="flex gap-3 rounded-2xl bg-[var(--surface-soft)] px-4 py-3">
            <Bell className="h-5 w-5 text-gold-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Bildirimler</p>
              <p className="text-xs text-[var(--text-muted)]">Ezan vakti ve hatırlatmalar</p>
            </div>
          </li>
          <li className="flex gap-3 rounded-2xl bg-[var(--surface-soft)] px-4 py-3">
            <MapPin className="h-5 w-5 text-gold-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Konum</p>
              <p className="text-xs text-[var(--text-muted)]">Bulunduğunuz yere göre vakitler ve kıble</p>
            </div>
          </li>
          <li className="flex gap-3 rounded-2xl bg-[var(--surface-soft)] px-4 py-3">
            <Compass className="h-5 w-5 text-gold-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Hareket / pusula</p>
              <p className="text-xs text-[var(--text-muted)]">Kıble yönünü canlı göstermek için</p>
            </div>
          </li>
          {isNative && (
            <>
              <li className="flex gap-3 rounded-2xl bg-[var(--surface-soft)] px-4 py-3">
                <AlarmClock className="h-5 w-5 text-gold-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Tam zamanlı alarm</p>
                  <p className="text-xs text-[var(--text-muted)]">Vakitinde ezan için (Android)</p>
                </div>
              </li>
              <li className="flex gap-3 rounded-2xl bg-[var(--surface-soft)] px-4 py-3">
                <Battery className="h-5 w-5 text-gold-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Pil istisnası</p>
                  <p className="text-xs text-[var(--text-muted)]">Arka planda çalışmaya devam etsin</p>
                </div>
              </li>
            </>
          )}
        </ul>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void handleAllow()}
            className="w-full rounded-2xl bg-gold-400/90 text-night-950 py-3.5 text-sm font-semibold hover:bg-gold-300 transition"
          >
            Tüm izinleri ver
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

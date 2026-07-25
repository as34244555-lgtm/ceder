import { Bell, BellOff, Volume2, VolumeX, Play, Moon, Sun, MonitorSmartphone } from 'lucide-react';
import type { AppSettings, ThemeMode } from '../types';
import { CALCULATION_METHODS } from '../data/methods';
import { playFullAdhan, playPrayerChime, primeAudio } from '../utils/sound';
import { InstallPrompt } from './InstallPrompt';

interface SettingsScreenProps {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  notificationPermission: NotificationPermission | 'unsupported';
  onRequestNotificationPermission: () => void;
}

const REMINDER_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'Hatırlatma yok' },
  { value: 5, label: '5 dakika önce' },
  { value: 10, label: '10 dakika önce' },
  { value: 15, label: '15 dakika önce' },
];

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Moon }[] = [
  { value: 'dark', label: 'Koyu', icon: Moon },
  { value: 'light', label: 'Açık', icon: Sun },
  { value: 'system', label: 'Sistem', icon: MonitorSmartphone },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 w-full flex flex-col gap-3">
      <h3 className="text-xs uppercase tracking-[0.15em] text-[var(--text-muted)] font-semibold">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function SettingsScreen({
  settings,
  onChange,
  notificationPermission,
  onRequestNotificationPermission,
}: SettingsScreenProps) {
  const toggleSound = () => onChange({ ...settings, soundEnabled: !settings.soundEnabled });

  const toggleNotifications = () => {
    if (!settings.notificationsEnabled && notificationPermission !== 'granted') {
      onRequestNotificationPermission();
    }
    onChange({ ...settings, notificationsEnabled: !settings.notificationsEnabled });
  };

  const handlePreview = () => {
    primeAudio();
    if (settings.adhanSoundMode === 'adhan') playFullAdhan(true);
    else playPrayerChime();
  };

  return (
    <div className="w-full flex flex-col gap-4 fade-in-up">
      <Section title="Görünüm">
        <div className="flex gap-2">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = settings.theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...settings, theme: opt.value })}
                className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-medium transition ${
                  isActive
                    ? 'bg-gold-400/90 text-night-950'
                    : 'bg-[var(--surface-soft)] text-[var(--text-muted)] hover:bg-[var(--surface-soft-strong)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Saat Formatı">
        <div className="flex gap-2">
          {(['24', '12'] as const).map((format) => (
            <button
              key={format}
              type="button"
              onClick={() => onChange({ ...settings, timeFormat: format })}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
                settings.timeFormat === format
                  ? 'bg-gold-400/90 text-night-950'
                  : 'bg-[var(--surface-soft)] text-[var(--text-muted)] hover:bg-[var(--surface-soft-strong)]'
              }`}
            >
              {format === '24' ? '24 Saat' : '12 Saat (ÖÖ/ÖS)'}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Ezan Uyarısı">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={toggleSound}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              settings.soundEnabled
                ? 'bg-[var(--accent-soft-bg)] text-[var(--accent-soft-text)] border border-[var(--accent-soft-border)]'
                : 'bg-[var(--surface-soft)] text-[var(--text-muted)] border border-[var(--border-soft)]'
            }`}
          >
            {settings.soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
            Ses {settings.soundEnabled ? 'Açık' : 'Kapalı'}
          </button>

          <div className="flex gap-2">
            {(
              [
                { value: 'adhan', label: 'Gerçek Ezan Sesi' },
                { value: 'chime', label: 'Kısa Nağme' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...settings, adhanSoundMode: opt.value })}
                disabled={!settings.soundEnabled}
                className={`flex-1 rounded-xl py-2.5 text-xs font-medium transition disabled:opacity-40 ${
                  settings.adhanSoundMode === opt.value
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
            onClick={handlePreview}
            disabled={!settings.soundEnabled}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-medium bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:bg-[var(--surface-soft-strong)] transition disabled:opacity-40 self-start"
          >
            <Play className="h-3.5 w-3.5" /> Sesi önizle
          </button>

          <select
            value={settings.reminderMinutesBefore ?? ''}
            onChange={(e) =>
              onChange({
                ...settings,
                reminderMinutesBefore: e.target.value === '' ? null : Number(e.target.value),
              })
            }
            className="rounded-xl bg-[var(--surface-soft)] border border-[var(--border-soft)] px-4 py-2.5 text-sm text-[var(--text-secondary)] outline-none cursor-pointer [&>option]:text-black"
            aria-label="Vakit öncesi hatırlatma"
          >
            {REMINDER_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value ?? ''}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Bildirimler">
        <button
          type="button"
          onClick={toggleNotifications}
          disabled={notificationPermission === 'unsupported'}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${
            settings.notificationsEnabled
              ? 'bg-[var(--accent-soft-bg)] text-[var(--accent-soft-text)] border border-[var(--accent-soft-border)]'
              : 'bg-[var(--surface-soft)] text-[var(--text-muted)] border border-[var(--border-soft)]'
          }`}
        >
          {settings.notificationsEnabled ? (
            <Bell className="h-4 w-4" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
          Bildirimler {settings.notificationsEnabled ? 'Açık' : 'Kapalı'}
        </button>
      </Section>

      <Section title="Hesaplama Yöntemi">
        <select
          value={settings.calculationMethod}
          onChange={(e) => onChange({ ...settings, calculationMethod: Number(e.target.value) })}
          className="rounded-xl bg-[var(--surface-soft)] border border-[var(--border-soft)] px-4 py-2.5 text-sm text-[var(--text-secondary)] outline-none cursor-pointer [&>option]:text-black"
        >
          {CALCULATION_METHODS.map((method) => (
            <option key={method.id} value={method.id}>
              {method.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-[var(--text-muted)]">
          Türkiye için varsayılan olarak Diyanet İşleri Başkanlığı yöntemi önerilir.
        </p>
      </Section>

      <Section title="Uygulama">
        <InstallPrompt />
        <p className="text-xs text-[var(--text-muted)]">
          Bu uygulamayı ana ekranınıza ekleyerek, tıpkı bir mobil uygulama gibi tam ekran ve
          çevrimdışı erişimle kullanabilirsiniz.
        </p>
      </Section>
    </div>
  );
}

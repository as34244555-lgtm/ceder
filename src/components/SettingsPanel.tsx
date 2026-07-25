import { Bell, BellOff, Volume2, VolumeX } from 'lucide-react';
import type { AppSettings } from '../types';

interface SettingsPanelProps {
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

export function SettingsPanel({
  settings,
  onChange,
  notificationPermission,
  onRequestNotificationPermission,
}: SettingsPanelProps) {
  const toggleSound = () => onChange({ ...settings, soundEnabled: !settings.soundEnabled });

  const toggleNotifications = () => {
    if (!settings.notificationsEnabled && notificationPermission !== 'granted') {
      onRequestNotificationPermission();
    }
    onChange({ ...settings, notificationsEnabled: !settings.notificationsEnabled });
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3 fade-in-up">
      <button
        type="button"
        onClick={toggleSound}
        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
          settings.soundEnabled
            ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
            : 'bg-white/5 text-emerald-100/50 border border-white/10'
        }`}
      >
        {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        Ezan Sesi {settings.soundEnabled ? 'Açık' : 'Kapalı'}
      </button>

      <button
        type="button"
        onClick={toggleNotifications}
        disabled={notificationPermission === 'unsupported'}
        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${
          settings.notificationsEnabled
            ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
            : 'bg-white/5 text-emerald-100/50 border border-white/10'
        }`}
      >
        {settings.notificationsEnabled ? (
          <Bell className="h-4 w-4" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
        Bildirimler {settings.notificationsEnabled ? 'Açık' : 'Kapalı'}
      </button>

      <select
        value={settings.reminderMinutesBefore ?? ''}
        onChange={(e) =>
          onChange({
            ...settings,
            reminderMinutesBefore: e.target.value === '' ? null : Number(e.target.value),
          })
        }
        className="rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-emerald-100 outline-none cursor-pointer [&>option]:text-black"
        aria-label="Vakit öncesi hatırlatma"
      >
        {REMINDER_OPTIONS.map((opt) => (
          <option key={opt.label} value={opt.value ?? ''}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

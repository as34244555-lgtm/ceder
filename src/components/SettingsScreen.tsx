import { useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Play,
  Moon,
  Sun,
  MonitorSmartphone,
  Square,
  Download,
  Upload,
  Battery,
  AlarmClock,
  Baby,
  Globe,
} from 'lucide-react';
import type { AdhanSoundId, AdhanSoundMode, AppSettings, ThemeMode, TrackablePrayerKey } from '../types';
import { CALCULATION_METHODS } from '../data/methods';
import { ADHAN_SOUNDS } from '../data/adhanSounds';
import { playFullAdhan, playPrayerChime, primeAudio, stopFullAdhan, unlockAdhanAudio } from '../utils/sound';
import { exportAllData, importAllData } from '../utils/storage';
import { LANG_OPTIONS } from '../i18n/translations';
import { PrayerNative } from '../plugins/prayerNative';
import { InstallPrompt } from './InstallPrompt';
import { LocationBar } from './LocationBar';
import { FavoriteCitiesBar } from './FavoriteCitiesBar';
import type { FavoriteCity } from '../types';

interface SettingsScreenProps {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  notificationPermission: NotificationPermission | 'unsupported';
  onRequestNotificationPermission: () => void;
  selectedCity: string;
  onCityChange: (city: string, country: string) => void;
  onUseLocation: () => void;
  locationLoading: boolean;
  activeLabel: string;
  isUsingGps: boolean;
  favorites: FavoriteCity[];
  activeFavoriteCity: string;
  isCurrentFavorite: boolean;
  onToggleFavorite: () => void;
  onRemoveFavorite: (id: string) => void;
  onSelectFavorite: (city: string, country: string) => void;
}

const REMINDER_OPTIONS = [5, 10, 15, 30, 45] as const;
const IQAMAH_OPTIONS = [0, 10, 15, 20, 30] as const;

const PRAYER_LABELS: { key: TrackablePrayerKey; label: string }[] = [
  { key: 'imsak', label: 'İmsak / Sabah' },
  { key: 'ogle', label: 'Öğle' },
  { key: 'ikindi', label: 'İkindi' },
  { key: 'aksam', label: 'Akşam' },
  { key: 'yatsi', label: 'Yatsı' },
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
  selectedCity,
  onCityChange,
  onUseLocation,
  locationLoading,
  activeLabel,
  isUsingGps,
  favorites,
  activeFavoriteCity,
  isCurrentFavorite,
  onToggleFavorite,
  onRemoveFavorite,
  onSelectFavorite,
}: SettingsScreenProps) {
  const importRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const isNative = Capacitor.isNativePlatform();

  const toggleSound = () => onChange({ ...settings, soundEnabled: !settings.soundEnabled });

  const toggleNotifications = () => {
    if (!settings.notificationsEnabled && notificationPermission !== 'granted') {
      onRequestNotificationPermission();
    }
    onChange({ ...settings, notificationsEnabled: !settings.notificationsEnabled });
  };

  const toggleOngoing = () => {
    const next = !settings.ongoingNotification;
    onChange({ ...settings, ongoingNotification: next });
    if (next && settings.notificationsEnabled) {
      void PrayerNative.startOngoing().catch(() => undefined);
    } else {
      void PrayerNative.stopOngoing().catch(() => undefined);
    }
  };

  const toggleReminder = (minutes: number) => {
    const list = settings.reminderMinutesList ?? [];
    const next = list.includes(minutes)
      ? list.filter((m) => m !== minutes)
      : [...list, minutes].sort((a, b) => a - b);
    onChange({ ...settings, reminderMinutesList: next, reminderMinutesBefore: null });
  };

  const setMode = (mode: AdhanSoundMode) => onChange({ ...settings, adhanSoundMode: mode });

  const handlePreview = (id?: AdhanSoundId) => {
    primeAudio();
    unlockAdhanAudio();
    if (settings.adhanSoundMode === 'chime') {
      playPrayerChime();
      return;
    }
    playFullAdhan(true, 'Ezan Önizleme', id ?? settings.adhanSoundId);
  };

  const handleExport = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ezan-vakti-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importAllData(String(reader.result ?? ''));
      setImportStatus(ok ? 'ok' : 'error');
      if (ok) window.location.reload();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="w-full flex flex-col gap-4 fade-in-up">
      <Section title="Konum">
        <p className="text-xs text-[var(--text-muted)]">
          Şehir seçin veya GPS ile tam konum kullanın. Ana ekrandaki vakitler buna göre
          hesaplanır.
        </p>
        <LocationBar
          selectedCity={selectedCity}
          onCityChange={onCityChange}
          onUseLocation={onUseLocation}
          locationLoading={locationLoading}
          activeLabel={activeLabel}
          isUsingGps={isUsingGps}
        />
        <FavoriteCitiesBar
          favorites={favorites}
          activeCity={activeFavoriteCity}
          isCurrentFavorite={isCurrentFavorite}
          onSelect={onSelectFavorite}
          onToggleCurrent={onToggleFavorite}
          onRemove={onRemoveFavorite}
        />
      </Section>

      <Section title="Dil">
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <Globe className="h-4 w-4 shrink-0" />
          <p className="text-xs">Uygulama dili (bazı ekranlar kademeli güncellenir)</p>
        </div>
        <div className="flex gap-2">
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ ...settings, language: opt.id })}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
                settings.language === opt.id
                  ? 'bg-gold-400/90 text-night-950'
                  : 'bg-[var(--surface-soft)] text-[var(--text-muted)] hover:bg-[var(--surface-soft-strong)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Section>

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

      <Section title="Çocuk Modu">
        <button
          type="button"
          onClick={() => onChange({ ...settings, kidsMode: !settings.kidsMode })}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            settings.kidsMode
              ? 'bg-[var(--accent-soft-bg)] text-[var(--accent-soft-text)] border border-[var(--accent-soft-border)]'
              : 'bg-[var(--surface-soft)] text-[var(--text-muted)] border border-[var(--border-soft)]'
          }`}
        >
          <Baby className="h-4 w-4" />
          Çocuk modu {settings.kidsMode ? 'açık' : 'kapalı'}
        </button>
        <p className="text-xs text-[var(--text-muted)]">
          Basitleştirilmiş arayüz ve daha büyük dokunma alanları.
        </p>
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

      <Section title="Kamet Süresi">
        <p className="text-xs text-[var(--text-muted)]">
          Ezan sonrası kamet bildirimi için dakika. 0 = kapalı.
        </p>
        <div className="flex flex-wrap gap-2">
          {IQAMAH_OPTIONS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => onChange({ ...settings, iqamahMinutes: minutes })}
              className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                settings.iqamahMinutes === minutes
                  ? 'bg-gold-400/90 text-night-950'
                  : 'bg-[var(--surface-soft)] text-[var(--text-muted)] hover:bg-[var(--surface-soft-strong)]'
              }`}
            >
              {minutes === 0 ? 'Kapalı' : `${minutes} dk`}
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
            {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            Ses {settings.soundEnabled ? 'Açık' : 'Kapalı'}
          </button>

          <div className="flex gap-2">
            {(
              [
                { value: 'adhan' as const, label: 'Gerçek ezan' },
                { value: 'chime' as const, label: 'Kısa nağme' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={!settings.soundEnabled}
                onClick={() => setMode(opt.value)}
                className={`flex-1 rounded-xl py-2 text-xs font-medium transition disabled:opacity-40 ${
                  settings.adhanSoundMode === opt.value
                    ? 'bg-gold-400/90 text-night-950'
                    : 'bg-[var(--surface-soft)] text-[var(--text-muted)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {settings.adhanSoundMode === 'adhan' && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[var(--text-muted)]">
                Yalnızca kamu malı / CC0 ezan kayıtları (Mekke, Medine, Sabah Fakhry, KLCC).
              </p>
              {ADHAN_SOUNDS.map((sound) => {
                const active = settings.adhanSoundId === sound.id;
                return (
                  <div
                    key={sound.id}
                    className={`rounded-xl px-3 py-2.5 flex items-center gap-2 border ${
                      active
                        ? 'border-gold-400/50 bg-gold-400/10'
                        : 'border-[var(--border-soft)] bg-[var(--surface-soft)]'
                    }`}
                  >
                    <button
                      type="button"
                      disabled={!settings.soundEnabled}
                      onClick={() => onChange({ ...settings, adhanSoundId: sound.id })}
                      className="flex-1 text-left disabled:opacity-40"
                    >
                      <p className="text-sm text-[var(--text-primary)]">{sound.label}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{sound.description}</p>
                    </button>
                    <button
                      type="button"
                      disabled={!settings.soundEnabled}
                      onClick={() => handlePreview(sound.id)}
                      className="rounded-lg p-2 text-gold-300 hover:bg-gold-400/10 disabled:opacity-40"
                      aria-label="Önizle"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}

              <label className="flex flex-col gap-1.5 text-xs text-[var(--text-muted)] mt-1">
                Sabah (imsak) için ayrı ezan
                <select
                  value={settings.fajrAdhanSoundId ?? 'same'}
                  disabled={!settings.soundEnabled}
                  onChange={(e) => {
                    const v = e.target.value;
                    onChange({
                      ...settings,
                      fajrAdhanSoundId: v === 'same' ? null : (v as AdhanSoundId),
                    });
                  }}
                  className="rounded-xl bg-[var(--surface-soft)] border border-[var(--border-soft)] px-3 py-2 text-sm text-[var(--text-secondary)] outline-none disabled:opacity-40 [&>option]:text-black"
                >
                  <option value="same">Genel sesle aynı</option>
                  {ADHAN_SOUNDS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handlePreview()}
              disabled={!settings.soundEnabled}
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-medium bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:bg-[var(--surface-soft-strong)] transition disabled:opacity-40"
            >
              <Play className="h-3.5 w-3.5" />
              Seçili sesi önizle
            </button>
            <button
              type="button"
              onClick={() => stopFullAdhan()}
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium bg-[var(--surface-soft)] text-[var(--text-muted)]"
            >
              <Square className="h-3.5 w-3.5" />
              Durdur
            </button>
          </div>
        </div>
      </Section>

      <Section title="Vakit Bazında Uyarı">
        <p className="text-xs text-[var(--text-muted)]">
          Kapalı vakitlerde ses ve bildirim çalmaz.
        </p>
        <div className="flex flex-wrap gap-2">
          {PRAYER_LABELS.map(({ key, label }) => {
            const active = settings.enabledPrayers?.[key] !== false;
            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  onChange({
                    ...settings,
                    enabledPrayers: { ...settings.enabledPrayers, [key]: !active },
                  })
                }
                className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                  active
                    ? 'bg-gold-400/90 text-night-950'
                    : 'bg-[var(--surface-soft)] text-[var(--text-muted)]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Vakit Öncesi Hatırlatmalar">
        <p className="text-xs text-[var(--text-muted)]">
          Birden fazla süre seçebilirsiniz. Android uygulamasında kapalıyken de zamanlanır.
        </p>
        <div className="flex flex-wrap gap-2">
          {REMINDER_OPTIONS.map((minutes) => {
            const active = (settings.reminderMinutesList ?? []).includes(minutes);
            return (
              <button
                key={minutes}
                type="button"
                onClick={() => toggleReminder(minutes)}
                className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                  active
                    ? 'bg-gold-400/90 text-night-950'
                    : 'bg-[var(--surface-soft)] text-[var(--text-muted)] hover:bg-[var(--surface-soft-strong)]'
                }`}
              >
                {minutes} dk önce
              </button>
            );
          })}
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
        <p className="text-xs text-[var(--text-muted)]">
          Play Store / Android sürümünde Local Notifications ile vakitler önceden zamanlanır.
        </p>

        <button
          type="button"
          onClick={toggleOngoing}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            settings.ongoingNotification
              ? 'bg-[var(--accent-soft-bg)] text-[var(--accent-soft-text)] border border-[var(--accent-soft-border)]'
              : 'bg-[var(--surface-soft)] text-[var(--text-muted)] border border-[var(--border-soft)]'
          }`}
        >
          <Bell className="h-4 w-4" />
          Kalıcı durum bildirimi {settings.ongoingNotification ? 'açık' : 'kapalı'}
        </button>
        <p className="text-xs text-[var(--text-muted)]">
          Android’de sonraki vakitleri bildirim çubuğunda gösterir (foreground service).
        </p>

        {isNative && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => void PrayerNative.openBatterySettings()}
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:bg-[var(--surface-soft-strong)] transition"
            >
              <Battery className="h-4 w-4" />
              Pil optimizasyonu ayarları
            </button>
            <button
              type="button"
              onClick={() => void PrayerNative.openExactAlarmSettings()}
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:bg-[var(--surface-soft-strong)] transition"
            >
              <AlarmClock className="h-4 w-4" />
              Tam zamanlı alarm izni
            </button>
          </div>
        )}
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

      <Section title="Yedekle / Geri Yükle">
        <p className="text-xs text-[var(--text-muted)]">
          Ayarlar, namaz takibi, Kur’an yer imi ve hatim verilerini JSON dosyası olarak kaydedin.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-gold-400/90 text-night-950 hover:brightness-110 transition"
          >
            <Download className="h-4 w-4" />
            Dışa aktar
          </button>
          <button
            type="button"
            onClick={() => importRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:bg-[var(--surface-soft-strong)] transition"
          >
            <Upload className="h-4 w-4" />
            İçe aktar
          </button>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
        {importStatus === 'error' && (
          <p className="text-xs text-red-300/90">Yedek dosyası okunamadı. Geçerli bir JSON seçin.</p>
        )}
      </Section>

      <Section title="Uygulama">
        <InstallPrompt />
        <p className="text-xs text-[var(--text-muted)]">
          PWA olarak ana ekrana eklenebilir. Android .aab ve widget için PLAY_STORE.md dosyasına
          bakın.
        </p>
      </Section>
    </div>
  );
}

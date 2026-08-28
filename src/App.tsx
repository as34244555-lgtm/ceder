import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { NextPrayerHero } from './components/NextPrayerHero';
import { PrayerTimesList } from './components/PrayerTimesList';
import { StatusBanner } from './components/StatusBanner';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { QiblaCompass } from './components/QiblaCompass';
import { MonthlyCalendar } from './components/MonthlyCalendar';
import { ZikirTab } from './components/ZikirTab';
import { SettingsScreen } from './components/SettingsScreen';
import { PrayerTrackerScreen } from './components/PrayerTrackerScreen';
import { MoreMenu } from './components/MoreMenu';
import { SubScreenHeader } from './components/SubScreenHeader';
import { RamadanBanner } from './components/RamadanBanner';
import { RamadanScreen } from './components/RamadanScreen';
import { ZakatCalculator } from './components/ZakatCalculator';
import { NearbyMosques } from './components/NearbyMosques';
import { HalalPlacesScreen } from './components/HalalPlacesScreen';
import { HajjGuideScreen } from './components/HajjGuideScreen';
import { PrivacyScreen } from './components/PrivacyScreen';
import { KerahatBadge } from './components/KerahatBadge';
import { EsmaulHusnaList } from './components/EsmaulHusnaList';
import { PrayerGuideScreen } from './components/PrayerGuideScreen';
import { OccasionBanner } from './components/OccasionBanner';
import { DailyWisdomCard } from './components/DailyWisdomCard';
import { QuranScreen } from './components/QuranScreen';
import { OnboardingPermissions } from './components/OnboardingPermissions';
import { PrayerCheckPrompt } from './components/PrayerCheckPrompt';
import { IqamahBanner } from './components/IqamahBanner';
import { Capacitor } from '@capacitor/core';
import { useGeolocation } from './hooks/useGeolocation';
import { useNow } from './hooks/useNow';
import { usePrayerData } from './hooks/usePrayerData';
import { useNextPrayer } from './hooks/useNextPrayer';
import { useAdhanAlerts } from './hooks/useAdhanAlerts';
import { useScheduledNotifications } from './hooks/useScheduledNotifications';
import { useThemeEffect } from './hooks/useThemeEffect';
import { useIslamicOccasion } from './hooks/useIslamicOccasion';
import { useRamadanCountdown } from './hooks/useRamadanCountdown';
import { useFavoriteCities } from './hooks/useFavoriteCities';
import { todayISO, usePrayerTracker } from './hooks/usePrayerTracker';
import { useKazaCounter } from './hooks/useKazaCounter';
import { reverseGeocodeLabel } from './api/geocode';
import {
  getInitialNotificationPermission,
  requestNotificationPermission,
  syncNotificationPermission,
} from './utils/notifications';
import { primeAudio, unlockAdhanAudio } from './utils/sound';
import { getIqamahCountdown } from './utils/iqamah';
import { loadJSON, saveJSON } from './utils/storage';
import {
  loadSelectedCity,
  loadSelectedCountry,
  loadSettings,
  saveSelectedCity,
  saveSelectedCountry,
  saveSettings,
} from './utils/storage';
import { PrayerNative } from './plugins/prayerNative';
import type {
  LocationInfo,
  PrayerTime,
  SecondaryScreenId,
  TabId,
  TrackablePrayerKey,
} from './types';

const DEFAULT_CITY = 'İstanbul';
const DEFAULT_COUNTRY = 'Turkey';
const ONBOARDING_KEY = 'ezan-app:onboarding-v2';

const SECONDARY_TITLES: Record<SecondaryScreenId, string> = {
  quran: "Kur'an-ı Kerim",
  zikir: 'Zikir & Dualar',
  esma: "Esmaü'l-Hüsna",
  guide: 'Namaz Nasıl Kılınır?',
  ramadan: 'Ramazan Modu',
  zakat: 'Zekât & Fitre',
  mosques: 'Yakındaki Camiler',
  halal: 'Helal Mekânlar',
  hajj: 'Hac & Umre Rehberi',
  privacy: 'Gizlilik',
  settings: 'Ayarlar',
};

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [selectedCity, setSelectedCity] = useState(() => loadSelectedCity() ?? DEFAULT_CITY);
  const [location, setLocation] = useState<LocationInfo>(() => {
    const city = loadSelectedCity() ?? DEFAULT_CITY;
    const country = loadSelectedCountry() ?? DEFAULT_COUNTRY;
    return { label: city, city, country, source: 'city' };
  });
  const [settings, setSettings] = useState(() => loadSettings());
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(getInitialNotificationPermission);
  const [showOnboarding, setShowOnboarding] = useState(
    () => !loadJSON(ONBOARDING_KEY, false),
  );
  const [pendingCheck, setPendingCheck] = useState<{
    key: TrackablePrayerKey;
    label: string;
  } | null>(null);

  useThemeEffect(settings.theme);
  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
  }, [settings.language]);

  useEffect(() => {
    void syncNotificationPermission().then(setNotificationPermission);
  }, []);

  const { status: geoStatus, coords, error: geoError, requestLocation } = useGeolocation();
  const { today, tomorrow, loading, error, refetch, fromCache } = usePrayerData(
    location,
    settings.calculationMethod,
  );
  const now = useNow(1000);
  const { current, next, msRemaining } = useNextPrayer(today, tomorrow, now);
  const ramadanCountdown = useRamadanCountdown(today, tomorrow, now);
  const favorites = useFavoriteCities();
  const tracker = usePrayerTracker();
  const kaza = useKazaCounter();
  const iqamah = useMemo(
    () => getIqamahCountdown(current, now, settings.iqamahMinutes),
    [current, now, settings.iqamahMinutes],
  );

  const handlePrayerEntered = useCallback((prayer: PrayerTime & { key: TrackablePrayerKey }) => {
    if (!settings.kidsMode) setPendingCheck({ key: prayer.key, label: prayer.label });
  }, [settings.kidsMode]);

  useAdhanAlerts(current, next, msRemaining, settings, handlePrayerEntered);
  useScheduledNotifications(today, tomorrow, settings, location.label);
  const occasion = useIslamicOccasion(today?.hijri, settings.notificationsEnabled);
  const isRamadan = today?.hijri.month === 9;

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    const unlock = () => {
      primeAudio();
      unlockAdhanAudio();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    if (geoStatus !== 'success' || !coords) return;
    setLocation({
      label: 'Konumunuz',
      city: '',
      country: '',
      latitude: coords.latitude,
      longitude: coords.longitude,
      source: 'gps',
    });
    void reverseGeocodeLabel(coords.latitude, coords.longitude).then((label) => {
      setLocation((loc) => (loc.source === 'gps' ? { ...loc, label, city: label } : loc));
    });
  }, [geoStatus, coords]);

  const handleCityChange = useCallback((city: string, country: string) => {
    setSelectedCity(city);
    saveSelectedCity(city);
    saveSelectedCountry(country);
    setLocation({ label: city, city, country, source: 'city' });
  }, []);

  const handleUseLocation = useCallback(() => {
    primeAudio();
    void requestLocation({ highAccuracy: true });
  }, [requestLocation]);

  const handleRequestNotificationPermission = useCallback(async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    return permission;
  }, []);

  const requestCompassPermission = useCallback(async (): Promise<boolean> => {
    if (typeof DeviceOrientationEvent === 'undefined') return false;
    type DOE = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    const Ctor = DeviceOrientationEvent as DOE;
    if (typeof Ctor.requestPermission === 'function') {
      try {
        return (await Ctor.requestPermission()) === 'granted';
      } catch {
        return false;
      }
    }
    // Android / masaüstü: izin diyaloğu yok; dinleyiciyi açmak yeterli
    return true;
  }, []);

  const handleRequestAllPermissions = useCallback(async () => {
    primeAudio();
    unlockAdhanAudio();
    const notif = await handleRequestNotificationPermission();
    const locationGranted = await requestLocation({ highAccuracy: true });
    const compassGranted = await requestCompassPermission();
    if (Capacitor.isNativePlatform()) {
      await PrayerNative.openExactAlarmSettings().catch(() => undefined);
      await PrayerNative.openBatterySettings().catch(() => undefined);
      if (notif === 'granted') {
        await PrayerNative.startOngoing().catch(() => undefined);
      }
    }
    return {
      notificationsGranted: notif === 'granted',
      locationGranted: Boolean(locationGranted),
      compassGranted,
    };
  }, [handleRequestNotificationPermission, requestCompassPermission, requestLocation]);

  const handleOnboardingComplete = useCallback(
    (opts: {
      notificationsGranted: boolean;
      locationGranted: boolean;
      compassGranted: boolean;
    }) => {
      saveJSON(ONBOARDING_KEY, true);
      setShowOnboarding(false);
      if (opts.notificationsGranted) {
        setSettings((s) => ({
          ...s,
          notificationsEnabled: true,
          soundEnabled: true,
          ongoingNotification: true,
        }));
        setNotificationPermission('granted');
      }
    },
    [],
  );

  const currentKeyId = current ? `${current.key}-${current.date.toDateString()}` : null;
  const combinedError = error ?? (geoStatus === 'error' ? geoError : null);
  const canFavorite =
    location.source === 'city' && Boolean(location.city) && Boolean(location.country);
  const isCurrentFavorite = canFavorite
    ? favorites.isFavorite(location.city, location.country)
    : false;
  const secondaryTitle =
    activeTab in SECONDARY_TITLES
      ? SECONDARY_TITLES[activeTab as SecondaryScreenId]
      : null;

  const kidsHome = settings.kidsMode && activeTab === 'home';

  return (
    <div className="min-h-screen flex flex-col items-center relative z-10 px-4 sm:px-6 pb-24">
      <div className="star-field" />
      <div className="w-full max-w-4xl flex flex-col items-center gap-6 relative z-10">
        <Header
          gregorianDateLabel={today?.gregorianDateLabel}
          hijriDate={today?.hijriDate}
          locationLabel={activeTab === 'home' ? location.label : undefined}
          onLocationClick={
            activeTab === 'home' ? () => setActiveTab('settings') : undefined
          }
        />

        {secondaryTitle && (
          <SubScreenHeader title={secondaryTitle} onBack={() => setActiveTab('more')} />
        )}

        {activeTab === 'home' && (
          <>
            {isRamadan && ramadanCountdown && today && !kidsHome && (
              <RamadanBanner countdown={ramadanCountdown} hijri={today.hijri} />
            )}
            {occasion && !kidsHome && <OccasionBanner occasion={occasion} />}

            <StatusBanner
              loading={loading}
              error={combinedError}
              onRetry={refetch}
              offlineCache={fromCache}
            />

            {!kidsHome && <KerahatBadge today={today} now={now} />}
            {iqamah && (
              <IqamahBanner label={iqamah.label} msRemaining={iqamah.msRemaining} />
            )}

            <NextPrayerHero
              current={current}
              next={next}
              msRemaining={msRemaining}
              now={now}
              timeFormat={settings.timeFormat}
            />

            {today && (
              <PrayerTimesList
                times={today.times}
                currentKeyId={currentKeyId}
                timeFormat={settings.timeFormat}
              />
            )}

            {!kidsHome && <DailyWisdomCard />}
            {kidsHome && (
              <p className="text-xs text-center text-[var(--text-muted)]">
                Çocuk modu açık — sade görünüm. Kapatmak için Ayarlar.
              </p>
            )}
          </>
        )}

        {activeTab === 'tracker' && <PrayerTrackerScreen />}
        {activeTab === 'qibla' && <QiblaCompass location={location} />}
        {activeTab === 'calendar' && (
          <MonthlyCalendar
            location={location}
            method={settings.calculationMethod}
            timeFormat={settings.timeFormat}
          />
        )}
        {activeTab === 'more' && (
          <MoreMenu onNavigate={(s) => setActiveTab(s)} isRamadan={Boolean(isRamadan)} />
        )}
        {activeTab === 'quran' && <QuranScreen />}
        {activeTab === 'zikir' && <ZikirTab />}
        {activeTab === 'esma' && <EsmaulHusnaList />}
        {activeTab === 'guide' && <PrayerGuideScreen />}
        {activeTab === 'ramadan' && (
          <RamadanScreen
            location={location}
            method={settings.calculationMethod}
            timeFormat={settings.timeFormat}
            today={today}
            countdown={ramadanCountdown}
          />
        )}
        {activeTab === 'zakat' && <ZakatCalculator />}
        {activeTab === 'mosques' && <NearbyMosques location={location} />}
        {activeTab === 'halal' && <HalalPlacesScreen location={location} />}
        {activeTab === 'hajj' && <HajjGuideScreen />}
        {activeTab === 'privacy' && <PrivacyScreen />}
        {activeTab === 'settings' && (
          <SettingsScreen
            settings={settings}
            onChange={setSettings}
            notificationPermission={notificationPermission}
            onRequestNotificationPermission={() => {
              void handleRequestNotificationPermission();
            }}
            selectedCity={selectedCity}
            onCityChange={handleCityChange}
            onUseLocation={handleUseLocation}
            locationLoading={geoStatus === 'loading'}
            activeLabel={location.label}
            isUsingGps={location.source === 'gps'}
            favorites={favorites.favorites}
            activeFavoriteCity={location.source === 'city' ? location.city : ''}
            isCurrentFavorite={isCurrentFavorite}
            onToggleFavorite={() => {
              if (!canFavorite) return;
              favorites.toggleFavorite(location.city, location.country, location.label);
            }}
            onRemoveFavorite={favorites.removeFavorite}
            onSelectFavorite={handleCityChange}
          />
        )}

        <Footer />
      </div>

      <BottomNav active={activeTab} onChange={(tab) => setActiveTab(tab)} />

      {showOnboarding && (
        <OnboardingPermissions
          onRequestAllPermissions={handleRequestAllPermissions}
          onComplete={handleOnboardingComplete}
        />
      )}

      {pendingCheck && (
        <PrayerCheckPrompt
          prayerKey={pendingCheck.key}
          prayerLabel={pendingCheck.label}
          onPrayed={() => {
            tracker.setChecked(todayISO(), pendingCheck.key, true);
            setPendingCheck(null);
          }}
          onMissed={() => {
            tracker.setChecked(todayISO(), pendingCheck.key, false);
            kaza.increment(pendingCheck.key);
            setPendingCheck(null);
          }}
          onDismiss={() => setPendingCheck(null)}
        />
      )}
    </div>
  );
}

export default App;

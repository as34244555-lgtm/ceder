import { useCallback, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { LocationBar } from './components/LocationBar';
import { FavoriteCitiesBar } from './components/FavoriteCitiesBar';
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
import { KerahatBadge } from './components/KerahatBadge';
import { EsmaulHusnaList } from './components/EsmaulHusnaList';
import { PrayerGuideScreen } from './components/PrayerGuideScreen';
import { OccasionBanner } from './components/OccasionBanner';
import { DailyWisdomCard } from './components/DailyWisdomCard';
import { ReligiousAiChat } from './components/ReligiousAiChat';
import { ReligiousAiPromo } from './components/ReligiousAiPromo';
import { useGeolocation } from './hooks/useGeolocation';
import { useNow } from './hooks/useNow';
import { usePrayerData } from './hooks/usePrayerData';
import { useNextPrayer } from './hooks/useNextPrayer';
import { useAdhanAlerts } from './hooks/useAdhanAlerts';
import { useThemeEffect } from './hooks/useThemeEffect';
import { useIslamicOccasion } from './hooks/useIslamicOccasion';
import { useRamadanCountdown } from './hooks/useRamadanCountdown';
import { useFavoriteCities } from './hooks/useFavoriteCities';
import { reverseGeocodeLabel } from './api/geocode';
import { isNotificationSupported, requestNotificationPermission } from './utils/notifications';
import { primeAudio } from './utils/sound';
import {
  loadSelectedCity,
  loadSelectedCountry,
  loadSettings,
  saveSelectedCity,
  saveSelectedCountry,
  saveSettings,
} from './utils/storage';
import type { AppSettings, LocationInfo, PrimaryTabId, SecondaryScreenId, TabId } from './types';

const DEFAULT_CITY = 'İstanbul';
const DEFAULT_COUNTRY = 'Turkey';

const SECONDARY_TITLES: Record<SecondaryScreenId, string> = {
  assistant: 'Dini Asistan',
  zikir: 'Zikir & Dualar',
  esma: "Esmaü'l-Hüsna",
  guide: 'Namaz Nasıl Kılınır?',
  ramadan: 'Ramazan Modu',
  zakat: 'Zekât & Fitre',
  mosques: 'Yakındaki Camiler',
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
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => (isNotificationSupported() ? Notification.permission : 'unsupported'));

  useThemeEffect(settings.theme);

  const { status: geoStatus, coords, error: geoError, requestLocation } = useGeolocation();
  const { today, tomorrow, loading, error, refetch } = usePrayerData(
    location,
    settings.calculationMethod,
  );
  const now = useNow(1000);
  const { current, next, msRemaining } = useNextPrayer(today, tomorrow, now);
  const ramadanCountdown = useRamadanCountdown(today, tomorrow, now);
  const favorites = useFavoriteCities();

  useAdhanAlerts(current, next, msRemaining, settings);
  const occasion = useIslamicOccasion(today?.hijri, settings.notificationsEnabled);

  const isRamadan = today?.hijri.month === 9;

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Mobil tarayıcılarda (özellikle iOS) otomatik ses için AudioContext kilidini
  // kullanıcının uygulamadaki ilk dokunuşunda açıyoruz.
  useEffect(() => {
    const unlock = () => {
      primeAudio();
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
    requestLocation();
  }, [requestLocation]);

  const handleRequestNotificationPermission = useCallback(async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
  }, []);

  const handlePrimaryNav = useCallback((tab: PrimaryTabId) => {
    setActiveTab(tab);
  }, []);

  const handleSecondaryNav = useCallback((screen: SecondaryScreenId) => {
    setActiveTab(screen);
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col items-center relative z-10 px-4 sm:px-6 pb-24">
      <div className="star-field" />
      <div className="w-full max-w-4xl flex flex-col items-center gap-6 relative z-10">
        <Header gregorianDateLabel={today?.gregorianDateLabel} hijriDate={today?.hijriDate} />

        {secondaryTitle && (
          <SubScreenHeader title={secondaryTitle} onBack={() => setActiveTab('more')} />
        )}

        {activeTab === 'home' && (
          <>
            {isRamadan && ramadanCountdown && today && (
              <RamadanBanner countdown={ramadanCountdown} hijri={today.hijri} />
            )}
            {occasion && <OccasionBanner occasion={occasion} />}

            <LocationBar
              selectedCity={selectedCity}
              onCityChange={handleCityChange}
              onUseLocation={handleUseLocation}
              locationLoading={geoStatus === 'loading'}
              activeLabel={location.label}
              isUsingGps={location.source === 'gps'}
            />

            <FavoriteCitiesBar
              favorites={favorites.favorites}
              activeCity={location.source === 'city' ? location.city : ''}
              isCurrentFavorite={isCurrentFavorite}
              onSelect={handleCityChange}
              onToggleCurrent={() => {
                if (!canFavorite) return;
                favorites.toggleFavorite(location.city, location.country, location.label);
              }}
              onRemove={favorites.removeFavorite}
            />

            <StatusBanner loading={loading} error={combinedError} onRetry={refetch} />

            <KerahatBadge today={today} now={now} />

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

            <DailyWisdomCard />

            <ReligiousAiPromo onOpen={() => setActiveTab('assistant')} />
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
          <MoreMenu onNavigate={handleSecondaryNav} isRamadan={Boolean(isRamadan)} />
        )}

        {activeTab === 'assistant' && <ReligiousAiChat />}
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
        {activeTab === 'settings' && (
          <SettingsScreen
            settings={settings}
            onChange={setSettings}
            notificationPermission={notificationPermission}
            onRequestNotificationPermission={handleRequestNotificationPermission}
          />
        )}

        <Footer />
      </div>

      <BottomNav active={activeTab} onChange={handlePrimaryNav} />
    </div>
  );
}

export default App;

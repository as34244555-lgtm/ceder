import { useCallback, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { LocationBar } from './components/LocationBar';
import { NextPrayerHero } from './components/NextPrayerHero';
import { PrayerTimesList } from './components/PrayerTimesList';
import { StatusBanner } from './components/StatusBanner';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { QiblaCompass } from './components/QiblaCompass';
import { MonthlyCalendar } from './components/MonthlyCalendar';
import { ZikirTab } from './components/ZikirTab';
import { SettingsScreen } from './components/SettingsScreen';
import { useGeolocation } from './hooks/useGeolocation';
import { useNow } from './hooks/useNow';
import { usePrayerData } from './hooks/usePrayerData';
import { useNextPrayer } from './hooks/useNextPrayer';
import { useAdhanAlerts } from './hooks/useAdhanAlerts';
import { useThemeEffect } from './hooks/useThemeEffect';
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
import type { AppSettings, LocationInfo, TabId } from './types';

const DEFAULT_CITY = 'İstanbul';
const DEFAULT_COUNTRY = 'Turkey';

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

  useAdhanAlerts(current, next, msRemaining, settings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

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

  const currentKeyId = current ? `${current.key}-${current.date.toDateString()}` : null;
  const combinedError = error ?? (geoStatus === 'error' ? geoError : null);

  return (
    <div className="min-h-screen flex flex-col items-center relative z-10 px-4 sm:px-6 pb-24">
      <div className="star-field" />
      <div className="w-full max-w-4xl flex flex-col items-center gap-6 relative z-10">
        <Header gregorianDateLabel={today?.gregorianDateLabel} hijriDate={today?.hijriDate} />

        {activeTab === 'home' && (
          <>
            <LocationBar
              selectedCity={selectedCity}
              onCityChange={handleCityChange}
              onUseLocation={handleUseLocation}
              locationLoading={geoStatus === 'loading'}
              activeLabel={location.label}
              isUsingGps={location.source === 'gps'}
            />

            <StatusBanner loading={loading} error={combinedError} onRetry={refetch} />

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
          </>
        )}

        {activeTab === 'qibla' && <QiblaCompass />}

        {activeTab === 'calendar' && (
          <MonthlyCalendar
            location={location}
            method={settings.calculationMethod}
            timeFormat={settings.timeFormat}
          />
        )}

        {activeTab === 'zikir' && <ZikirTab />}

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

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default App;

import { useCallback, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { LocationBar } from './components/LocationBar';
import { NextPrayerHero } from './components/NextPrayerHero';
import { PrayerTimesList } from './components/PrayerTimesList';
import { SettingsPanel } from './components/SettingsPanel';
import { StatusBanner } from './components/StatusBanner';
import { Footer } from './components/Footer';
import { useGeolocation } from './hooks/useGeolocation';
import { useNow } from './hooks/useNow';
import { usePrayerData } from './hooks/usePrayerData';
import { useNextPrayer } from './hooks/useNextPrayer';
import { useAdhanAlerts } from './hooks/useAdhanAlerts';
import { reverseGeocodeLabel } from './api/geocode';
import { isNotificationSupported, requestNotificationPermission } from './utils/notifications';
import { primeAudio } from './utils/sound';
import { loadSelectedCity, loadSettings, saveSelectedCity, saveSettings } from './utils/storage';
import type { AppSettings, LocationInfo } from './types';

const DEFAULT_CITY = 'İstanbul';

function App() {
  const [selectedCity, setSelectedCity] = useState(() => loadSelectedCity() ?? DEFAULT_CITY);
  const [location, setLocation] = useState<LocationInfo>(() => ({
    label: loadSelectedCity() ?? DEFAULT_CITY,
    city: loadSelectedCity() ?? DEFAULT_CITY,
    country: 'Turkey',
    source: 'city',
  }));
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => (isNotificationSupported() ? Notification.permission : 'unsupported'));

  const { status: geoStatus, coords, error: geoError, requestLocation } = useGeolocation();
  const { today, tomorrow, loading, error, refetch } = usePrayerData(location);
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
      country: 'Turkey',
      latitude: coords.latitude,
      longitude: coords.longitude,
      source: 'gps',
    });
    void reverseGeocodeLabel(coords.latitude, coords.longitude).then((label) => {
      setLocation((loc) =>
        loc.source === 'gps' ? { ...loc, label, city: label } : loc,
      );
    });
  }, [geoStatus, coords]);

  const handleCityChange = useCallback((city: string) => {
    setSelectedCity(city);
    saveSelectedCity(city);
    setLocation({ label: city, city, country: 'Turkey', source: 'city' });
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
    <div className="min-h-screen flex flex-col items-center relative z-10 px-4 sm:px-6">
      <div className="star-field" />
      <div className="w-full max-w-4xl flex flex-col items-center gap-6 relative z-10">
        <Header gregorianDateLabel={today?.gregorianDateLabel} hijriDate={today?.hijriDate} />

        <LocationBar
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
          onUseLocation={handleUseLocation}
          locationLoading={geoStatus === 'loading'}
          activeLabel={location.label}
          isUsingGps={location.source === 'gps'}
        />

        <StatusBanner loading={loading} error={combinedError} onRetry={refetch} />

        <NextPrayerHero current={current} next={next} msRemaining={msRemaining} now={now} />

        {today && <PrayerTimesList times={today.times} currentKeyId={currentKeyId} />}

        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          notificationPermission={notificationPermission}
          onRequestNotificationPermission={handleRequestNotificationPermission}
        />

        <Footer />
      </div>
    </div>
  );
}

export default App;

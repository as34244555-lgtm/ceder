import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PrayerNative } from '../plugins/prayerNative';

type PermissionState = 'unknown' | 'granted' | 'denied' | 'unnecessary' | 'unsupported';

interface DeviceOrientationEventWithWebkit extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

type DeviceOrientationEventConstructorWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function shortestDelta(from: number, to: number): number {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

function getScreenAngle(): number {
  if (typeof screen !== 'undefined' && screen.orientation && typeof screen.orientation.angle === 'number') {
    return screen.orientation.angle;
  }
  const legacy = (window as Window & { orientation?: number }).orientation;
  return typeof legacy === 'number' ? legacy : 0;
}

/**
 * Pusula yönü (0 = manyetik/gerçek kuzey, saat yönünde).
 * Android Capacitor: yerel SensorManager.
 * Web / iOS WebView: DeviceOrientation (+ isteğe bağlı kalibrasyon ofseti).
 */
export function useCompassHeading() {
  const [heading, setHeading] = useState<number | null>(null);
  const [permission, setPermission] = useState<PermissionState>('unknown');
  const [supported, setSupported] = useState(true);
  const [source, setSource] = useState<'native' | 'absolute' | 'webkit' | 'relative' | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [calOffset, setCalOffset] = useState(0);

  const smoothedRef = useRef<number | null>(null);
  const rawRef = useRef<number | null>(null);
  const listenerAttachedRef = useRef(false);
  const nativeActiveRef = useRef(false);
  const calOffsetRef = useRef(0);

  useEffect(() => {
    calOffsetRef.current = calOffset;
  }, [calOffset]);

  const applyRawHeading = useCallback((raw: number, src: typeof source) => {
    rawRef.current = raw;
    const adjusted = normalizeDeg(raw + calOffsetRef.current);
    const prev = smoothedRef.current;
    const next =
      prev === null ? adjusted : normalizeDeg(prev + shortestDelta(prev, adjusted) * 0.45);
    smoothedRef.current = next;
    setHeading(next);
    if (src) setSource(src);
  }, []);

  const handleOrientation = useCallback(
    (event: Event) => {
      if (nativeActiveRef.current) return;
      const e = event as DeviceOrientationEventWithWebkit;

      if (typeof e.webkitCompassHeading === 'number' && !Number.isNaN(e.webkitCompassHeading)) {
        // iOS: zaten ekran-kuzey; screen angle ekleme
        applyRawHeading(e.webkitCompassHeading, 'webkit');
        return;
      }

      if (e.alpha === null || e.alpha === undefined || Number.isNaN(e.alpha)) return;

      const isAbsolute = event.type === 'deviceorientationabsolute' || e.absolute === true;
      // Web standard: 360 - alpha ≈ kuzey; ekran dönüşünü telafi et
      const raw = normalizeDeg(360 - e.alpha - getScreenAngle());
      applyRawHeading(raw, isAbsolute ? 'absolute' : 'relative');
    },
    [applyRawHeading],
  );

  const attachWebListeners = useCallback(() => {
    if (listenerAttachedRef.current) return;
    listenerAttachedRef.current = true;
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
  }, [handleOrientation]);

  const detachWebListeners = useCallback(() => {
    if (!listenerAttachedRef.current) return;
    window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
    window.removeEventListener('deviceorientation', handleOrientation, true);
    listenerAttachedRef.current = false;
  }, [handleOrientation]);

  const startNative = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      const avail = await PrayerNative.isCompassAvailable();
      if (!avail.value) return false;

      await PrayerNative.removeAllListeners().catch(() => undefined);
      await PrayerNative.addListener('compassHeading', (ev) => {
        nativeActiveRef.current = true;
        applyRawHeading(ev.heading, 'native');
        if (typeof ev.accuracy === 'number') setAccuracy(ev.accuracy);
      });
      await PrayerNative.addListener('compassAccuracy', (ev) => {
        setAccuracy(ev.accuracy);
      });
      await PrayerNative.startCompass();
      nativeActiveRef.current = true;
      setPermission('granted');
      setSupported(true);
      setSource('native');
      return true;
    } catch {
      nativeActiveRef.current = false;
      await PrayerNative.stopCompass().catch(() => undefined);
      return false;
    }
  }, [applyRawHeading]);

  const requestAccess = useCallback(async (): Promise<boolean> => {
    // 1) Native Android/iOS Capacitor
    if (await startNative()) return true;

    // 2) Web / WebView DeviceOrientation
    if (typeof window === 'undefined') {
      setSupported(false);
      setPermission('unsupported');
      return false;
    }

    if (typeof DeviceOrientationEvent === 'undefined') {
      setSupported(false);
      setPermission('unsupported');
      return false;
    }

    const DOE = DeviceOrientationEvent as DeviceOrientationEventConstructorWithPermission;
    if (typeof DOE.requestPermission === 'function') {
      try {
        const result = await DOE.requestPermission();
        if (result !== 'granted') {
          setPermission('denied');
          return false;
        }
        setPermission('granted');
      } catch {
        setPermission('denied');
        return false;
      }
    } else {
      setPermission('unnecessary');
    }

    attachWebListeners();
    setSupported(true);
    return true;
  }, [attachWebListeners, startNative]);

  /** Kullanıcı telefonu kuzeye tutup bastığında ofseti sıfırlar (göreli sensör için). */
  const calibrateToNorth = useCallback(() => {
    const raw = rawRef.current;
    if (raw === null) return false;
    const offset = normalizeDeg(-raw);
    calOffsetRef.current = offset;
    setCalOffset(offset);
    smoothedRef.current = 0;
    setHeading(0);
    return true;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      if (Capacitor.isNativePlatform()) {
        const ok = await startNative();
        if (!cancelled && !ok) {
          // Native yoksa web yedek
          const DOE = DeviceOrientationEvent as DeviceOrientationEventConstructorWithPermission | undefined;
          if (DOE && typeof DOE.requestPermission !== 'function') {
            setPermission('unnecessary');
            attachWebListeners();
          } else {
            setPermission('unknown');
          }
        }
        return;
      }

      if (typeof DeviceOrientationEvent === 'undefined') {
        setSupported(false);
        setPermission('unsupported');
        return;
      }
      const DOE = DeviceOrientationEvent as DeviceOrientationEventConstructorWithPermission;
      if (typeof DOE.requestPermission !== 'function') {
        setPermission('unnecessary');
        attachWebListeners();
      } else {
        setPermission('unknown');
      }
    };

    void boot();

    return () => {
      cancelled = true;
      detachWebListeners();
      if (nativeActiveRef.current) {
        void PrayerNative.stopCompass().catch(() => undefined);
        void PrayerNative.removeAllListeners().catch(() => undefined);
        nativeActiveRef.current = false;
      }
    };
  }, [attachWebListeners, detachWebListeners, startNative]);

  return {
    heading,
    permission,
    supported,
    source,
    accuracy,
    requestAccess,
    calibrateToNorth,
    hasCalibration: calOffset !== 0,
  };
}

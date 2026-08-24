import { useCallback, useEffect, useRef, useState } from 'react';

type PermissionState = 'unknown' | 'granted' | 'denied' | 'unnecessary' | 'unsupported';

interface DeviceOrientationEventWithWebkit extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

type DeviceOrientationEventConstructorWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

interface AbsoluteOrientationSensorLike {
  quaternion: [number, number, number, number];
  start: () => void;
  stop: () => void;
  addEventListener: (type: 'reading' | 'error', listener: () => void) => void;
  removeEventListener: (type: 'reading' | 'error', listener: () => void) => void;
}

declare global {
  interface Window {
    AbsoluteOrientationSensor?: new (options?: {
      frequency?: number;
      referenceFrame?: 'device' | 'screen';
    }) => AbsoluteOrientationSensorLike;
  }
}

function getScreenAngle(): number {
  if (typeof screen !== 'undefined' && screen.orientation && typeof screen.orientation.angle === 'number') {
    return screen.orientation.angle;
  }
  const legacy = (window as Window & { orientation?: number }).orientation;
  return typeof legacy === 'number' ? legacy : 0;
}

/** Derece farkını −180…180 aralığına sıkıştırır (yumuşatma için). */
function shortestDelta(from: number, to: number): number {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Quaternion → pusula yönü (0 = kuzey, saat yönünde).
 * AbsoluteOrientationSensor (Earth frame) için.
 */
function quaternionToHeading([x, y, z, w]: [number, number, number, number]): number {
  const siny = 2 * (w * z + x * y);
  const cosy = 1 - 2 * (y * y + z * z);
  const yaw = Math.atan2(siny, cosy) * (180 / Math.PI);
  return normalizeDeg(-yaw);
}

/**
 * Cihazın pusula yönünü (0 = kuzey) okur.
 * Öncelik: AbsoluteOrientationSensor → deviceorientationabsolute → deviceorientation / iOS webkit.
 */
export function useCompassHeading() {
  const [heading, setHeading] = useState<number | null>(null);
  const [permission, setPermission] = useState<PermissionState>('unknown');
  const [supported, setSupported] = useState(true);
  const [usingAbsolute, setUsingAbsolute] = useState(false);
  const listenerAttachedRef = useRef(false);
  const sensorRef = useRef<AbsoluteOrientationSensorLike | null>(null);
  const smoothedRef = useRef<number | null>(null);
  const absoluteModeRef = useRef(false);

  const applyHeading = useCallback((raw: number) => {
    const withScreen = normalizeDeg(raw - getScreenAngle());
    const prev = smoothedRef.current;
    const next =
      prev === null ? withScreen : normalizeDeg(prev + shortestDelta(prev, withScreen) * 0.35);
    smoothedRef.current = next;
    setHeading(next);
  }, []);

  const handleOrientation = useCallback(
    (event: Event) => {
      if (absoluteModeRef.current && sensorRef.current) return;
      const e = event as DeviceOrientationEventWithWebkit;

      if (typeof e.webkitCompassHeading === 'number' && !Number.isNaN(e.webkitCompassHeading)) {
        applyHeading(e.webkitCompassHeading);
        return;
      }

      if (e.alpha === null || e.alpha === undefined || Number.isNaN(e.alpha)) return;

      const isAbsolute =
        event.type === 'deviceorientationabsolute' || e.absolute === true;
      if (!isAbsolute && absoluteModeRef.current) return;

      // Mutlak alpha: 0 = kuzey. Göreli alpha güvenilmez; yine de göster (uyarı UI'da).
      applyHeading(360 - e.alpha);
      if (isAbsolute) setUsingAbsolute(true);
    },
    [applyHeading],
  );

  const stopSensor = useCallback(() => {
    if (sensorRef.current) {
      try {
        sensorRef.current.stop();
      } catch {
        // ignore
      }
      sensorRef.current = null;
    }
  }, []);

  const tryAbsoluteSensor = useCallback(async (): Promise<boolean> => {
    if (typeof window.AbsoluteOrientationSensor !== 'function') return false;
    try {
      if (navigator.permissions?.query) {
        const results = await Promise.all(
          ['accelerometer', 'gyroscope', 'magnetometer'].map((name) =>
            navigator.permissions.query({ name: name as PermissionName }).catch(() => null),
          ),
        );
        if (results.some((r) => r?.state === 'denied')) return false;
      }

      const Sensor = window.AbsoluteOrientationSensor;
      const sensor = new Sensor({ frequency: 30, referenceFrame: 'device' });
      await new Promise<void>((resolve, reject) => {
        const onError = () => reject(new Error('sensor-error'));
        sensor.addEventListener('error', onError);
        sensor.addEventListener('reading', () => {
          absoluteModeRef.current = true;
          setUsingAbsolute(true);
          applyHeading(quaternionToHeading(sensor.quaternion));
        });
        try {
          sensor.start();
          sensorRef.current = sensor;
          // Kısa süre içinde okuma gelmezse başarısız say
          window.setTimeout(() => resolve(), 400);
        } catch (err) {
          reject(err);
        }
      });
      return Boolean(sensorRef.current);
    } catch {
      stopSensor();
      return false;
    }
  }, [applyHeading, stopSensor]);

  const attachOrientationListener = useCallback(() => {
    if (listenerAttachedRef.current) return;
    listenerAttachedRef.current = true;
    // Önce mutlak olay; yoksa klasik
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
  }, [handleOrientation]);

  const requestAccess = useCallback(async () => {
    if (typeof window === 'undefined') {
      setSupported(false);
      setPermission('unsupported');
      return false;
    }

    const sensorOk = await tryAbsoluteSensor();
    if (sensorOk) {
      setPermission('granted');
      attachOrientationListener();
      return true;
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
        if (result === 'granted') {
          setPermission('granted');
          attachOrientationListener();
          return true;
        }
        setPermission('denied');
        return false;
      } catch {
        setPermission('denied');
        return false;
      }
    }

    setPermission('unnecessary');
    attachOrientationListener();
    return true;
  }, [attachOrientationListener, tryAbsoluteSensor]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setSupported(false);
      setPermission('unsupported');
      return;
    }
    if (typeof DeviceOrientationEvent === 'undefined' && !window.AbsoluteOrientationSensor) {
      setSupported(false);
      setPermission('unsupported');
      return;
    }
    const DOE = DeviceOrientationEvent as DeviceOrientationEventConstructorWithPermission | undefined;
    if (DOE && typeof DOE.requestPermission !== 'function') {
      setPermission('unnecessary');
      void tryAbsoluteSensor().finally(() => {
        attachOrientationListener();
      });
    }
    return () => {
      stopSensor();
      if (listenerAttachedRef.current) {
        window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
        listenerAttachedRef.current = false;
      }
    };
  }, [attachOrientationListener, handleOrientation, stopSensor, tryAbsoluteSensor]);

  return { heading, permission, supported, usingAbsolute, requestAccess };
}

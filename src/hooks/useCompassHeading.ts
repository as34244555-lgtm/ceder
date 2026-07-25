import { useCallback, useEffect, useRef, useState } from 'react';

type PermissionState = 'unknown' | 'granted' | 'denied' | 'unnecessary' | 'unsupported';

interface DeviceOrientationEventWithWebkit extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

type DeviceOrientationEventConstructorWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

/**
 * Cihazın pusula yönünü (0 = kuzey, saat yönünde derece) okur.
 * iOS 13+ tarayıcılarda kullanıcı izni gerekir; bu yüzden `requestAccess`
 * bir buton tıklaması gibi kullanıcı etkileşimi içinde çağrılmalıdır.
 */
export function useCompassHeading() {
  const [heading, setHeading] = useState<number | null>(null);
  const [permission, setPermission] = useState<PermissionState>('unknown');
  const [supported, setSupported] = useState(true);
  const listenerAttachedRef = useRef(false);

  const handleOrientation = useCallback((event: Event) => {
    const e = event as DeviceOrientationEventWithWebkit;
    if (typeof e.webkitCompassHeading === 'number') {
      setHeading(e.webkitCompassHeading);
    } else if (e.alpha !== null && e.alpha !== undefined) {
      setHeading(360 - e.alpha);
    }
  }, []);

  const attachListener = useCallback(() => {
    if (listenerAttachedRef.current) return;
    listenerAttachedRef.current = true;
    const eventName =
      'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    window.addEventListener(eventName, handleOrientation, true);
  }, [handleOrientation]);

  const requestAccess = useCallback(async () => {
    if (typeof DeviceOrientationEvent === 'undefined') {
      setSupported(false);
      setPermission('unsupported');
      return;
    }
    const DOE = DeviceOrientationEvent as DeviceOrientationEventConstructorWithPermission;
    if (typeof DOE.requestPermission === 'function') {
      try {
        const result = await DOE.requestPermission();
        setPermission(result === 'granted' ? 'granted' : 'denied');
        if (result === 'granted') attachListener();
      } catch {
        setPermission('denied');
      }
    } else {
      setPermission('unnecessary');
      attachListener();
    }
  }, [attachListener]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') {
      setSupported(false);
      setPermission('unsupported');
      return;
    }
    const DOE = DeviceOrientationEvent as DeviceOrientationEventConstructorWithPermission;
    if (typeof DOE.requestPermission !== 'function') {
      setPermission('unnecessary');
      attachListener();
    }
    return () => {
      if (listenerAttachedRef.current) {
        const eventName =
          'ondeviceorientationabsolute' in window
            ? 'deviceorientationabsolute'
            : 'deviceorientation';
        window.removeEventListener(eventName, handleOrientation, true);
      }
    };
  }, [attachListener, handleOrientation]);

  return { heading, permission, supported, requestAccess };
}

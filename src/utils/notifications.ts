import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export type AppNotificationPermission = NotificationPermission | 'unsupported';

function webNotificationPermission(): AppNotificationPermission {
  // Android WebView has no Notification constructor. Accessing Notification.permission
  // there throws and leaves a blank green screen on launch.
  try {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission;
  } catch {
    return 'unsupported';
  }
}

export function isNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (Capacitor.isNativePlatform()) return true;
  return webNotificationPermission() !== 'unsupported';
}

/** Safe for first React render — never touches missing WebView Notification. */
export function getInitialNotificationPermission(): AppNotificationPermission {
  if (Capacitor.isNativePlatform()) return 'denied';
  return webNotificationPermission();
}

export async function syncNotificationPermission(): Promise<AppNotificationPermission> {
  if (Capacitor.isNativePlatform()) {
    try {
      const current = await LocalNotifications.checkPermissions();
      return current.display === 'granted' ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  }
  return webNotificationPermission();
}

export async function requestNotificationPermission(): Promise<AppNotificationPermission> {
  if (Capacitor.isNativePlatform()) {
    try {
      const current = await LocalNotifications.checkPermissions();
      if (current.display === 'granted') return 'granted';
      const req = await LocalNotifications.requestPermissions();
      return req.display === 'granted' ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  }
  if (webNotificationPermission() === 'unsupported') return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

export async function ensureNotificationChannel() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.createChannel({
      id: 'ezan-vakitleri',
      name: 'Ezan Vakti Ultra',
      description: 'Ezan vakti ve hatırlatma bildirimleri',
      importance: 5,
      visibility: 1,
      sound: undefined,
      vibration: true,
    });
  } catch {
    // Android < 8 veya kanal zaten var
  }
}

export function showPrayerNotification(title: string, body: string) {
  if (Capacitor.isNativePlatform()) {
    void LocalNotifications.schedule({
      notifications: [
        {
          id: Math.floor(Date.now() % 100000) + 1,
          title,
          body,
          schedule: { at: new Date(Date.now() + 250) },
          channelId: 'ezan-vakitleri',
          extra: { kind: 'instant' },
        },
      ],
    }).catch(() => undefined);
    return;
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    // eslint-disable-next-line no-new
    new Notification(title, {
      body,
      icon: `${import.meta.env.BASE_URL}favicon.svg`,
      tag: `ezan-${title}-${new Date().toDateString()}`,
    });
  } catch {
    // yoksay
  }
}

export interface SchedulableAlert {
  id: number;
  title: string;
  body: string;
  at: Date;
}

/** Kapalıyken de çalışması için gelecek vakit bildirimlerini zamanlar (native). */
export async function schedulePrayerAlerts(alerts: SchedulableAlert[]) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await ensureNotificationChannel();
    const pending = await LocalNotifications.getPending();
    const cancelIds = pending.notifications
      .filter((n) => n.extra?.kind === 'scheduled')
      .map((n) => ({ id: n.id }));
    if (cancelIds.length) await LocalNotifications.cancel({ notifications: cancelIds });

    const now = Date.now();
    const notifications = alerts
      .filter((a) => a.at.getTime() > now + 15_000)
      .slice(0, 40)
      .map((a) => ({
        id: a.id,
        title: a.title,
        body: a.body,
        schedule: { at: a.at, allowWhileIdle: true },
        channelId: 'ezan-vakitleri',
        extra: { kind: 'scheduled' },
      }));

    if (notifications.length) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch {
    // izin yok / platform kısıtı
  }
}

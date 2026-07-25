export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

export function showPrayerNotification(title: string, body: string) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;
  try {
    // eslint-disable-next-line no-new
    new Notification(title, {
      body,
      icon: '/favicon.svg',
      tag: `ezan-${title}-${new Date().toDateString()}`,
    });
  } catch {
    // Bazı tarayıcılarda (özellikle mobil) Notification constructor'ı
    // servis çalışanı gerektirebilir; sessizce yoksay.
  }
}

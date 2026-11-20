package com.ezan.app;

/**
 * Sonraki ezana kalan sürenin bildirim metni.
 * Android sınıflarına bağlı değildir; birim testte doğrudan çalışır.
 */
public final class PrayerCountdown {
    private PrayerCountdown() {}

    public static String formatRemaining(long diffMs) {
        if (diffMs < 0) diffMs = 0;
        long totalSec = diffMs / 1000;
        long hours = totalSec / 3600;
        long minutes = (totalSec % 3600) / 60;
        long seconds = totalSec % 60;
        if (hours > 0) {
            return hours + " sa " + minutes + " dk " + seconds + " sn kaldı";
        }
        if (minutes > 0) {
            return minutes + " dk " + seconds + " sn kaldı";
        }
        return seconds + " sn kaldı";
    }
}

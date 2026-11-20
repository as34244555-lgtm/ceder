package com.ezan.app;

/** Seçilen ezan kaydının assets yolu. Android sınıfı kullanmaz. */
public final class AdhanAssets {
    private AdhanAssets() {}

    public static String assetPath(String soundId) {
        if ("madinah".equals(soundId)) return "adhan/madinah-fajr.mp3";
        if ("sabah".equals(soundId)) return "adhan/sabah-fakhry.mp3";
        if ("klcc".equals(soundId)) return "adhan/klcc.mp3";
        return "adhan/makkah-ali-mulla.mp3";
    }
}

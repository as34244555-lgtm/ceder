package com.ezan.app;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class AdhanAssetsTest {
    @Test
    public void mapsKnownRecordings() {
        assertEquals("adhan/makkah-ali-mulla.mp3", AdhanAssets.assetPath("makkah"));
        assertEquals("adhan/madinah-fajr.mp3", AdhanAssets.assetPath("madinah"));
        assertEquals("adhan/sabah-fakhry.mp3", AdhanAssets.assetPath("sabah"));
        assertEquals("adhan/klcc.mp3", AdhanAssets.assetPath("klcc"));
    }

    @Test
    public void unknownIdFallsBackToMakkah() {
        assertEquals("adhan/makkah-ali-mulla.mp3", AdhanAssets.assetPath("yok"));
        assertEquals("adhan/makkah-ali-mulla.mp3", AdhanAssets.assetPath(null));
    }
}

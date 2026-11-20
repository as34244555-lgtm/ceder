package com.ezan.app;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class PrayerCountdownTest {
    @Test
    public void formatsHoursMinutesAndSeconds() {
        assertEquals("2 sa 5 dk 9 sn kaldı", PrayerCountdown.formatRemaining((2 * 3600 + 5 * 60 + 9) * 1000L));
    }

    @Test
    public void formatsMinutesAndSeconds() {
        assertEquals("12 dk 8 sn kaldı", PrayerCountdown.formatRemaining((12 * 60 + 8) * 1000L));
    }

    @Test
    public void formatsOnlySeconds() {
        assertEquals("8 sn kaldı", PrayerCountdown.formatRemaining(8_000));
    }

    @Test
    public void clampsPastTimeToZero() {
        assertEquals("0 sn kaldı", PrayerCountdown.formatRemaining(-1500));
    }
}

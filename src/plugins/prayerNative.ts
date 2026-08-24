import { registerPlugin, type PluginListenerHandle } from '@capacitor/core';

export interface CompassHeadingEvent {
  heading: number;
  accuracy?: number;
}

export interface CompassAccuracyEvent {
  accuracy: number;
}

export interface PrayerNativePlugin {
  startOngoing(): Promise<void>;
  stopOngoing(): Promise<void>;
  openBatterySettings(): Promise<void>;
  isIgnoringBatteryOptimizations(): Promise<{ value: boolean }>;
  openExactAlarmSettings(): Promise<void>;
  startCompass(): Promise<{ ok: boolean; mode: string }>;
  stopCompass(): Promise<void>;
  isCompassAvailable(): Promise<{ value: boolean }>;
  addListener(
    eventName: 'compassHeading',
    listenerFunc: (event: CompassHeadingEvent) => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'compassAccuracy',
    listenerFunc: (event: CompassAccuracyEvent) => void,
  ): Promise<PluginListenerHandle>;
  removeAllListeners(): Promise<void>;
}

export const PrayerNative = registerPlugin<PrayerNativePlugin>('PrayerNative', {
  web: () => ({
    async startOngoing() {},
    async stopOngoing() {},
    async openBatterySettings() {},
    async isIgnoringBatteryOptimizations() {
      return { value: true };
    },
    async openExactAlarmSettings() {},
    async startCompass() {
      throw new Error('web-fallback');
    },
    async stopCompass() {},
    async isCompassAvailable() {
      return { value: false };
    },
    async addListener() {
      return { remove: async () => undefined };
    },
    async removeAllListeners() {},
  }),
});

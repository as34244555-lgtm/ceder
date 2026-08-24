import { registerPlugin } from '@capacitor/core';

export interface PrayerNativePlugin {
  startOngoing(): Promise<void>;
  stopOngoing(): Promise<void>;
  openBatterySettings(): Promise<void>;
  isIgnoringBatteryOptimizations(): Promise<{ value: boolean }>;
  openExactAlarmSettings(): Promise<void>;
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
  }),
});

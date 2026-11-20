import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ezan.app',
  appName: 'Ezan Vakti Ultra',
  webDir: 'dist',
  backgroundColor: '#04120e',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 400,
      launchFadeOutDuration: 200,
      backgroundColor: '#04120e',
      androidScaleType: 'CENTER',
      androidSplashResourceName: 'splash',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0b3d2e',
    },
    LocalNotifications: {
      iconColor: '#0b3d2e',
    },
  },
};

export default config;

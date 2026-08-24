import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ezanvakti.app',
  appName: 'Ezan Vakti Ultra',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#04120e',
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

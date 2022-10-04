import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'common.xyz',
  appName: 'Common',
  webDir: 'build',
  bundledWebRuntime: false,
  // server: {
  //   hostname: 'localhost:8081',
  //   cleartext: true,
  //   allowNavigation: ['*'],
  // },
  plugins: {
    "SplashScreen": {
      "launchShowDuration": 5000,
      "launchAutoHide": true,
    }
  },
};

export default config;

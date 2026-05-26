import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vismart.app',
  appName: 'Vi Smart Learning Education',
  webDir: 'www',
  server: {
    url: 'https://vismartlearningeducation.com/',
    cleartext: false,
    allowNavigation: [
      'vismartlearningeducation.com',
      'api.vismartlearningeducation.com',
      'stream.vismartlearningeducation.com',
      'live.vismartlearningeducation.com',
      'supabase.co',
      'razorpay.com',
    ],
  },
  android: {
    buildOptions: {
      keystorePath: 'android/keystore.jks',
      keystoreAlias: 'vismart',
    },
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    contentInset: 'always',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: '#7C3AED',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#FFFFFF',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#7C3AED',
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
    },
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorCookies: {
      enabled: true,
    },
    CapacitorUpdater: {
      autoUpdate: true,
      version: '1.0.0',
      appReadyTimeout: 10000,
      responseTimeout: 10,
    },
  },
};

export default config;

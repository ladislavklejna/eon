import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eon.heating',
  appName: 'EON Topení',
  webDir: 'build',
  server: {
    // Změna na HTTP pro vyřešení Mixed Content problémů
    androidScheme: 'http',
    // Povolit načítání z lokální sítě
    allowNavigation: [
      '10.0.1.51',
      '10.0.1.51:8080',
      '10.0.1.51:4545',
      'http://10.0.1.51:8080',
      'https://10.0.1.51:4545',
      'localhost'
    ]
  },
  android: {
    // Povolit self-signed certifikáty a mixed content
    allowMixedContent: true
  }
};

export default config;

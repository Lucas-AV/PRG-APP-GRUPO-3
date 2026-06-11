import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getApiUrl(): string {
  if (__DEV__) {
    // Em Expo Go, hostUri contém o IP da máquina de desenvolvimento (ex: "192.168.0.10:8081")
    const host = Constants.expoConfig?.hostUri?.split(':')[0];
    if (host) return `http://${host}:3000`;

    // Fallback para emulador Android padrão
    if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
}

export const API_BASE_URL = getApiUrl();

// Substitua pelo Client ID gerado no Google Cloud Console
// Formato: XXXXXXXX.apps.googleusercontent.com
export const GOOGLE_WEB_CLIENT_ID = 'SEU_CLIENT_ID_AQUI.apps.googleusercontent.com';

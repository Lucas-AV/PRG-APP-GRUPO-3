import { Alert } from 'react-native';

export function useComingSoonAlert() {
  return () =>
    Alert.alert('Em desenvolvimento', 'Esta funcionalidade estará disponível em breve.', [{ text: 'OK' }]);
}

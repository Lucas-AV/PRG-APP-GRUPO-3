import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f5ff' }}>
        <ActivityIndicator size="large" color="#0054d6" />
      </View>
    );
  }

  if (user) {
    if (user.onboarding_completed) {
      return <Redirect href="/(tabs)" />;
    } else {
      return <Redirect href="/(onboarding)/step0" />;
    }
  }

  return <Redirect href="/(auth)/login" />;
}

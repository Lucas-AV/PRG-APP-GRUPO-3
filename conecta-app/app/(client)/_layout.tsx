import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function ClientLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.surface },
      }}
    >
      <Stack.Screen name="provider-profile" />
      <Stack.Screen name="provider-reviews" />
      <Stack.Screen name="service-detail" />
      <Stack.Screen name="search" />
      <Stack.Screen name="filter" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    </Stack>
  );
}

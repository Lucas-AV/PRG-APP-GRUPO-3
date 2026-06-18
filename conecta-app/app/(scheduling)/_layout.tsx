import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function SchedulingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: Colors.surface },
      }}
    >
      <Stack.Screen name="book" />
      <Stack.Screen name="appointment-detail" />
      <Stack.Screen name="provider-availability" />
    </Stack>
  );
}

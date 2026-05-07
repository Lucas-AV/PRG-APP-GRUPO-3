import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function AuthorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.surface } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="compose" />
    </Stack>
  );
}

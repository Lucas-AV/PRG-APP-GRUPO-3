// app/admin/_layout.tsx
import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useChronicleStore } from '@/store/chronicleStore';
import { Colors } from '@/constants/theme';

export default function AdminLayout() {
  const setCurrentUser = useChronicleStore((s) => s.setCurrentUser);
  const currentUser = useChronicleStore((s) => s.currentUser);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'superadmin') {
      router.replace('/(auth)/sign-in');
    }
  }, [currentUser]);

  function handleLogout() {
    setCurrentUser(null);
    router.replace('/(auth)/sign-in');
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTitleStyle: { fontFamily: 'WorkSans_700Bold', fontSize: 17, color: Colors.primary },
        headerShadowVisible: false,
        headerBackTitle: 'Voltar',
        headerTintColor: Colors.primary,
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
          >
            <Feather name="log-out" size={20} color={Colors.primary} />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: 'CHRONICLE Admin' }} />
      <Stack.Screen name="users/index" options={{ title: 'Usuários' }} />
      <Stack.Screen name="users/[id]" options={{ title: 'Editar Usuário' }} />
      <Stack.Screen name="tags/index" options={{ title: 'Tags' }} />
      <Stack.Screen name="tags/[id]" options={{ title: 'Tag' }} />
      <Stack.Screen name="cities/index" options={{ title: 'Cidades' }} />
      <Stack.Screen name="cities/[id]" options={{ title: 'Cidade' }} />
      <Stack.Screen name="states/index" options={{ title: 'UFs' }} />
      <Stack.Screen name="states/[id]" options={{ title: 'UF' }} />
      <Stack.Screen name="news" options={{ title: 'Notícias' }} />
      <Stack.Screen name="moderation" options={{ title: 'Moderação' }} />
    </Stack>
  );
}

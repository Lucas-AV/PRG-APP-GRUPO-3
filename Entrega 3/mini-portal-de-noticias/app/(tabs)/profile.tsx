import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useChronicleStore } from '@/store/chronicleStore';
import { Colors, Radius, Spacing } from '@/constants/theme';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

const ROLE_LABELS: Record<string, string> = {
  leitor: 'Leitor',
  autor: 'Autor',
  editor: 'Editor',
  superadmin: 'Admin',
};

const AUTHOR_ROLES = ['autor', 'editor', 'superadmin'];

interface MenuItemProps {
  icon: FeatherIconName;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

function MenuItem({ icon, label, onPress, destructive = false }: MenuItemProps) {
  const color = destructive ? Colors.error : Colors.onSurface;
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.base, gap: Spacing.md }}
    >
      <Feather name={icon} size={20} color={color} />
      <Text style={{ flex: 1, fontFamily: 'WorkSans_500Medium', fontSize: 15, color }}>{label}</Text>
      <Feather name="chevron-right" size={18} color={Colors.onSurfaceVariant} />
    </TouchableOpacity>
  );
}

export default function Profile() {
  const { currentUser, setCurrentUser } = useChronicleStore();

  if (!currentUser) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 32, color: Colors.primary, letterSpacing: -0.5, marginBottom: Spacing.sm }}>
          CHRONICLE
        </Text>
        <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 15, color: Colors.onSurfaceVariant, textAlign: 'center', marginBottom: Spacing['2xl'] }}>
          Entre para salvar notícias, seguir autores e personalizar seu feed.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/sign-in')}
          style={{ width: '100%', backgroundColor: Colors.primary, borderRadius: Radius.DEFAULT, paddingVertical: Spacing.base, alignItems: 'center', marginBottom: Spacing.md }}
        >
          <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 15, color: Colors.onPrimary }}>Entrar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/sign-up')}
          style={{ width: '100%', backgroundColor: Colors.surfaceContainerHigh, borderRadius: Radius.DEFAULT, paddingVertical: Spacing.base, alignItems: 'center' }}
        >
          <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 15, color: Colors.primary }}>Cadastrar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const initials = currentUser.name.charAt(0).toUpperCase();

  function handleLogout() {
    setCurrentUser(null);
    router.replace('/(auth)/sign-in');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Avatar + info */}
        <View style={{ alignItems: 'center', paddingTop: Spacing['2xl'], paddingBottom: Spacing.xl }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md }}>
            <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 32, color: Colors.primary }}>{initials}</Text>
          </View>
          <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 22, color: Colors.primary, marginBottom: 4 }}>
            {currentUser.name}
          </Text>
          <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 14, color: Colors.onSurfaceVariant, marginBottom: Spacing.sm }}>
            {currentUser.email}
          </Text>
          <View style={{ backgroundColor: Colors.surfaceContainerHigh, borderRadius: Radius.full, paddingHorizontal: Spacing.base, paddingVertical: 4 }}>
            <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 12, color: Colors.primary }}>
              {ROLE_LABELS[currentUser.role] ?? currentUser.role}
            </Text>
          </View>
        </View>

        {/* Menu */}
        <View style={{ paddingHorizontal: 20 }}>
          <MenuItem icon="edit-2" label="Editar Perfil" onPress={() => router.push('/profile/edit')} />
          <MenuItem icon="settings" label="Configurações" onPress={() => router.push('/profile/settings')} />
          {AUTHOR_ROLES.includes(currentUser.role) ? (
            <MenuItem
              icon="layout"
              label={currentUser.role === 'autor' ? 'Meus Artigos' : 'Painel Admin'}
              onPress={() => router.push(currentUser.role === 'autor' ? '/author' : '/admin')}
            />
          ) : null}
          <View style={{ height: 1, backgroundColor: Colors.surfaceContainerHigh, marginVertical: Spacing.md }} />
          <MenuItem icon="log-out" label="Sair" onPress={handleLogout} destructive />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

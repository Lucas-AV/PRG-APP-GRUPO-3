import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

type Role = 'cliente' | 'prestador';

const ROLES: { key: Role; label: string; icon: keyof typeof MaterialIcons.glyphMap; desc: string }[] = [
  { key: 'cliente', label: 'Cliente', icon: 'person', desc: 'Quero contratar serviços' },
  { key: 'prestador', label: 'Prestador', icon: 'work', desc: 'Quero oferecer serviços' },
];

export default function GoogleRoleScreen() {
  const { access_token, name, email } = useLocalSearchParams<{
    access_token: string;
    name: string;
    email: string;
  }>();
  const { loginWithGoogle } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedRole) {
      Alert.alert('Atenção', 'Selecione como você vai usar o Conecta.');
      return;
    }
    setLoading(true);
    try {
      const result = await loginWithGoogle(access_token, selectedRole);
      if ('isNewUser' in result) {
        Alert.alert('Erro', 'Não foi possível criar a conta. Tente novamente.');
        return;
      }
      await SecureStore.deleteItemAsync(`onboarding_${result.id}`);
      router.replace('/(onboarding)/step0');
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.googleIcon}>
            <MaterialIcons name="language" size={28} color="#4285F4" />
          </View>
          <Text style={styles.title}>Quase lá!</Text>
          <Text style={styles.subtitle}>
            Olá, <Text style={styles.nameHighlight}>{name}</Text>. Para finalizar seu cadastro, nos diga como você vai usar o Conecta.
          </Text>
          <Text style={styles.emailHint}>{email}</Text>
        </View>

        {/* Role chips */}
        <View style={styles.roles}>
          {ROLES.map(r => {
            const active = selectedRole === r.key;
            return (
              <Pressable
                key={r.key}
                style={[styles.roleCard, active && styles.roleCardActive]}
                onPress={() => setSelectedRole(r.key)}
              >
                <View style={[styles.roleIcon, active && styles.roleIconActive]}>
                  <MaterialIcons
                    name={r.icon}
                    size={28}
                    color={active ? Colors.primary : Colors.outline}
                  />
                </View>
                <View style={styles.roleText}>
                  <Text style={[styles.roleLabel, active && styles.roleLabelActive]}>
                    {r.label}
                  </Text>
                  <Text style={styles.roleDesc}>{r.desc}</Text>
                </View>
                {active && (
                  <MaterialIcons name="check-circle" size={22} color={Colors.primary} />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Confirm button */}
        <Pressable
          style={({ pressed }) => [
            styles.confirmBtn,
            !selectedRole && styles.confirmBtnDisabled,
            pressed && selectedRole ? { opacity: 0.85 } : null,
          ]}
          onPress={handleConfirm}
          disabled={loading || !selectedRole}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmLabel}>Criar conta →</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl,
    gap: Spacing.xxxl,
    justifyContent: 'center',
  },
  header: { alignItems: 'center', gap: Spacing.base },
  googleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 28,
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  nameHighlight: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurface,
  },
  emailHint: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.outline,
  },
  roles: { gap: Spacing.base },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    padding: Spacing.xl,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant + '33',
  },
  roleCardActive: {
    borderColor: Colors.primary + '66',
    backgroundColor: Colors.primaryContainer + '33',
  },
  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconActive: {
    backgroundColor: Colors.primaryContainer,
  },
  roleText: { flex: 1 },
  roleLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 16,
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  roleLabelActive: { color: Colors.primary },
  roleDesc: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.base + 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  confirmBtnDisabled: {
    backgroundColor: Colors.outline,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 16,
    color: '#fff',
    letterSpacing: -0.2,
  },
});

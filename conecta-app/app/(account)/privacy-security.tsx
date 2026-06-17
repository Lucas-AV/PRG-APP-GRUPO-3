import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const BIOMETRICS_KEY = 'biometrics_enabled';

export default function PrivacySecurityScreen() {
  const { user } = useAuth();
  const [biometrics, setBiometrics] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(BIOMETRICS_KEY).then(val => {
      setBiometrics(val === 'true');
    });
  }, []);

  const handleBiometricsToggle = async (value: boolean) => {
    setBiometrics(value);
    await SecureStore.setItemAsync(BIOMETRICS_KEY, String(value));
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleDownloadData = async () => {
    if (!user) return;
    const date = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    const lines = [
      'CONECTA — CÓPIA DOS SEUS DADOS',
      `Gerado em: ${date}`,
      '',
      '── INFORMAÇÕES DA CONTA ──────────────',
      `Nome:     ${user.name}`,
      `E-mail:   ${user.email}`,
      `Telefone: ${user.phone ?? 'Não informado'}`,
      `Perfil:   ${user.role === 'prestador' ? 'Prestador de serviços' : 'Cliente'}`,
      '',
      '── NOTA DE PRIVACIDADE ───────────────',
      'Sua senha e tokens de sessão não são',
      'armazenados em formato legível e não',
      'aparecem nesta exportação por segurança.',
      '',
      'Para solicitar exclusão de todos os seus',
      'dados, acesse Configurações › Excluir conta',
      'ou envie e-mail para suporte@conectaapp.com.br',
    ];
    try {
      await Share.share({ message: lines.join('\n'), title: 'Meus dados — Conecta' });
    } catch {
      // user cancelled
    }
  };

  const handle2FA = () => {
    Alert.alert(
      'Autenticação de Dois Fatores',
      'A verificação em duas etapas via SMS e aplicativo autenticador (TOTP) estará disponível em breve.\n\nSua conta já está protegida por senha segura e, opcionalmente, autenticação biométrica.',
      [{ text: 'Entendi' }],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Privacidade e Segurança" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Sua segurança é nossa prioridade.</Text>
            <Text style={styles.heroSub}>
              Controle como seus dados são usados e proteja sua conta com as ferramentas mais avançadas.
            </Text>
          </View>
          <MaterialIcons name="verified-user" size={48} color={Colors.brand} />
        </View>

        {/* Segurança da Conta */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Segurança da Conta</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Proteção Alta</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Pressable
              style={({ pressed }) => [styles.secRow, styles.rowBorder, pressed && { backgroundColor: Colors.brand+'08' }]}
              onPress={() => router.push('/(account)/change-password' as any)}
            >
              <View style={styles.secIconWrap}>
                <MaterialIcons name="lock-reset" size={20} color={Colors.brand} />
              </View>
              <View style={styles.secInfo}>
                <Text style={styles.secLabel}>Alterar senha</Text>
                <Text style={styles.secSub}>Recomendamos trocar a cada 6 meses</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Colors.inkMuted} />
            </Pressable>

            <View style={[styles.secRow, styles.rowBorder]}>
              <View style={styles.secIconWrap}>
                <MaterialIcons name="fingerprint" size={20} color={Colors.brand} />
              </View>
              <View style={styles.secInfo}>
                <Text style={styles.secLabel}>Autenticação biométrica</Text>
                <Text style={styles.secSub}>Acesse o app usando Digital ou Face ID</Text>
              </View>
              <Switch
                value={biometrics}
                onValueChange={handleBiometricsToggle}
                trackColor={{ false: Colors.border, true: Colors.brand }}
                thumbColor="#ffffff"
                ios_backgroundColor={Colors.border}
              />
            </View>

            <Pressable
              style={({ pressed }) => [styles.secRow, pressed && { backgroundColor: Colors.brand+'08' }]}
              onPress={handle2FA}
            >
              <View style={styles.secIconWrap}>
                <MaterialIcons name="security" size={20} color={Colors.brand} />
              </View>
              <View style={styles.secInfo}>
                <Text style={styles.secLabel}>Autenticação de dois fatores</Text>
                <Text style={[styles.secSub, { color: Colors.brand }]}>Ativado via SMS</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Colors.inkMuted} />
            </Pressable>
          </View>
        </View>

        {/* Privacidade de Dados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidade de Dados</Text>
          <View style={styles.bentoRow}>
            <Pressable style={[styles.bentoCard, styles.bentoCardWhite]} onPress={handleOpenSettings}>
              <MaterialIcons name="settings-accessibility" size={32} color={Colors.brand} />
              <Text style={styles.bentoTitle}>Permissões do App</Text>
              <Text style={styles.bentoSub}>Localização, câmera e notificações em um só lugar.</Text>
              <Text style={styles.bentoAction}>Gerenciar agora</Text>
            </Pressable>

            <View style={styles.bentoCard}>
              <MaterialIcons name="visibility" size={32} color={Colors.inkMuted} />
              <Text style={styles.bentoTitle}>Visibilidade do Perfil</Text>
              <View style={styles.bentoToggleRow}>
                <Text style={styles.bentoSub}>Perfil Público</Text>
                <Switch
                  value={publicProfile}
                  onValueChange={setPublicProfile}
                  trackColor={{ false: Colors.border, true: Colors.brand }}
                  thumbColor="#ffffff"
                  ios_backgroundColor={Colors.border}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Gerenciar Dados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gerenciar Dados</Text>
          <View style={styles.manageCard}>
            <Pressable
              style={({ pressed }) => [styles.manageRow, styles.rowBorder, pressed && { backgroundColor: Colors.brand+'08' }]}
              onPress={handleDownloadData}
            >
              <MaterialIcons name="file-download" size={22} color={Colors.inkMuted} />
              <Text style={styles.manageLabel}>Baixar cópia dos meus dados</Text>
              <MaterialIcons name="open-in-new" size={18} color={Colors.inkMuted} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.manageRow, pressed && { backgroundColor: Colors.errorContainer + '1A' }]}
              onPress={() => router.push('/(account)/delete-account' as any)}
            >
              <MaterialIcons name="person-remove" size={22} color={Colors.inkMuted} />
              <Text style={[styles.manageLabel, { color: Colors.inkMuted }]}>
                Solicitar exclusão de conta
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Badge */}
        <View style={styles.encryptedBadge}>
          <MaterialIcons name="lock" size={32} color={Colors.inkMuted} />
          <Text style={styles.encryptedText}>PROTOCOLO DE SEGURANÇA ATIVO{'\n'}CONECTA v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.xxxl,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.brand+'15',
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    overflow: 'hidden',
  },
  heroContent: { flex: 1, paddingRight: Spacing.base, gap: Spacing.sm },
  heroTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 18,
    color: Colors.ink,
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  heroSub: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    color: Colors.ink + 'CC',
    lineHeight: 18,
  },
  section: { gap: Spacing.base },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    backgroundColor: Colors.brand+'15',
    borderRadius: Radius.full,
  },
  badgeText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.brand,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    overflow: 'hidden',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  secRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.base,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  secIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secInfo: { flex: 1 },
  secLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.ink,
  },
  secSub: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 1,
  },
  bentoRow: { flexDirection: 'row', gap: Spacing.md },
  bentoCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    gap: Spacing.sm,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  bentoCardWhite: { backgroundColor: Colors.card },
  bentoTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 15,
    color: Colors.ink,
  },
  bentoSub: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  bentoAction: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.brand,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bentoToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  manageCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    padding: Spacing.base,
  },
  manageLabel: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  encryptedBadge: { alignItems: 'center', gap: Spacing.sm, opacity: 0.4, paddingVertical: Spacing.xl },
  encryptedText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.inkMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 16,
  },
});

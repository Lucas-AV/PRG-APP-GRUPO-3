import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/gradient-button';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

const FAQ_ITEMS = [
  { icon: 'payment' as const, label: 'Pagamentos e Reembolsos' },
  { icon: 'calendar-today' as const, label: 'Agendamentos e Cancelamentos' },
  { icon: 'verified-user' as const, label: 'Segurança e Privacidade' },
  { icon: 'help' as const, label: 'Como usar o Conecta' },
];

const CONTACTS = [
  { icon: 'chat' as const, label: 'WhatsApp' },
  { icon: 'mail' as const, label: 'E-mail' },
  { icon: 'call' as const, label: 'Ligar' },
];

export default function SupportScreen() {
  const comingSoon = () =>
    Alert.alert('Em desenvolvimento', 'Esta funcionalidade estará disponível em breve.', [{ text: 'OK' }]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Suporte e Ajuda" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Status card */}
        <View style={styles.statusCard}>
          <View style={styles.statusTop}>
            <View style={styles.statusInfo}>
              <View style={styles.statusDotRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusTitle}>Suporte Online</Text>
              </View>
              <Text style={styles.statusSub}>Estamos prontos para te ajudar agora.</Text>
            </View>
            <View style={styles.statusAvatar}>
              <MaterialIcons name="support-agent" size={32} color={Colors.primary} />
            </View>
          </View>
          <GradientButton label="Iniciar Chat" onPress={comingSoon} style={{ marginTop: Spacing.xl }} />
        </View>

        {/* Fale conosco */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fale Conosco</Text>
          <View style={styles.contactGrid}>
            {CONTACTS.map(c => (
              <Pressable
                key={c.label}
                style={({ pressed }) => [styles.contactCard, pressed && { opacity: 0.85 }]}
                onPress={comingSoon}
              >
                <View style={styles.contactIconWrap}>
                  <MaterialIcons name={c.icon} size={24} color={Colors.primary} />
                </View>
                <Text style={styles.contactLabel}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <View style={styles.faqHeader}>
            <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
            <Text style={styles.seeAll}>VER TUDO</Text>
          </View>
          <View style={styles.faqCard}>
            {FAQ_ITEMS.map((item, idx) => (
              <View key={item.label}>
                <Pressable
                  style={({ pressed }) => [styles.faqRow, pressed && { backgroundColor: Colors.surfaceContainerLow }]}
                  onPress={comingSoon}
                >
                  <View style={styles.faqIconWrap}>
                    <MaterialIcons name={item.icon} size={20} color={Colors.onSurfaceVariant} />
                  </View>
                  <Text style={styles.faqLabel}>{item.label}</Text>
                  <MaterialIcons name="chevron-right" size={20} color={Colors.outlineVariant} />
                </Pressable>
                {idx < FAQ_ITEMS.length - 1 && <View style={styles.faqDivider} />}
              </View>
            ))}
          </View>
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
  statusCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  statusTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  statusInfo: { flex: 1, gap: Spacing.xs },
  statusDotRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
  },
  statusTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 17,
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  statusSub: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  statusAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { gap: Spacing.base },
  sectionTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 20,
    color: Colors.onSurface,
    letterSpacing: -0.4,
  },
  contactGrid: { flexDirection: 'row', gap: Spacing.md },
  contactCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  contactIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.onSurface,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  faqHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  seeAll: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 1.5,
  },
  faqCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  faqIconWrap: {
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainer,
  },
  faqLabel: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.onSurface,
  },
  faqDivider: {
    height: 1,
    backgroundColor: Colors.surfaceContainer,
    marginHorizontal: Spacing.xl,
  },
});

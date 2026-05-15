import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, GradientColors, Spacing, Radius } from '@/constants/theme';

const RECEIPT = {
  serviceName: 'Instalação de Carregador EV',
  providerName: 'Jane Doe',
  providerInitials: 'JD',
  date: '24 Jan 2024, 14:30',
  amount: 'R$ 450,00',
  paymentMethod: 'Visa •••• 1234',
  transactionCode: '#SV-987654321',
  description:
    'Instalação profissional de estação de carregamento de Nível 2. Inclui avaliação de atualização do painel e montagem.',
  iconBg: '#eff6ff',
  iconColor: '#2563eb',
};

export default function ReceiptScreen() {
  const comingSoon = () =>
    Alert.alert('Em desenvolvimento', 'Esta funcionalidade estará disponível em breve.', [{ text: 'OK' }]);

  const copyCode = () =>
    Alert.alert('Copiado!', `${RECEIPT.transactionCode} copiado para a área de transferência.`, [
      { text: 'OK' },
    ]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Comprovante" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Success header */}
        <View style={styles.successHeader}>
          <View style={styles.successIconWrap}>
            <MaterialIcons name="check-circle" size={56} color={Colors.primary} />
          </View>
          <Text style={styles.successTitle}>Pagamento Realizado{'\n'}com Sucesso!</Text>
          <Text style={styles.successSub}>Sua transação foi processada com segurança.</Text>
        </View>

        {/* Service card */}
        <View style={styles.serviceCard}>
          <View style={[styles.serviceIconBox, { backgroundColor: RECEIPT.iconBg }]}>
            <MaterialIcons name="flash-on" size={28} color={RECEIPT.iconColor} />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{RECEIPT.serviceName}</Text>
            <View style={styles.providerRow}>
              <View style={styles.providerAvatar}>
                <Text style={styles.providerInitials}>{RECEIPT.providerInitials}</Text>
              </View>
              <Text style={styles.providerName}>{RECEIPT.providerName}</Text>
            </View>
          </View>
        </View>

        {/* Transaction details */}
        <View style={styles.details}>
          {/* 2-col: date + amount */}
          <View style={styles.detailRow2}>
            <View style={[styles.detailCard, styles.flex1]}>
              <Text style={styles.detailLabel}>Data e Hora</Text>
              <Text style={styles.detailValue}>{RECEIPT.date}</Text>
            </View>
            <View style={[styles.detailCard, styles.flex1]}>
              <Text style={styles.detailLabel}>Valor Total</Text>
              <Text style={[styles.detailValue, { color: Colors.primary }]}>{RECEIPT.amount}</Text>
            </View>
          </View>

          {/* Payment method */}
          <View style={[styles.detailCard, styles.detailRowBetween]}>
            <View>
              <Text style={styles.detailLabel}>Método de Pagamento</Text>
              <View style={styles.paymentMethodRow}>
                <MaterialIcons name="credit-card" size={16} color={Colors.onSurfaceVariant} />
                <Text style={styles.detailValue}>{RECEIPT.paymentMethod}</Text>
              </View>
            </View>
            <MaterialIcons name="verified" size={24} color={Colors.outlineVariant} />
          </View>

          {/* Transaction code */}
          <View style={[styles.detailCard, styles.detailRowBetween]}>
            <View>
              <Text style={styles.detailLabel}>Código da Transação</Text>
              <Text style={[styles.detailValue, styles.mono]}>{RECEIPT.transactionCode}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.copyBtn, pressed && { opacity: 0.6 }]}
              onPress={copyCode}
            >
              <MaterialIcons name="content-copy" size={20} color={Colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Service description */}
        <View style={styles.descSection}>
          <Text style={styles.descTitle}>Resumo dos Serviços</Text>
          <Text style={styles.descText}>{RECEIPT.description}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.downloadWrap,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            onPress={comingSoon}
          >
            <LinearGradient
              colors={GradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.downloadBtn}
            >
              <MaterialIcons name="file-download" size={20} color="#ffffff" />
              <Text style={styles.downloadBtnLabel}>Baixar Comprovante</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.helpBtn, pressed && { opacity: 0.85 }]}
            onPress={comingSoon}
          >
            <MaterialIcons name="help-outline" size={20} color={Colors.onSecondaryContainer} />
            <Text style={styles.helpBtnLabel}>Preciso de Ajuda</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnLabel}>Voltar para o Início</Text>
          </Pressable>
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

  // Success header
  successHeader: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  successTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 24,
    color: Colors.onSurface,
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  successSub: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },

  // Service card
  serviceCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  serviceIconBox: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: { flex: 1, gap: Spacing.xs },
  serviceName: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 15,
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  providerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerInitials: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 8,
    color: Colors.primary,
  },
  providerName: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },

  // Details bento
  details: { gap: Spacing.base },
  detailRow2: { flexDirection: 'row', gap: Spacing.base },
  flex1: { flex: 1 },
  detailCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: Spacing.base,
  },
  detailRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  detailValue: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  mono: {
    fontFamily: FontFamily.bodyRegular,
    letterSpacing: 0.5,
  },
  copyBtn: {
    padding: Spacing.xs,
  },

  // Description
  descSection: { gap: Spacing.sm, paddingHorizontal: Spacing.xs },
  descTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  descText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },

  // Actions
  actions: { gap: Spacing.md },
  downloadWrap: {
    borderRadius: Radius.sm,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
  },
  downloadBtnLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 16,
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.secondaryContainer,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.base,
  },
  helpBtnLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 15,
    color: Colors.onSecondaryContainer,
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  backBtnLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 15,
    color: Colors.primary,
  },
});

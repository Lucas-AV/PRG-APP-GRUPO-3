import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/gradient-button';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

const SAVED_CARDS = [
  { id: '1', brand: 'Visa', last4: '1234', expiry: '08/27' },
  { id: '2', brand: 'Mastercard', last4: '5678', expiry: '12/25' },
];

const RECENT_TRANSACTIONS = [
  {
    id: '1',
    icon: 'build' as const,
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
    title: 'Encanador Profissional',
    date: 'Ontem • 14:30',
    amount: 'R$ 180,00',
  },
  {
    id: '2',
    icon: 'brush' as const,
    iconBg: '#f5f3ff',
    iconColor: '#7c3aed',
    title: 'Limpeza Residencial',
    date: '12 Set 2023',
    amount: 'R$ 150,00',
  },
  {
    id: '3',
    icon: 'flash-on' as const,
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
    title: 'Reparo Elétrico',
    date: '05 Set 2023',
    amount: 'R$ 120,00',
  },
];

export default function PaymentsScreen() {
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; description: string } | null>({
    code: 'SEVGEN20',
    description: '20% de desconto no próximo serviço',
  });

  const comingSoon = () =>
    Alert.alert('Em desenvolvimento', 'Esta funcionalidade estará disponível em breve.', [{ text: 'OK' }]);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setActiveCoupon({ code: couponCode.toUpperCase(), description: 'Cupom aplicado com sucesso.' });
    setCouponCode('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Pagamentos" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Balance card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Saldo Conecta</Text>
            <Text style={styles.balanceAmount}>R$ 450,00</Text>
          </View>
          <GradientButton label="Adicionar Saldo" onPress={comingSoon} style={{ alignSelf: 'stretch' }} />
        </View>

        {/* Saved cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cartões salvos</Text>
          <View style={styles.cardsContainer}>
            {SAVED_CARDS.map((card, idx) => (
              <Pressable
                key={card.id}
                style={({ pressed }) => [
                  styles.cardRow,
                  idx < SAVED_CARDS.length - 1 && styles.cardRowBorder,
                  pressed && { backgroundColor: Colors.surfaceContainerLow },
                ]}
                onPress={comingSoon}
              >
                <View style={styles.cardIconWrap}>
                  <MaterialIcons name="credit-card" size={22} color={Colors.primary} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardBrand}>{card.brand} final {card.last4}</Text>
                  <Text style={styles.cardExpiry}>Expira em {card.expiry}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={Colors.outline} />
              </Pressable>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [styles.addCardBtn, pressed && { opacity: 0.7 }]}
            onPress={comingSoon}
          >
            <MaterialIcons name="add" size={20} color={Colors.primary} />
            <Text style={styles.addCardLabel}>Adicionar novo cartão</Text>
          </Pressable>
        </View>

        {/* Coupons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cupons e Descontos</Text>
          <View style={styles.couponInputRow}>
            <MaterialIcons name="local-offer" size={20} color={Colors.outline} style={{ marginLeft: Spacing.base }} />
            <TextInput
              style={styles.couponInput}
              placeholder="Inserir código de cupom"
              placeholderTextColor={Colors.outline}
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
            />
            <Pressable
              style={({ pressed }) => [styles.couponApplyBtn, pressed && { opacity: 0.85 }]}
              onPress={handleApplyCoupon}
            >
              <Text style={styles.couponApplyLabel}>Aplicar</Text>
            </Pressable>
          </View>
          {activeCoupon && (
            <View style={styles.activeCouponCard}>
              <View style={styles.activeCouponIconWrap}>
                <MaterialIcons name="percent" size={22} color="#ffffff" />
              </View>
              <View style={styles.activeCouponInfo}>
                <Text style={styles.activeCouponCode}>{activeCoupon.code}</Text>
                <Text style={styles.activeCouponDesc}>{activeCoupon.description}</Text>
              </View>
              <Pressable onPress={() => setActiveCoupon(null)}>
                <Text style={styles.removeCoupon}>Remover</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Recent transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimas Transações</Text>
            <Pressable onPress={() => router.push('/(account)/payment-history' as any)}>
              <Text style={styles.seeAll}>Ver histórico completo</Text>
            </Pressable>
          </View>
          <View style={styles.transactionsCard}>
            {RECENT_TRANSACTIONS.map((tx, idx) => (
              <View key={tx.id}>
                <View style={styles.txRow}>
                  <View style={[styles.txIconWrap, { backgroundColor: tx.iconBg }]}>
                    <MaterialIcons name={tx.icon} size={20} color={tx.iconColor} />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>{tx.title}</Text>
                    <Text style={styles.txDate}>{tx.date}</Text>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={styles.txAmount}>{tx.amount}</Text>
                    <Text style={styles.txStatus}>Concluído</Text>
                  </View>
                </View>
                {idx < RECENT_TRANSACTIONS.length - 1 && <View style={styles.txDivider} />}
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
  balanceCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    gap: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  balanceInfo: { gap: Spacing.xs },
  balanceLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  balanceAmount: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 32,
    color: Colors.onSurface,
    letterSpacing: -1,
  },
  section: { gap: Spacing.base },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 20,
    color: Colors.onSurface,
    letterSpacing: -0.4,
  },
  seeAll: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.primary,
  },
  cardsContainer: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.base,
  },
  cardRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  cardIconWrap: {
    width: 44,
    height: 32,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardBrand: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  cardExpiry: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant + '4D',
    borderRadius: Radius.md,
  },
  addCardLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.primary,
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radius.full,
    gap: Spacing.sm,
    paddingRight: Spacing.xs,
  },
  couponInput: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurface,
    paddingVertical: Spacing.md,
  },
  couponApplyBtn: {
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  couponApplyLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: Colors.primary,
  },
  activeCouponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    backgroundColor: Colors.primaryContainer + '4D',
    borderWidth: 1,
    borderColor: Colors.primary + '1A',
    borderRadius: Radius.md,
    padding: Spacing.base,
  },
  activeCouponIconWrap: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  activeCouponInfo: { flex: 1, gap: 2 },
  activeCouponCode: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.onPrimaryContainer,
  },
  activeCouponDesc: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  removeCoupon: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 12,
    color: Colors.error,
  },
  transactionsCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    padding: Spacing.base,
  },
  txIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: { flex: 1, gap: 2 },
  txTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  txDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  txRight: { alignItems: 'flex-end', gap: 2 },
  txAmount: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  txStatus: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 10,
    color: '#16a34a',
  },
  txDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.surfaceContainer,
    marginHorizontal: Spacing.base,
  },
});

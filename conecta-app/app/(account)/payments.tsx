import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientButton } from '@/components/ui/gradient-button';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, GradientColors, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { transactionsApi, Transaction, cardsApi, Card, subscriptionsApi, paymentsApi } from '@/services/api';
import { useComingSoonAlert } from '@/hooks/useComingSoonAlert';


const STATUS_LABEL: Record<string, string> = {
  concluido: 'Concluído',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
};

const STATUS_COLOR: Record<string, string> = {
  concluido: '#16a34a',
  pendente: '#d97706',
  cancelado: '#e11d48',
};

export default function PaymentsScreen() {
  const { user, token } = useAuth();
  const {
    subscribe_plan_id,
    subscribe_plan_name,
    subscribe_plan_price,
  } = useLocalSearchParams<{
    subscribe_plan_id?: string;
    subscribe_plan_name?: string;
    subscribe_plan_price?: string;
  }>();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; description: string } | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  const handleConfirmSubscription = async () => {
    if (!user || !token || !subscribe_plan_id) return;
    setSubscribing(true);
    try {
      const planId = parseInt(subscribe_plan_id, 10);
      await subscriptionsApi.subscribe(user.id, planId, token);
      Alert.alert(
        'Assinatura ativada',
        `Você agora tem o plano ${subscribe_plan_name}!`,
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível realizar a assinatura.');
    } finally {
      setSubscribing(false);
    }
  };

  useEffect(() => {
    if (!user || !token) return;
    transactionsApi.list(user.id, token)
      .then(txs => setRecentTransactions(txs.slice(0, 3)))
      .catch(() => setRecentTransactions([]));
  }, [user, token]);

  useEffect(() => {
    if (!user || !token) return;
    subscriptionsApi.get(user.id, token)
      .then(sub => setBalance(sub.is_subscribed ? sub.plan_price : 0))
      .catch(() => setBalance(0));
  }, [user, token]);

  const loadCards = () => {
    if (!user || !token) return;
    cardsApi.list(user.id, token)
      .then(setCards)
      .catch(() => setCards([]));
  };

  useEffect(() => { loadCards(); }, [user, token]);

  const comingSoon = useComingSoonAlert();

  const handleApplyCoupon = async () => {
    const trimmedCode = couponCode.trim();
    if (!trimmedCode || !token) return;
    try {
      const coupon = await paymentsApi.validateCoupon(trimmedCode, token);
      setActiveCoupon({ code: coupon.code, description: coupon.description });
      Alert.alert('Cupom aplicado', `O cupom ${coupon.code} foi aplicado com sucesso!`);
      setCouponCode('');
    } catch (e: any) {
      Alert.alert('Erro ao aplicar cupom', e.message ?? 'Código de cupom inválido.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Pagamentos" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Plan subscription checkout */}
        {!!subscribe_plan_id && (
          <View style={styles.checkoutCard}>
            <View style={styles.checkoutHeader}>
              <MaterialIcons name="workspace-premium" size={24} color={Colors.brand} />
              <Text style={styles.checkoutTitle}>Confirmar Assinatura</Text>
            </View>
            <View style={styles.checkoutRow}>
              <Text style={styles.checkoutPlanName}>{subscribe_plan_name}</Text>
              <Text style={styles.checkoutPlanPrice}>
                R$ {parseFloat(subscribe_plan_price ?? '0').toFixed(2).replace('.', ',')}/mês
              </Text>
            </View>
            <Text style={styles.checkoutNote}>
              O valor será cobrado no cartão selecionado abaixo.
            </Text>
            <GradientButton
              label={subscribing ? 'Aguarde...' : 'Confirmar e Assinar'}
              onPress={handleConfirmSubscription}
              disabled={subscribing}
            />
          </View>
        )}

        {/* Balance card */}
        <LinearGradient colors={GradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Saldo Conecta</Text>
            <Text style={styles.balanceAmount}>
              {balance == null
                ? '—'
                : `R$ ${balance.toFixed(2).replace('.', ',')}`}
            </Text>
          </View>
          <GradientButton label="Adicionar Saldo" onPress={() => router.push('/(account)/add-balance' as any)} style={{ alignSelf: 'stretch' }} />
        </LinearGradient>

        {/* Saved cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cartões salvos</Text>
          <View style={styles.cardsContainer}>
            {cards.length === 0 ? (
              <Text style={styles.emptyCards}>Nenhum cartão salvo.</Text>
            ) : (
              cards.map((card, idx) => (
                <Pressable
                  key={card.id.toString()}
                  style={({ pressed }) => [
                    styles.cardRow,
                    idx < cards.length - 1 && styles.cardRowBorder,
                    pressed && { backgroundColor: Colors.brand + '08' },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: '/(account)/card-detail' as any,
                      params: {
                        brand: card.brand,
                        last4: card.last_four,
                        expiry: `${card.expiry_month}/${card.expiry_year}`,
                      },
                    })
                  }
                >
                  <View style={styles.cardIconWrap}>
                    <MaterialIcons name="credit-card" size={22} color={Colors.brand} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardBrand}>{card.brand} final {card.last_four}</Text>
                    <Text style={styles.cardExpiry}>Expira em {card.expiry_month}/{card.expiry_year}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={Colors.inkMuted} />
                </Pressable>
              ))
            )}
          </View>
          <Pressable
            style={({ pressed }) => [styles.addCardBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/(account)/new-card' as any)}
          >
            <MaterialIcons name="add" size={20} color={Colors.brand} />
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
            {recentTransactions.length === 0 ? (
              <Text style={styles.emptyTransactions}>Nenhuma transação encontrada.</Text>
            ) : (
              recentTransactions.map((tx, idx) => (
                <View key={tx.id}>
                  <View style={styles.txRow}>
                    <View style={[styles.txIconWrap, { backgroundColor: '#eff6ff' }]}>
                      <MaterialIcons name={'build' as const} size={20} color={'#2563eb'} />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txTitle}>{tx.service_name}</Text>
                      <Text style={styles.txDate}>
                        {new Date(tx.paid_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </Text>
                    </View>
                    <View style={styles.txRight}>
                      <Text style={styles.txAmount}>{`R$ ${tx.amount.toFixed(2).replace('.', ',')}`}</Text>
                      <Text style={[styles.txStatus, { color: STATUS_COLOR[tx.status] ?? '#16a34a' }]}>
                        {STATUS_LABEL[tx.status] ?? tx.status}
                      </Text>
                    </View>
                  </View>
                  {idx < recentTransactions.length - 1 && <View style={styles.txDivider} />}
                </View>
              ))
            )}
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  checkoutCard: {
    backgroundColor: Colors.brand + '15',
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    gap: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  checkoutTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 18,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  checkoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutPlanName: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 16,
    color: Colors.ink,
  },
  checkoutPlanPrice: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 18,
    color: Colors.brand,
    letterSpacing: -0.5,
  },
  checkoutNote: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.inkMuted,
    marginBottom: Spacing.sm,
  },
  balanceCard: {
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    gap: Spacing.xl,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  balanceInfo: { gap: Spacing.xs },
  balanceLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  balanceAmount: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 32,
    color: '#ffffff',
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
    color: Colors.ink,
    letterSpacing: -0.4,
  },
  seeAll: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.brand,
  },
  cardsContainer: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    overflow: 'hidden',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyCards: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.base,
  },
  cardRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  cardIconWrap: {
    width: 44,
    height: 32,
    backgroundColor: Colors.brand + '12',
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardBrand: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.ink,
  },
  cardExpiry: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: Radius.md,
  },
  addCardLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.brand,
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    gap: Spacing.sm,
    paddingRight: Spacing.xs,
  },
  couponInput: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.ink,
    paddingVertical: Spacing.md,
  },
  couponApplyBtn: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  couponApplyLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: Colors.brand,
  },
  activeCouponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    backgroundColor: Colors.brand + '10',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.base,
  },
  activeCouponIconWrap: {
    backgroundColor: Colors.brand,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  activeCouponInfo: { flex: 1, gap: 2 },
  activeCouponCode: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.ink,
  },
  activeCouponDesc: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  removeCoupon: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 12,
    color: Colors.error,
  },
  transactionsCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    overflow: 'hidden',
    shadowColor: Colors.ink,
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
    color: Colors.ink,
  },
  txDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  txRight: { alignItems: 'flex-end', gap: 2 },
  txAmount: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.ink,
  },
  txStatus: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 10,
    color: '#16a34a',
  },
  txDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.base,
  },
  emptyTransactions: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
    padding: Spacing.xxl,
  },
});

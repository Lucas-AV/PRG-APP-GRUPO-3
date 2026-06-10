import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { GradientButton } from '@/components/ui/gradient-button';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, GradientColors, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { plansApi, subscriptionsApi, Plan, Subscription } from '@/services/api';

type Tab = 'cliente' | 'prestador';

export default function PlansScreen() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState<Tab>(user?.role === 'prestador' ? 'prestador' : 'cliente');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async (role: Tab) => {
    setLoading(true);
    try {
      const [fetchedPlans, fetchedSub] = await Promise.all([
        plansApi.list(role),
        user && token ? subscriptionsApi.get(user.id, token) : Promise.resolve(null),
      ]);
      setPlans(fetchedPlans);
      setSubscription(fetchedSub);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(tab); }, [tab]);

  const handleSubscribe = (planId: number) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    router.push({
      pathname: '/(account)/payments' as any,
      params: {
        subscribe_plan_id: String(plan.id),
        subscribe_plan_name: plan.name,
        subscribe_plan_price: String(plan.price),
      },
    });
  };

  const freePlan = plans.find(p => p.price === 0);
  const premiumPlan = plans.find(p => p.price > 0);
  const activePlanId = subscription?.is_subscribed ? subscription.plan_id : freePlan?.id;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Assinaturas" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Segmented control */}
        <View style={styles.segTrack}>
          <Pressable
            style={[styles.segItem, tab === 'cliente' && styles.segItemActive]}
            onPress={() => setTab('cliente')}
          >
            <Text style={[styles.segLabel, tab === 'cliente' && styles.segLabelActive]}>
              Para Clientes
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segItem, tab === 'prestador' && styles.segItemActive]}
            onPress={() => setTab('prestador')}
          >
            <Text style={[styles.segLabel, tab === 'prestador' && styles.segLabelActive]}>
              Para Prestadores
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: Spacing.xxxl }} />
        ) : tab === 'cliente' ? (
          <ClientTab
            freePlan={freePlan}
            premiumPlan={premiumPlan}
            subscription={subscription}
            activePlanId={activePlanId}
            onSubscribe={handleSubscribe}
          />
        ) : (
          <WorkerTab
            freePlan={freePlan}
            premiumPlan={premiumPlan}
            subscription={subscription}
            activePlanId={activePlanId}
            onSubscribe={handleSubscribe}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

type TabProps = {
  freePlan?: Plan;
  premiumPlan?: Plan;
  subscription: Subscription | null;
  activePlanId?: number;
  onSubscribe: (planId: number) => void;
};

function ClientTab({ freePlan, premiumPlan, subscription, activePlanId, onSubscribe }: TabProps) {
  const isOnFree = !subscription?.is_subscribed;
  const activeName = subscription?.is_subscribed ? subscription.plan_name : (freePlan?.name ?? 'Free');
  const activeFeatures = subscription?.is_subscribed
    ? subscription.features
    : (freePlan?.features ?? []);

  return (
    <View style={tabs.wrap}>
      {/* Current plan card */}
      <View style={tabs.planCard}>
        <View style={tabs.planCardContent}>
          <View style={tabs.planBadge}>
            <Text style={tabs.planBadgeText}>PLANO ATIVO</Text>
          </View>
          <Text style={tabs.planTitle}>{activeName}</Text>
          <Text style={tabs.planSub}>
            {isOnFree
              ? 'Ideal para quem está começando e busca serviços pontuais.'
              : `Assinatura ativa • R$ ${subscription?.plan_price?.toFixed(2)}/mês`}
          </Text>
          {activeFeatures.length > 0 && (
            <View style={tabs.planFeatures}>
              {activeFeatures.map((f, i) => <PlanFeature key={i} label={f} />)}
            </View>
          )}
          {subscription?.is_subscribed && (
            <Pressable
              style={({ pressed }) => [tabs.manageBtn, pressed && { opacity: 0.8 }]}
              onPress={() => freePlan && onSubscribe(freePlan.id)}
            >
              <Text style={tabs.manageBtnLabel}>Cancelar Assinatura</Text>
            </Pressable>
          )}
        </View>
        {isOnFree && (
          <View style={tabs.planStats}>
            <Text style={tabs.planStatsNumber}>Free</Text>
            <Text style={tabs.planStatsLabel}>PLANO ATUAL</Text>
          </View>
        )}
      </View>

      {/* Upgrade section */}
      {premiumPlan && activePlanId !== premiumPlan.id && (
        <View style={tabs.upgradeSection}>
          <Text style={tabs.upgradeTitle}>Recomendado para você</Text>
          <View style={tabs.premiumCard}>
            <View style={tabs.premiumLeft}>
              <View style={tabs.premiumHeader}>
                <MaterialIcons name="workspace-premium" size={22} color={Colors.primary} />
                <Text style={tabs.premiumName}>{premiumPlan.name}</Text>
              </View>
              <View style={tabs.premiumPrice}>
                <Text style={tabs.premiumAmount}>R$ {premiumPlan.price.toFixed(2)}</Text>
                <Text style={tabs.premiumPeriod}>/{premiumPlan.billing_cycle}</Text>
              </View>
              {premiumPlan.features.length > 0 && (
                <View style={tabs.premiumFeatures}>
                  {premiumPlan.features.map((f, i) => (
                    <PremiumFeature key={i} icon="flash-on" title={f} sub="" />
                  ))}
                </View>
              )}
              <GradientButton
                label="Assinar Agora"
                onPress={() => onSubscribe(premiumPlan.id)}
              />
            </View>
          </View>

          {/* Support bento card */}
          <View style={tabs.supportCard}>
            <View style={tabs.supportIcon}>
              <MaterialIcons name="support-agent" size={24} color={Colors.primary} />
            </View>
            <Text style={tabs.supportTitle}>Suporte Prioritário</Text>
            <Text style={tabs.supportSub}>Atendimento em menos de 5 minutos via chat direto no app.</Text>
          </View>
        </View>
      )}

      {/* Provider teaser */}
      <View style={tabs.providerTeaser}>
        <View style={tabs.providerLeft}>
          <View style={tabs.providerIconWrap}>
            <MaterialIcons name="store" size={22} color={Colors.tertiary} />
          </View>
          <View>
            <Text style={tabs.providerTitle}>Também é um prestador?</Text>
            <Text style={tabs.providerSub}>Confira os planos Elite Pro para o seu negócio.</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function WorkerTab({ freePlan, premiumPlan, subscription, activePlanId, onSubscribe }: TabProps) {
  const COMPARE_ROWS = [
    { benefit: 'Taxa de Intermediação', basic: '20%', elite: '12%' },
    { benefit: 'Selo de Verificado', basic: '—', elite: '✓' },
    { benefit: 'Dashboard Financeiro', basic: 'Básico', elite: 'Completo + Exportação' },
    { benefit: 'Visibilidade em Buscas', basic: 'Padrão', elite: 'Prioritária' },
  ];

  const isOnFree = !subscription?.is_subscribed;
  const activeName = subscription?.is_subscribed ? subscription.plan_name : (freePlan?.name ?? 'Básico');
  const activeCost = subscription?.is_subscribed
    ? `R$ ${subscription.plan_price.toFixed(2)}/mês`
    : 'Grátis';
  const activeFeatures = subscription?.is_subscribed
    ? subscription.features
    : (freePlan?.features ?? ['Visibilidade padrão', 'Taxa de serviço 20%']);

  return (
    <View style={tabs.wrap}>
      {/* Current plan */}
      <View style={tabs.workerCurrentCard}>
        <Text style={tabs.workerCurrentMeta}>SEU PLANO ATUAL</Text>
        <Text style={tabs.workerCurrentTitle}>{activeName}</Text>
        <View style={tabs.workerCurrentFeatures}>
          {activeFeatures.map((f, i) => (
            <WorkerFeature key={i} icon="check-circle" label={f} />
          ))}
        </View>
        <View style={tabs.workerCurrentCost}>
          <Text style={tabs.workerCostLabel}>Custo Mensal</Text>
          <Text style={tabs.workerCostValue}>{activeCost}</Text>
        </View>
      </View>

      {/* Featured plan */}
      {premiumPlan && activePlanId !== premiumPlan.id && (
        <View style={tabs.eliteCard}>
          <LinearGradient colors={GradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={tabs.eliteBadge}>
            <Text style={tabs.eliteBadgeText}>RECOMENDADO</Text>
          </LinearGradient>

          <View style={tabs.eliteHeader}>
            <Text style={tabs.eliteTitle}>{premiumPlan.name}</Text>
            <MaterialIcons name="verified" size={28} color={Colors.primary} />
          </View>
          <Text style={tabs.eliteSub}>O plano definitivo para profissionais que buscam escala e autoridade no mercado.</Text>

          {premiumPlan.features.length > 0 && (
            <View style={tabs.eliteFeatures}>
              {premiumPlan.features.map((f, i) => (
                <EliteFeature key={i} icon="verified-user" label={f} />
              ))}
            </View>
          )}

          <View style={tabs.elitePrice}>
            <Text style={tabs.elitePriceLabel}>INVESTIMENTO</Text>
            <View style={tabs.elitePriceRow}>
              <Text style={tabs.eliteCurrency}>R$</Text>
              <Text style={tabs.eliteAmount}>{premiumPlan.price.toFixed(2).replace('.', ',')}</Text>
            </View>
            <Text style={tabs.elitePeriod}>por {premiumPlan.billing_cycle}</Text>
          </View>

          <GradientButton
            label="Assinar Agora"
            onPress={() => onSubscribe(premiumPlan.id)}
          />
        </View>
      )}

      {/* Comparison table */}
      <View style={tabs.compareSection}>
        <Text style={tabs.compareTitle}>Tabela Comparativa</Text>
        <View style={tabs.compareCard}>
          <View style={tabs.compareHeader}>
            <Text style={[tabs.compareColHead, { flex: 2 }]}>BENEFÍCIO</Text>
            <Text style={tabs.compareColHead}>BÁSICO</Text>
            <Text style={[tabs.compareColHead, { color: Colors.primary }]}>ELITE PRO</Text>
          </View>
          {COMPARE_ROWS.map((row, idx) => (
            <View key={row.benefit} style={[tabs.compareRow, idx < COMPARE_ROWS.length - 1 && tabs.compareRowBorder]}>
              <Text style={[tabs.compareCell, { flex: 2 }]}>{row.benefit}</Text>
              <Text style={tabs.compareCell}>{row.basic}</Text>
              <Text style={[tabs.compareCell, { color: Colors.primary, fontFamily: FontFamily.bodySemiBold }]}>{row.elite}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function PlanFeature({ label }: { label: string }) {
  return (
    <View style={feat.row}>
      <MaterialIcons name="check-circle" size={18} color={Colors.primary} />
      <Text style={feat.label}>{label}</Text>
    </View>
  );
}
const feat = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { fontFamily: FontFamily.bodyRegular, fontSize: 13, color: Colors.onSurface },
});

function PremiumFeature({ icon, title, sub }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; sub: string }) {
  return (
    <View style={pf.row}>
      <MaterialIcons name={icon} size={20} color={Colors.primary} />
      <View>
        <Text style={pf.title}>{title}</Text>
        {!!sub && <Text style={pf.sub}>{sub}</Text>}
      </View>
    </View>
  );
}
const pf = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  title: { fontFamily: FontFamily.bodySemiBold, fontSize: 13, color: Colors.onSurface },
  sub: { fontFamily: FontFamily.bodyRegular, fontSize: 12, color: Colors.onSurfaceVariant },
});

function WorkerFeature({ icon, label }: { icon: keyof typeof MaterialIcons.glyphMap; label: string }) {
  return (
    <View style={wf.row}>
      <MaterialIcons name={icon} size={20} color={Colors.primary} />
      <Text style={wf.label}>{label}</Text>
    </View>
  );
}
const wf = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  label: { fontFamily: FontFamily.bodyRegular, fontSize: 13, color: Colors.onSurfaceVariant },
});

function EliteFeature({ icon, label }: { icon: keyof typeof MaterialIcons.glyphMap; label: string }) {
  return (
    <View style={ef.row}>
      <View style={ef.iconWrap}>
        <MaterialIcons name={icon} size={18} color={Colors.primary} />
      </View>
      <Text style={ef.label}>{label}</Text>
    </View>
  );
}
const ef = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1, fontFamily: FontFamily.bodyMedium, fontSize: 13, color: Colors.onSurface },
});

const tabs = StyleSheet.create({
  wrap: { gap: Spacing.xxl },

  // Client tab
  planCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    gap: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
    overflow: 'hidden',
  },
  planCardContent: { gap: Spacing.base },
  planBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
  },
  planBadgeText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 9,
    color: Colors.primary,
    letterSpacing: 1.5,
  },
  planTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 32,
    color: Colors.onSurface,
    letterSpacing: -1,
  },
  planSub: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  planFeatures: { gap: Spacing.sm },
  manageBtn: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.secondaryContainer,
    borderRadius: Radius.sm,
    marginTop: Spacing.sm,
  },
  manageBtnLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: Colors.onSecondaryContainer,
  },
  planStats: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    gap: Spacing.xs,
  },
  planStatsNumber: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 36,
    color: Colors.onPrimary,
    letterSpacing: -1,
  },
  planStatsLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 9,
    color: Colors.onPrimary + 'B3',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  upgradeSection: { gap: Spacing.base },
  upgradeTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 22,
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  premiumCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.primary + '1A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 1,
  },
  premiumLeft: { gap: Spacing.xl },
  premiumHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  premiumName: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  premiumPrice: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  premiumAmount: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 34,
    color: Colors.onSurface,
    letterSpacing: -1,
  },
  premiumPeriod: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  premiumFeatures: { gap: Spacing.base },
  supportCard: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  supportTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  supportSub: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },
  providerTeaser: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '1A',
  },
  providerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  providerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  providerSub: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },

  // Worker tab
  workerCurrentCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    gap: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  workerCurrentMeta: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    letterSpacing: 2,
  },
  workerCurrentTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 28,
    color: Colors.onSurface,
    letterSpacing: -0.8,
  },
  workerCurrentFeatures: { gap: Spacing.md },
  workerCurrentCost: {
    marginTop: Spacing.md,
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
    gap: 2,
  },
  workerCostLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.onSurface,
  },
  workerCostValue: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 22,
    color: Colors.primary,
  },
  eliteCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    gap: Spacing.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 32,
    elevation: 4,
  },
  eliteBadge: {
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  eliteBadgeText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 9,
    color: Colors.onPrimary,
    letterSpacing: 2,
  },
  eliteHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  eliteTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 32,
    color: Colors.onSurface,
    letterSpacing: -1,
  },
  eliteSub: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },
  eliteFeatures: { gap: Spacing.base },
  elitePrice: { gap: 2 },
  elitePriceLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    letterSpacing: 2,
  },
  elitePriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  eliteCurrency: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 22,
    color: Colors.onSurface,
  },
  eliteAmount: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 48,
    color: Colors.onSurface,
    letterSpacing: -2,
  },
  elitePeriod: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },

  compareSection: { gap: Spacing.base },
  compareTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 22,
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  compareCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  compareHeader: {
    flexDirection: 'row',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  compareColHead: {
    flex: 1,
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  compareRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
  },
  compareRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  compareCell: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.onSurface,
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.xxl,
  },
  segTrack: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radius.full,
    padding: 4,
  },
  segItem: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  segItemActive: {
    backgroundColor: Colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  segLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  segLabelActive: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.primary,
  },
});

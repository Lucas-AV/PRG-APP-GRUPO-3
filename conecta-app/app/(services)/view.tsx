import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, GradientColors, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { servicesApi, Service, metricsApi, ServiceMetrics, reviewsApi, ServiceReview } from '@/services/api';

type Metric = {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
};

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const DAY_FULL = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof MaterialIcons>['name']> = {
  elétrica: 'electrical-services',
  elétrico: 'electrical-services',
  hidráulica: 'plumbing',
  hidráulico: 'plumbing',
  limpeza: 'cleaning-services',
  pintura: 'format-paint',
  jardinagem: 'grass',
  tecnologia: 'computer',
  reformas: 'build',
  manutenção: 'build',
};

function getCategoryIcon(category?: string | null): React.ComponentProps<typeof MaterialIcons>['name'] {
  if (!category) return 'miscellaneous-services';
  const lower = category.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return 'miscellaneous-services';
}

function formatPrice(price?: number | null): string {
  if (price == null) return '—';
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

function StarRow({ count }: { count: number }) {
  return (
    <View style={styles.starRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <MaterialIcons
          key={i}
          name="star"
          size={14}
          color={i < count ? '#F59E0B' : Colors.border}
        />
      ))}
    </View>
  );
}

export default function ViewServiceScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [service, setService] = useState<Service | null>(null);
  const [loadingService, setLoadingService] = useState(true);
  const [apiMetrics, setApiMetrics] = useState<ServiceMetrics | null>(null);
  const [apiReviews, setApiReviews] = useState<ServiceReview[] | null>(null);

  // All hooks before any conditional return
  useEffect(() => {
    if (!id || !token) return;
    servicesApi.get(Number(id), token)
      .then(setService)
      .catch(() => {})
      .finally(() => setLoadingService(false));
  }, [id, token]);

  useEffect(() => {
    if (!id || !token) return;
    const serviceId = parseInt(id, 10);
    if (isNaN(serviceId)) return;
    reviewsApi.list(serviceId, token).then(setApiReviews).catch(() => {});
  }, [id, token]);

  useEffect(() => {
    if (!id || !token) return;
    const serviceId = parseInt(id, 10);
    if (isNaN(serviceId)) return;
    metricsApi.get(serviceId, token).then(setApiMetrics).catch(() => {});
  }, [id, token]);

  if (loadingService) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.ink} />
          </Pressable>
          <Text style={styles.headerBrand}>Conecta</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorState}>
          <MaterialIcons name="error-outline" size={48} color={Colors.border} />
          <Text style={styles.errorText}>Serviço não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const serviceIcon = getCategoryIcon(service.category);
  const isActive = service.status === 'ativo';
  const weeklyData = apiMetrics?.weekly_data ?? [0, 0, 0, 0, 0, 0, 0];
  const maxBar = 120;
  const peakIdx = weeklyData.indexOf(Math.max(...weeklyData));
  const hasWeeklyData = weeklyData.some(v => v > 0);

  const computedMetrics: Metric[] = apiMetrics
    ? [
        { icon: 'trending-up', label: 'Faturamento', value: `R$ ${apiMetrics.total_revenue.toLocaleString('pt-BR')}`, badge: 'Total', badgeColor: '#065F46', badgeBg: '#D1FAE5' },
        { icon: 'event-available', label: 'Agendamentos', value: String(apiMetrics.total_bookings), badge: 'Total', badgeColor: Colors.inkMuted, badgeBg: Colors.card },
        { icon: 'star', label: 'Nota Média', value: apiMetrics.avg_rating.toFixed(1), badge: '★ Top', badgeColor: Colors.primary, badgeBg: Colors.brand + '15' },
        { icon: 'schedule', label: 'Resp. Média', value: '—', badge: 'Rápido', badgeColor: Colors.primary, badgeBg: Colors.brand + '15' },
      ]
    : [];

  const displayedReviews = apiReviews?.map(r => ({
    name: r.reviewer_name,
    date: new Date(r.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
    rating: r.rating,
    text: r.comment ?? '',
  })) ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.ink} />
        </Pressable>
        <Text style={styles.headerBrand}>Conecta</Text>
        <Pressable style={styles.headerIconBtn}>
          <MaterialIcons name="notifications" size={24} color={Colors.inkMuted} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero banner */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDim]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          {!!service.category && (
            <View style={styles.heroCategoryBadge}>
              <Text style={styles.heroCategoryText}>{service.category}</Text>
            </View>
          )}
          <MaterialIcons name={serviceIcon} size={64} color="rgba(255,255,255,0.25)" />
        </LinearGradient>

        {/* Hero info */}
        <View style={styles.heroInfo}>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>{service.name}</Text>
            {!!service.description && (
              <Text style={styles.heroDesc} numberOfLines={2}>{service.description}</Text>
            )}
          </View>
          <Pressable
            style={styles.editHeroBtn}
            onPress={() => router.push({ pathname: '/(services)/edit', params: { id } })}
          >
            <LinearGradient colors={GradientColors} style={styles.editHeroBtnGradient}>
              <MaterialIcons name="edit" size={16} color={Colors.onPrimary} />
              <Text style={styles.editHeroBtnText}>Editar</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Quick info card */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.cardSectionTitle}>Status do Serviço</Text>
            <View style={styles.statusToggleRow}>
              <Switch
                value={isActive}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor="#ffffff"
              />
              <Text style={[styles.statusLabel, { color: isActive ? Colors.primary : Colors.inkMuted }]}>
                {isActive ? 'Ativo' : 'Inativo'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRows}>
            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <MaterialIcons name="payments" size={20} color={Colors.primary} />
                <Text style={styles.infoRowLabel}>Preço base</Text>
              </View>
              <Text style={styles.infoRowValue}>{formatPrice(service.price)}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <MaterialIcons name="schedule" size={20} color={Colors.primary} />
                <Text style={styles.infoRowLabel}>Duração</Text>
              </View>
              <Text style={styles.infoRowValue}>{service.duration ?? '—'}</Text>
            </View>
          </View>
        </View>

        {/* Metrics grid */}
        {computedMetrics.length > 0 && (
          <View style={styles.metricsGrid}>
            {computedMetrics.map((m, i) => (
              <View key={i} style={styles.metricCard}>
                <View style={styles.metricCardTop}>
                  <View style={styles.metricIconBox}>
                    <MaterialIcons name={m.icon} size={20} color={Colors.primary} />
                  </View>
                  <View style={[styles.metricBadge, { backgroundColor: m.badgeBg }]}>
                    <Text style={[styles.metricBadgeText, { color: m.badgeColor }]}>{m.badge}</Text>
                  </View>
                </View>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <Text style={styles.metricValue}>{m.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Avaliações Recentes</Text>
            {displayedReviews.length > 0 && (
              <Pressable>
                <Text style={styles.sectionLink}>Ver todas</Text>
              </Pressable>
            )}
          </View>

          {displayedReviews.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialIcons name="star-border" size={32} color={Colors.border} />
              <Text style={styles.emptyText}>Nenhuma avaliação ainda.</Text>
            </View>
          ) : (
            displayedReviews.map((review, i) => (
              <View key={i} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAuthorRow}>
                    <View style={styles.reviewAvatar}>
                      <MaterialIcons name="person" size={20} color={Colors.inkMuted} />
                    </View>
                    <View>
                      <Text style={styles.reviewName}>{review.name}</Text>
                      <Text style={styles.reviewDate}>{review.date}</Text>
                    </View>
                  </View>
                  <StarRow count={review.rating} />
                </View>
                <Text style={styles.reviewText}>"{review.text}"</Text>
              </View>
            ))
          )}
        </View>

        {/* Weekly activity chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividade Semanal</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {weeklyData.map((pct, i) => (
                <View key={i} style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (pct / 100) * maxBar,
                        backgroundColor: i === peakIdx && hasWeeklyData ? Colors.primary : Colors.border,
                      },
                    ]}
                  />
                </View>
              ))}
            </View>
            <View style={styles.chartLabels}>
              {DAYS.map((d) => (
                <Text key={d} style={styles.chartLabel}>{d}</Text>
              ))}
            </View>
            {hasWeeklyData && (
              <View style={styles.chartFooter}>
                <Text style={styles.chartFooterLabel}>Dia mais ativo</Text>
                <Text style={styles.chartFooterValue}>{DAY_FULL[peakIdx]}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.base,
    backgroundColor: Colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBrand: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 20,
    letterSpacing: -0.6,
    color: Colors.primary,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  errorText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.inkMuted,
  },

  scroll: { flex: 1 },
  scrollContent: {
    gap: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
  },

  // Hero
  heroBanner: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroCategoryBadge: {
    position: 'absolute',
    top: Spacing.base,
    left: Spacing.base,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  heroCategoryText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroInfo: {
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.base,
    marginTop: -Spacing.sm,
  },
  heroTextWrap: { flex: 1, gap: Spacing.xs },
  heroTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 26,
    letterSpacing: -0.8,
    color: Colors.ink,
    lineHeight: 32,
  },
  heroDesc: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.inkMuted,
    lineHeight: 19,
  },
  editHeroBtn: {
    borderRadius: Radius.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    flexShrink: 0,
  },
  editHeroBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  editHeroBtnText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: Colors.onPrimary,
  },

  // Card
  card: {
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    gap: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  cardSectionTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 16,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
  },
  infoRows: { gap: Spacing.sm },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoRowLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.ink,
  },
  infoRowValue: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.ink,
  },

  // Metrics
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.base,
    paddingHorizontal: Spacing.xl,
  },
  metricCard: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  metricCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.brand + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  metricBadgeText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  metricLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 10,
    color: Colors.inkMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 22,
    letterSpacing: -0.6,
    color: Colors.ink,
  },

  // Section
  section: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 20,
    letterSpacing: -0.5,
    color: Colors.ink,
  },
  sectionLink: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: Colors.primary,
  },

  // Empty state
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xxxl,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
  },
  emptyText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.inkMuted,
  },

  // Review card
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    gap: Spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  reviewAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewName: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.ink,
  },
  reviewDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  reviewText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.inkMuted,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },

  // Chart
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    gap: Spacing.base,
  },
  chartBars: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.headlineBold,
    fontSize: 9,
    color: Colors.inkMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  chartFooterLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  chartFooterValue: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: Colors.primary,
  },
});

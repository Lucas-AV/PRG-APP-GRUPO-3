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
import { servicesApi, Service } from '@/services/api';

type Metric = { icon: React.ComponentProps<typeof MaterialIcons>['name']; label: string; value: string; badge: string; badgeColor: string; badgeBg: string };
type Review = { name: string; date: string; rating: number; text: string };
type ServiceData = {
  title: string;
  category: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  price: string;
  duration: string;
  isActive: boolean;
  description: string;
  visibility: number;
  metrics: Metric[];
  weeklyData: number[];
  reviews: Review[];
};

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const DAY_FULL = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

const MOCK: Record<string, ServiceData> = {
  '1': {
    title: 'Instalação de Tomadas',
    category: 'Reformas e Manutenção',
    icon: 'electrical-services',
    price: 'R$ 80,00',
    duration: '2h',
    isActive: true,
    description:
      'Instalação profissional de tomadas e interruptores residenciais e comerciais. Inclui material básico, mão de obra e teste de funcionamento.',
    visibility: 85,
    metrics: [
      { icon: 'trending-up', label: 'Faturamento', value: 'R$ 11.200', badge: '+12,5%', badgeColor: '#065F46', badgeBg: '#D1FAE5' },
      { icon: 'event-available', label: 'Agendamentos', value: '124', badge: 'Total', badgeColor: Colors.onSurfaceVariant, badgeBg: Colors.surfaceContainerLow },
      { icon: 'star', label: 'Nota Média', value: '4.9', badge: '★ Top', badgeColor: Colors.primary, badgeBg: Colors.primaryContainer },
      { icon: 'schedule', label: 'Resp. Média', value: '1h 30m', badge: 'Rápido', badgeColor: Colors.primary, badgeBg: Colors.primaryContainer },
    ],
    weeklyData: [40, 60, 85, 50, 70, 30, 45],
    reviews: [
      { name: 'Carlos Mendes', date: '14 de Mar, 2024', rating: 5, text: 'Serviço impecável. Tomadas instaladas com precisão, sem sujeira e dentro do prazo combinado. Super recomendo!' },
      { name: 'Ana Lima', date: '10 de Mar, 2024', rating: 5, text: 'Profissional pontual e educado. Resolveu o problema rapidinho e ainda fez uma conferência geral da instalação.' },
    ],
  },
  '2': {
    title: 'Manutenção de AC',
    category: 'Reformas e Manutenção',
    icon: 'ac-unit',
    price: 'R$ 150,00',
    duration: '3h',
    isActive: true,
    description:
      'Limpeza completa e manutenção preventiva de ar-condicionado. Inclui higienização dos filtros, verificação do gás e teste de operação.',
    visibility: 72,
    metrics: [
      { icon: 'trending-up', label: 'Faturamento', value: 'R$ 8.600', badge: '+8,2%', badgeColor: '#065F46', badgeBg: '#D1FAE5' },
      { icon: 'event-available', label: 'Agendamentos', value: '86', badge: 'Total', badgeColor: Colors.onSurfaceVariant, badgeBg: Colors.surfaceContainerLow },
      { icon: 'star', label: 'Nota Média', value: '4.7', badge: '★ Top', badgeColor: Colors.primary, badgeBg: Colors.primaryContainer },
      { icon: 'schedule', label: 'Resp. Média', value: '2h 15m', badge: 'Rápido', badgeColor: Colors.primary, badgeBg: Colors.primaryContainer },
    ],
    weeklyData: [30, 45, 60, 80, 55, 40, 20],
    reviews: [
      { name: 'Roberto Silva', date: '05 de Mar, 2024', rating: 5, text: 'Excelente trabalho! O ar-condicionado estava horrível e após a limpeza ficou novo. Muito profissional.' },
      { name: 'Juliana Costa', date: '28 de Fev, 2024', rating: 4, text: 'Bom serviço, atendeu no prazo e fez um bom trabalho. Recomendo.' },
    ],
  },
};

function StarRow({ count }: { count: number }) {
  return (
    <View style={styles.starRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <MaterialIcons
          key={i}
          name="star"
          size={14}
          color={i < count ? '#F59E0B' : Colors.outlineVariant}
        />
      ))}
    </View>
  );
}

export default function ViewServiceScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loadingService, setLoadingService] = useState(true);

  useEffect(() => {
    if (!id || !token) return;
    servicesApi.get(Number(id), token)
      .then(setService)
      .catch(() => {})
      .finally(() => setLoadingService(false));
  }, [id, token]);

  const fallback = MOCK[id ?? '1'] ?? MOCK['1'];
  const data = {
    ...fallback,
    title: service?.name ?? fallback.title,
    category: service?.category ?? fallback.category,
    price: service?.price != null
      ? `R$ ${service.price.toFixed(2).replace('.', ',')}`
      : fallback.price,
    duration: service?.duration ?? fallback.duration,
    isActive: service ? service.status === 'ativo' : fallback.isActive,
    description: service?.description ?? fallback.description,
  };

  if (loadingService) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
      </SafeAreaView>
    );
  }

  const maxBar = 120;
  const peakIdx = data.weeklyData.indexOf(Math.max(...data.weeklyData));

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
        <Text style={styles.headerBrand}>SevGen</Text>
        <Pressable style={styles.headerIconBtn}>
          <MaterialIcons name="notifications" size={24} color={Colors.onSurfaceVariant} />
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
          <View style={styles.heroCategoryBadge}>
            <Text style={styles.heroCategoryText}>{data.category}</Text>
          </View>
          <MaterialIcons name={data.icon} size={64} color="rgba(255,255,255,0.25)" />
        </LinearGradient>

        {/* Hero info */}
        <View style={styles.heroInfo}>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>{data.title}</Text>
            <Text style={styles.heroDesc} numberOfLines={2}>{data.description}</Text>
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
                value={data.isActive}
                trackColor={{ false: Colors.outlineVariant, true: Colors.primary }}
                thumbColor={Colors.surfaceContainerLowest}
              />
              <Text style={[styles.statusLabel, { color: data.isActive ? Colors.primary : Colors.outline }]}>
                {data.isActive ? 'Ativo' : 'Inativo'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRows}>
            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <MaterialIcons name="payments" size={20} color={Colors.primary} />
                <Text style={styles.infoRowLabel}>Preço base</Text>
              </View>
              <Text style={styles.infoRowValue}>{data.price}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <MaterialIcons name="schedule" size={20} color={Colors.primary} />
                <Text style={styles.infoRowLabel}>Duração</Text>
              </View>
              <Text style={styles.infoRowValue}>{data.duration}</Text>
            </View>
          </View>

          {/* Visibility score */}
          <View style={styles.visibilityCard}>
            <Text style={styles.visibilityTitle}>Pontuação de Visibilidade</Text>
            <Text style={styles.visibilitySubtitle}>
              Seu serviço aparece em {data.visibility}% das buscas relevantes esta semana.
            </Text>
            <View style={styles.visibilityTrack}>
              <View style={[styles.visibilityFill, { width: `${data.visibility}%` }]} />
            </View>
          </View>
        </View>

        {/* Metrics grid */}
        <View style={styles.metricsGrid}>
          {data.metrics.map((m, i) => (
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

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Avaliações Recentes</Text>
            <Pressable>
              <Text style={styles.sectionLink}>Ver todas</Text>
            </Pressable>
          </View>

          {data.reviews.map((review, i) => (
            <View key={i} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAuthorRow}>
                  <View style={styles.reviewAvatar}>
                    <MaterialIcons name="person" size={20} color={Colors.onSurfaceVariant} />
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
          ))}
        </View>

        {/* Weekly activity chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividade Semanal</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {data.weeklyData.map((pct, i) => (
                <View key={i} style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (pct / 100) * maxBar,
                        backgroundColor: i === peakIdx ? Colors.primary : Colors.surfaceContainerHighest,
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
            <View style={styles.chartFooter}>
              <Text style={styles.chartFooterLabel}>Dia mais ativo</Text>
              <Text style={styles.chartFooterValue}>{DAY_FULL[peakIdx]}</Text>
            </View>
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
    backgroundColor: Colors.surfaceContainerLowest,
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
    color: Colors.onSurface,
    lineHeight: 32,
  },
  heroDesc: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
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
    backgroundColor: Colors.surfaceContainerLowest,
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
    color: Colors.onSurface,
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
    backgroundColor: Colors.surfaceContainerLow,
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
    color: Colors.onSurface,
  },
  infoRowValue: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.onSurface,
  },

  visibilityCard: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.md,
    padding: Spacing.xxl,
    gap: Spacing.sm,
  },
  visibilityTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.onPrimaryContainer,
  },
  visibilitySubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onPrimaryContainer,
    opacity: 0.75,
    lineHeight: 18,
  },
  visibilityTrack: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  visibilityFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
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
    backgroundColor: Colors.surfaceContainerLowest,
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
    backgroundColor: Colors.primaryContainer,
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
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 22,
    letterSpacing: -0.6,
    color: Colors.onSurface,
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
    color: Colors.onSurface,
  },
  sectionLink: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: Colors.primary,
  },

  // Review card
  reviewCard: {
    backgroundColor: Colors.surfaceContainerLowest,
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
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewName: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  reviewDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  reviewText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },

  // Chart
  chartCard: {
    backgroundColor: Colors.surfaceContainerLowest,
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
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHighest,
  },
  chartFooterLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  chartFooterValue: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: Colors.primary,
  },
});

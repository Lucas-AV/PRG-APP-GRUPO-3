import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, Spacing, Radius, GradientColors } from '@/constants/theme';
import { CATEGORIES } from '@/constants/categories';
import { publicServicesApi, PublicService, providerApi, ProviderReviews } from '@/services/api';

// ── Types & constants ─────────────────────────────────────────────────────────

type Tab = 'servicos' | 'sobre' | 'avaliacoes';

const TABS: { key: Tab; label: string }[] = [
  { key: 'servicos', label: 'Serviços e Preços' },
  { key: 'sobre', label: 'Sobre' },
  { key: 'avaliacoes', label: 'Avaliações' },
];

const STATS = [
  { icon: 'history-edu' as const,  labelKey: 'EXPERIÊNCIA',  value: '12 Anos'       },
  { icon: 'task-alt'    as const,  labelKey: 'CONCLUÍDOS',   value: '850+ Projetos' },
  { icon: 'bolt'        as const,  labelKey: 'RESPOSTA',     value: '< 15 Min'      },
];

const MOCK_BIO =
  'Profissional experiente com mais de 12 anos de atuação no mercado. ' +
  'Comprometido com qualidade, pontualidade e satisfação total do cliente. ' +
  'Atende residências, estabelecimentos comerciais e projetos industriais de pequeno porte.';

const MOCK_SPECIALTIES = [
  { icon: 'bolt'        as const, label: 'Instalações Elétricas'  },
  { icon: 'settings'    as const, label: 'Manutenção Preventiva'  },
  { icon: 'home'        as const, label: 'Reformas Residenciais'  },
  { icon: 'engineering' as const, label: 'Projetos Técnicos'      },
];

const MOCK_CERTS = [
  { title: 'NR-10',           subtitle: 'Segurança em Instalações Elétricas' },
  { title: 'CREA Registrado', subtitle: 'Conselho Regional de Engenharia'    },
  { title: 'ISO 9001',        subtitle: 'Gestão da Qualidade'                },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

function formatPrice(s: PublicService) {
  if (!s.price) return 'Sob consulta';
  return `${s.price_type === 'a_partir_de' ? 'A partir de ' : ''}R$ ${s.price.toFixed(2).replace('.', ',')}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProviderProfileScreen() {
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const providerId = Number(id);
  const providerName = name ?? 'Prestador';

  const [activeTab, setActiveTab]     = useState<Tab>('servicos');
  const [services, setServices]       = useState<PublicService[]>([]);
  const [reviewData, setReviewData]   = useState<ProviderReviews | null>(null);
  const [loadingServices, setLS]      = useState(true);
  const [loadingReviews, setLR]       = useState(false);
  const [reviewsLoaded, setRLoaded]   = useState(false);

  useEffect(() => {
    if (!providerId) return;
    publicServicesApi
      .list({ provider_id: providerId })
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLS(false));
  }, [providerId]);

  const loadReviews = useCallback(() => {
    if (reviewsLoaded || !providerId) return;
    setLR(true);
    providerApi
      .reviews(providerId)
      .then(d => { setReviewData(d); setRLoaded(true); })
      .catch(() => setRLoaded(true))
      .finally(() => setLR(false));
  }, [providerId, reviewsLoaded]);

  const handleTabPress = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'avaliacoes') loadReviews();
  };

  // derive specialty label from first loaded service
  const specialty = services.length > 0
    ? (CATEGORIES.find(c => c.key === services[0].category)?.label ?? services[0].category)
    : null;

  const avgRating = reviewData?.avg_rating ?? null;
  const reviewCount = reviewData?.total_count ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── TopAppBar ─────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </Pressable>
          <Text style={styles.topBarTitle}>Perfil do Profissional</Text>
        </View>
        <Pressable style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}>
          <MaterialIcons name="share" size={22} color={Colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* ── Hero Section ──────────────────────────────────────────────── */}
        <View style={styles.hero}>
          {/* Square avatar with gradient */}
          <View style={styles.avatarWrap}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarInitials}>{getInitials(providerName)}</Text>
            </LinearGradient>
          </View>

          {/* Info block */}
          <View style={styles.heroInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.heroName} numberOfLines={2}>{providerName}</Text>
              <MaterialIcons name="verified" size={20} color={Colors.primary} />
            </View>

            {specialty && (
              <Text style={styles.heroSpecialty} numberOfLines={1}>
                {specialty}
              </Text>
            )}

            {/* Stars + rating */}
            <View style={styles.ratingRow}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(i => (
                  <MaterialIcons
                    key={i}
                    name="star"
                    size={16}
                    color={avgRating !== null && i <= Math.round(avgRating) ? '#f59e0b' : Colors.outlineVariant}
                  />
                ))}
              </View>
              {avgRating !== null && (
                <>
                  <Text style={styles.ratingNum}>{avgRating.toFixed(1)}</Text>
                  {reviewCount > 0 && (
                    <Text style={styles.ratingCount}>({reviewCount} avaliações)</Text>
                  )}
                </>
              )}
            </View>
          </View>
        </View>

        {/* ── Stats Chips Row ───────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          {STATS.map(stat => (
            <View key={stat.labelKey} style={styles.statChip}>
              <MaterialIcons name={stat.icon} size={22} color={Colors.primary} />
              <View style={styles.statText}>
                <Text style={styles.statLabel}>{stat.labelKey}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* ── Tabs (Segmented Control) ──────────────────────────────────── */}
        <View style={styles.segmented}>
          {TABS.map(tab => (
            <Pressable
              key={tab.key}
              style={[styles.segment, activeTab === tab.key && styles.segmentActive]}
              onPress={() => handleTabPress(tab.key)}
            >
              <Text style={[styles.segmentLabel, activeTab === tab.key && styles.segmentLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Tab: Serviços e Preços ────────────────────────────────────── */}
        {activeTab === 'servicos' && (
          <View style={styles.tabContent}>
            {loadingServices ? (
              <ActivityIndicator color={Colors.primary} style={styles.loader} />
            ) : services.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum serviço cadastrado.</Text>
            ) : (
              services.map(service => (
                <Pressable
                  key={service.id}
                  style={({ pressed }) => [styles.serviceCard, pressed && { opacity: 0.9 }]}
                  onPress={() =>
                    router.push({
                      pathname: '/(client)/service-detail' as any,
                      params: { id: String(service.id) },
                    })
                  }
                >
                  <View style={styles.serviceBody}>
                    <View style={styles.serviceTopRow}>
                      <Text style={styles.serviceName} numberOfLines={1}>
                        {service.name}
                      </Text>
                      <Text style={styles.servicePrice}>{formatPrice(service)}</Text>
                    </View>
                    {service.description ? (
                      <Text style={styles.serviceDesc} numberOfLines={2}>
                        {service.description}
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    style={styles.addBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/(client)/service-detail' as any,
                        params: { id: String(service.id) },
                      })
                    }
                    hitSlop={8}
                  >
                    <MaterialIcons name="add" size={22} color={Colors.primary} />
                  </Pressable>
                </Pressable>
              ))
            )}
          </View>
        )}

        {/* ── Tab: Sobre ────────────────────────────────────────────────── */}
        {activeTab === 'sobre' && (
          <View style={styles.tabContent}>
            <Text style={styles.bio}>{MOCK_BIO}</Text>

            <Text style={styles.subheading}>Especialidades</Text>
            <View style={styles.specialtyGrid}>
              {MOCK_SPECIALTIES.map(s => (
                <View key={s.label} style={styles.specialtyChip}>
                  <MaterialIcons name={s.icon} size={15} color={Colors.primary} />
                  <Text style={styles.specialtyLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.subheading}>Certificações</Text>
            {MOCK_CERTS.map(c => (
              <View key={c.title} style={styles.certRow}>
                <MaterialIcons name="verified-user" size={20} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.certTitle}>{c.title}</Text>
                  <Text style={styles.certSub}>{c.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Tab: Avaliações ──────────────────────────────────────────── */}
        {activeTab === 'avaliacoes' && (
          <View style={styles.tabContent}>
            {loadingReviews ? (
              <ActivityIndicator color={Colors.primary} style={styles.loader} />
            ) : !reviewData || reviewData.total_count === 0 ? (
              <Text style={styles.emptyText}>Nenhuma avaliação ainda.</Text>
            ) : (
              <>
                <View style={styles.ratingCard}>
                  <Text style={styles.ratingBigNum}>
                    {reviewData.avg_rating?.toFixed(1)}
                  </Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <MaterialIcons key={i} name="star" size={20} color="#f59e0b" />
                    ))}
                  </View>
                  <Text style={styles.ratingCardCount}>
                    {reviewData.total_count} avaliações
                  </Text>
                </View>

                {reviewData.reviews.slice(0, 5).map(review => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeaderRow}>
                      <Text style={styles.reviewerName}>{review.reviewer_name}</Text>
                      <Text style={styles.reviewDate}>
                        {new Date(review.created_at).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                    <View style={styles.starsRow}>
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <MaterialIcons key={i} name="star" size={13} color="#f59e0b" />
                      ))}
                      {Array.from({ length: 5 - review.rating }).map((_, i) => (
                        <MaterialIcons key={`e${i}`} name="star-border" size={13} color={Colors.outlineVariant} />
                      ))}
                    </View>
                    {review.comment ? (
                      <Text style={styles.reviewComment}>"{review.comment}"</Text>
                    ) : null}
                  </View>
                ))}

                <Pressable
                  style={({ pressed }) => [styles.seeAllBtn, pressed && { opacity: 0.8 }]}
                  onPress={() =>
                    router.push({
                      pathname: '/(client)/provider-reviews' as any,
                      params: { userId: String(providerId), name: providerName },
                    })
                  }
                >
                  <Text style={styles.seeAllLabel}>Ver todas as avaliações</Text>
                  <MaterialIcons name="chevron-right" size={18} color={Colors.primary} />
                </Pressable>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── CTA fixo ─────────────────────────────────────────────────── */}
      <View style={styles.ctaWrap}>
        <Pressable
          style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.9 }]}
          onPress={() =>
            Alert.alert('Em breve', 'A funcionalidade de agendamento estará disponível em breve.')
          }
        >
          <LinearGradient
            colors={GradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaLabel}>Agendar uma Consulta</Text>
            <MaterialIcons name="calendar-month" size={20} color={Colors.onPrimary} />
          </LinearGradient>
        </Pressable>
      </View>

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },

  // TopAppBar
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  topBarTitle: {
    fontFamily: FontFamily.headlineBold, fontSize: 17,
    color: Colors.onSurface, letterSpacing: -0.3,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingBottom: Spacing.xxxl * 3 },

  // Hero
  hero: {
    flexDirection: 'row', gap: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl, paddingBottom: Spacing.xxl,
  },
  avatarWrap: {
    width: 120, height: 120, borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  avatarGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 44, color: 'rgba(255,255,255,0.9)', letterSpacing: -1,
  },
  heroInfo: { flex: 1, gap: Spacing.sm, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs },
  heroName: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 24, color: Colors.onSurface,
    letterSpacing: -0.8, flex: 1,
  },
  heroSpecialty: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14, color: Colors.onSurfaceVariant,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  starsRow: { flexDirection: 'row', gap: 2 },
  ratingNum: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14, color: Colors.onSurface,
  },
  ratingCount: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12, color: Colors.onSurfaceVariant,
  },

  // Stats
  statsRow: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  statChip: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  statText: { gap: 2 },
  statLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 9, color: Colors.onSurfaceVariant,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  statValue: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13, color: Colors.onSurface,
  },

  // Segmented tabs
  segmented: {
    flexDirection: 'row',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radius.full,
    padding: 6,
    gap: 4,
  },
  segment: {
    flex: 1, paddingVertical: 10,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: Colors.surfaceContainerLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  segmentLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12, color: Colors.onSurfaceVariant,
  },
  segmentLabelActive: {
    fontFamily: FontFamily.headlineBold,
    color: Colors.primary,
  },

  // Tab content
  tabContent: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  loader: { marginTop: Spacing.xxxl },
  emptyText: {
    fontFamily: FontFamily.bodyRegular, fontSize: 14,
    color: Colors.onSurfaceVariant, textAlign: 'center',
    marginTop: Spacing.xxxl,
  },

  // Service cards
  serviceCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.base,
    elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4,
  },
  serviceBody: { flex: 1, gap: Spacing.xs },
  serviceTopRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: Spacing.sm,
  },
  serviceName: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 16, color: Colors.onSurface,
    flex: 1, letterSpacing: -0.2,
  },
  servicePrice: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 16, color: Colors.primary,
    flexShrink: 0,
  },
  serviceDesc: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13, color: Colors.onSurfaceVariant,
    lineHeight: 19,
  },
  addBtn: {
    width: 48, height: 48, borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  // Sobre tab
  bio: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14, color: Colors.onSurface, lineHeight: 22,
  },
  subheading: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: 15, color: Colors.onSurface,
    letterSpacing: -0.2, marginTop: Spacing.sm,
  },
  specialtyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  specialtyChip: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
  },
  specialtyLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12, color: Colors.primary,
  },
  certRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md, padding: Spacing.md,
  },
  certTitle: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 13, color: Colors.onSurface,
  },
  certSub: {
    fontFamily: FontFamily.bodyRegular, fontSize: 12, color: Colors.onSurfaceVariant,
  },

  // Reviews tab
  ratingCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xxl,
    alignItems: 'center', gap: Spacing.xs,
  },
  ratingBigNum: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 56, color: Colors.onSurface, letterSpacing: -3,
  },
  ratingCardCount: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13, color: Colors.onSurfaceVariant,
  },
  reviewCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md, padding: Spacing.base, gap: Spacing.xs,
  },
  reviewHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  reviewerName: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 13, color: Colors.onSurface,
  },
  reviewDate: {
    fontFamily: FontFamily.bodyRegular, fontSize: 11, color: Colors.outlineVariant,
  },
  reviewComment: {
    fontFamily: FontFamily.bodyRegular, fontSize: 13,
    color: Colors.onSurfaceVariant, fontStyle: 'italic', lineHeight: 19,
  },
  seeAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.xs, paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceContainerHighest, borderRadius: Radius.md,
  },
  seeAllLabel: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 13, color: Colors.primary,
  },

  // Fixed CTA
  ctaWrap: {
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base,
    backgroundColor: Colors.surface,
  },
  ctaBtn: { borderRadius: Radius.lg, overflow: 'hidden' },
  ctaGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.base + 2,
    borderRadius: Radius.lg,
  },
  ctaLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 16, color: Colors.onPrimary, letterSpacing: -0.2,
  },
});

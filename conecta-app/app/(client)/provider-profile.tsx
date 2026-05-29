import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
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
  { key: 'servicos',   label: 'Serviços e Preços' },
  { key: 'sobre',      label: 'Sobre'             },
  { key: 'avaliacoes', label: 'Avaliações'        },
];

const MOCK_BIO =
  'Com mais de uma década de atuação no setor, dedico minha carreira a entregar soluções ' +
  'seguras e inovadoras para residências e empresas. Meu compromisso vai além da execução ' +
  'técnica: prezo pela transparência e pela segurança em cada etapa do trabalho. ' +
  'Especialista em resolver problemas complexos com agilidade e precisão.';

const SPECIALTIES = [
  { icon: 'home'        as const, label: 'Automação Residencial',               wide: false },
  { icon: 'settings'    as const, label: 'Manutenção Preventiva',               wide: false },
  { icon: 'bolt'        as const, label: 'Projetos Elétricos de Alta Complexidade', wide: true  },
];

const CERTS = [
  {
    icon: 'workspace-premium' as const,
    title: 'NR-10',
    subtitle: 'Segurança em Instalações e Serviços em Eletricidade',
  },
  {
    icon: 'electric-bolt' as const,
    title: 'Especialista em Carregadores EV',
    subtitle: 'Certificação Tesla & Schneider para Home Charging',
  },
];

const PROJECT_GRADIENTS: [string, string][] = [
  ['#1e3a8a', '#3b82f6'],
  ['#065f46', '#10b981'],
  ['#581c87', '#a855f7'],
];
const PROJECT_ICONS: Array<keyof typeof MaterialIcons.glyphMap> = [
  'electrical-services',
  'lightbulb',
  'settings',
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
  const { width } = useWindowDimensions();
  const providerId = Number(id);
  const providerName = name ?? 'Prestador';

  const [activeTab, setActiveTab]   = useState<Tab>('servicos');
  const [services, setServices]     = useState<PublicService[]>([]);
  const [reviewData, setReviewData] = useState<ProviderReviews | null>(null);
  const [loadingServices, setLS]    = useState(true);
  const [loadingReviews, setLR]     = useState(false);
  const [reviewsLoaded, setRLoaded] = useState(false);

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

  const specialty = services.length > 0
    ? (CATEGORIES.find(c => c.key === services[0].category)?.label ?? services[0].category)
    : null;

  const avgRating   = reviewData?.avg_rating ?? null;
  const reviewCount = reviewData?.total_count ?? 0;

  // bento tile widths
  const HPAD    = Spacing.xl * 2;
  const GAP     = Spacing.md;
  const halfCol = (width - HPAD - GAP) / 2;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── TopAppBar ─────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.topBarTitle}>Sobre o Profissional</Text>
        <Pressable style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}>
          <MaterialIcons name="more-vert" size={24} color={Colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* ── Hero — centrado ───────────────────────────────────────────── */}
        <View style={styles.hero}>
          {/* Circular avatar + verified badge */}
          <View style={styles.avatarWrap}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.avatarGradient}>
              <Text style={styles.avatarInitials}>{getInitials(providerName)}</Text>
            </LinearGradient>
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={14} color={Colors.onPrimary} />
            </View>
          </View>

          <Text style={styles.heroName}>{providerName}</Text>
          {specialty && <Text style={styles.heroSpecialty}>{specialty}</Text>}

          {/* Rating pill */}
          {avgRating !== null && (
            <View style={styles.ratingPill}>
              <MaterialIcons name="star" size={14} color="#f59e0b" />
              <Text style={styles.ratingNum}>{avgRating.toFixed(1)}</Text>
              {reviewCount > 0 && (
                <Text style={styles.ratingCount}>({reviewCount} avaliações)</Text>
              )}
            </View>
          )}
        </View>

        {/* ── Tab Navigation ────────────────────────────────────────────── */}
        <View style={styles.tabNav}>
          {TABS.map(tab => (
            <Pressable
              key={tab.key}
              style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
              onPress={() => handleTabPress(tab.key)}
            >
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ══════════════════════════════════════════════════════════════
            Tab: Serviços e Preços
        ══════════════════════════════════════════════════════════════ */}
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
                      <Text style={styles.serviceName} numberOfLines={1}>{service.name}</Text>
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

        {/* ══════════════════════════════════════════════════════════════
            Tab: Sobre
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'sobre' && (
          <View style={styles.tabContent}>

            {/* ── Biografia ─────────────────────────────────────────── */}
            <View style={styles.bioSection}>
              <View style={styles.bioHeader}>
                <Text style={styles.sectionTitle}>Biografia</Text>
                <View style={styles.expBadge}>
                  <Text style={styles.expBadgeText}>12 ANOS EXP.</Text>
                </View>
              </View>
              <Text style={styles.bioText}>{MOCK_BIO}</Text>
            </View>

            {/* ── Especialidades (Bento Grid) ───────────────────────── */}
            <View style={styles.specialtiesSection}>
              <Text style={styles.sectionTitle}>Especialidades</Text>
              <View style={styles.bentoGrid}>
                {SPECIALTIES.map((spec, i) => (
                  <View
                    key={i}
                    style={[
                      styles.bentoCard,
                      spec.wide
                        ? { width: '100%' }
                        : { width: halfCol },
                    ]}
                  >
                    <MaterialIcons name={spec.icon} size={26} color={Colors.primary} />
                    <Text style={styles.bentoLabel}>{spec.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── Certificações ─────────────────────────────────────── */}
            <View style={styles.certsSection}>
              <Text style={styles.sectionTitle}>Certificações</Text>
              <View style={styles.certList}>
                {CERTS.map(cert => (
                  <View key={cert.title} style={styles.certRow}>
                    <View style={styles.certIconBox}>
                      <MaterialIcons name={cert.icon} size={22} color={Colors.onSurfaceVariant} />
                    </View>
                    <View style={styles.certText}>
                      <Text style={styles.certTitle}>{cert.title}</Text>
                      <Text style={styles.certSubtitle}>{cert.subtitle}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* ── Projetos Recentes ─────────────────────────────────── */}
            <View style={styles.projectsSection}>
              <View style={styles.projectsHeader}>
                <Text style={styles.sectionTitle}>Projetos Recentes</Text>
                <Pressable>
                  <Text style={styles.seeAllLink}>Ver todos</Text>
                </Pressable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.projectsScroll}
              >
                {PROJECT_GRADIENTS.map((grad, i) => (
                  <View key={i} style={styles.projectCard}>
                    <LinearGradient colors={grad} style={styles.projectGradient}>
                      <MaterialIcons name={PROJECT_ICONS[i]} size={36} color="rgba(255,255,255,0.85)" />
                    </LinearGradient>
                  </View>
                ))}
              </ScrollView>
            </View>

          </View>
        )}

        {/* ══════════════════════════════════════════════════════════════
            Tab: Avaliações
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'avaliacoes' && (
          <View style={styles.tabContent}>
            {loadingReviews ? (
              <ActivityIndicator color={Colors.primary} style={styles.loader} />
            ) : !reviewData || reviewData.total_count === 0 ? (
              <Text style={styles.emptyText}>Nenhuma avaliação ainda.</Text>
            ) : (
              <>
                <View style={styles.ratingCard}>
                  <Text style={styles.ratingBigNum}>{reviewData.avg_rating?.toFixed(1)}</Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <MaterialIcons key={i} name="star" size={20} color="#f59e0b" />
                    ))}
                  </View>
                  <Text style={styles.ratingCardCount}>{reviewData.total_count} avaliações</Text>
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
                  <Text style={styles.seeAllBtnLabel}>Ver todas as avaliações</Text>
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
          style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.92 }]}
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
          </LinearGradient>
        </Pressable>
      </View>

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },

  // TopAppBar — icon esquerda / título centro / icon direita
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, height: 56,
    backgroundColor: Colors.surface + 'CC',
  },
  topBarTitle: {
    fontFamily: FontFamily.headlineBold, fontSize: 17,
    color: Colors.onSurface, letterSpacing: -0.3,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingBottom: Spacing.xxxl * 3 },

  // Hero — centrado
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xs,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatarGradient: {
    width: 112, height: 112, borderRadius: 56,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: Colors.surfaceContainerLowest,
    // shadow
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 6,
  },
  avatarInitials: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 40, color: 'rgba(255,255,255,0.92)', letterSpacing: -1,
  },
  verifiedBadge: {
    position: 'absolute', bottom: 4, right: 4,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.surfaceContainerLowest,
  },
  heroName: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 28, color: Colors.onSurface, letterSpacing: -1,
    textAlign: 'center',
  },
  heroSpecialty: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 15, color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: Spacing.md, paddingVertical: 5,
    borderRadius: Radius.full, marginTop: 4,
  },
  ratingNum: { fontFamily: FontFamily.headlineBold, fontSize: 13, color: Colors.onSurface },
  ratingCount: { fontFamily: FontFamily.bodyRegular, fontSize: 12, color: Colors.onSurfaceVariant },

  // Tab navigation — rounded-xl (não rounded-full)
  tabNav: {
    flexDirection: 'row',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: 4,
    gap: 2,
  },
  tabItem: {
    flex: 1, paddingVertical: Spacing.md - 2,
    borderRadius: Radius.md, alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: Colors.surfaceContainerLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  tabLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12, color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontFamily: FontFamily.headlineBold,
    color: Colors.primary,
  },

  // Tab content wrapper
  tabContent: { paddingHorizontal: Spacing.xl, gap: Spacing.xxl },
  loader: { marginTop: Spacing.xxxl },
  emptyText: {
    fontFamily: FontFamily.bodyRegular, fontSize: 14,
    color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.xxxl,
  },

  // Serviços tab
  serviceCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg, padding: Spacing.xl,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.base,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
  },
  serviceBody: { flex: 1, gap: Spacing.xs },
  serviceTopRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: Spacing.sm,
  },
  serviceName: {
    fontFamily: FontFamily.headlineBold, fontSize: 16,
    color: Colors.onSurface, flex: 1, letterSpacing: -0.2,
  },
  servicePrice: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 16, color: Colors.primary, flexShrink: 0,
  },
  serviceDesc: {
    fontFamily: FontFamily.bodyRegular, fontSize: 13,
    color: Colors.onSurfaceVariant, lineHeight: 19,
  },
  addBtn: {
    width: 48, height: 48, borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },

  // Sobre tab — Biografia
  bioSection: { gap: Spacing.md },
  bioHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 20, color: Colors.onSurface, letterSpacing: -0.5,
  },
  expBadge: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  expBadgeText: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 10,
    color: Colors.primary, letterSpacing: 1,
  },
  bioText: {
    fontFamily: FontFamily.bodyRegular, fontSize: 16,
    color: Colors.onSurfaceVariant, lineHeight: 26,
  },

  // Sobre tab — Especialidades (Bento)
  specialtiesSection: { gap: Spacing.base },
  bentoGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md,
  },
  bentoCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg, padding: Spacing.xl,
    gap: Spacing.md,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
  },
  bentoLabel: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 13, color: Colors.onSurface,
  },

  // Sobre tab — Certificações
  certsSection: { gap: Spacing.base },
  certList: { gap: Spacing.md },
  certRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.base,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg, padding: Spacing.base,
  },
  certIconBox: {
    width: 48, height: 48, borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  certText: { flex: 1, gap: 2 },
  certTitle: {
    fontFamily: FontFamily.headlineBold, fontSize: 14, color: Colors.onSurface,
  },
  certSubtitle: {
    fontFamily: FontFamily.bodyRegular, fontSize: 12,
    color: Colors.onSurfaceVariant, lineHeight: 17,
  },

  // Sobre tab — Projetos Recentes
  projectsSection: { gap: Spacing.base },
  projectsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  seeAllLink: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13, color: Colors.primary,
  },
  projectsScroll: { gap: Spacing.base, paddingRight: Spacing.xl },
  projectCard: {
    width: 220, height: 140, borderRadius: Radius.lg,
    overflow: 'hidden',
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8,
  },
  projectGradient: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },

  // Avaliações tab
  ratingCard: {
    backgroundColor: Colors.surfaceContainerLow, borderRadius: Radius.lg,
    paddingVertical: Spacing.xxl, alignItems: 'center', gap: Spacing.xs,
  },
  ratingBigNum: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 56, color: Colors.onSurface, letterSpacing: -3,
  },
  starsRow: { flexDirection: 'row', gap: 2 },
  ratingCardCount: {
    fontFamily: FontFamily.bodyRegular, fontSize: 13, color: Colors.onSurfaceVariant,
  },
  reviewCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.md,
    padding: Spacing.base, gap: Spacing.xs,
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
  seeAllBtnLabel: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 13, color: Colors.primary,
  },

  // CTA fixo
  ctaWrap: {
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base,
    backgroundColor: Colors.surface,
  },
  ctaBtn: { borderRadius: Radius.lg, overflow: 'hidden' },
  ctaGradient: {
    height: 56, alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.lg,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 6,
  },
  ctaLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 17, color: Colors.onPrimary, letterSpacing: -0.2,
  },
});

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
import { GradientButton } from '@/components/ui/gradient-button';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { CATEGORIES } from '@/constants/categories';
import { publicServicesApi, PublicService, providerApi, ProviderReviews } from '@/services/api';

type Tab = 'servicos' | 'sobre' | 'avaliacoes';

const TABS: { key: Tab; label: string }[] = [
  { key: 'servicos', label: 'Serviços' },
  { key: 'sobre', label: 'Sobre' },
  { key: 'avaliacoes', label: 'Avaliações' },
];

const STATS = [
  { icon: 'work-history' as const, label: '12 anos exp.' },
  { icon: 'check-circle' as const, label: '850+ serviços' },
  { icon: 'schedule' as const, label: '< 15 min resp.' },
];

const MOCK_BIO =
  'Profissional experiente com mais de 12 anos de atuação no mercado. ' +
  'Comprometido com qualidade, pontualidade e satisfação total do cliente.';

const MOCK_SPECIALTIES = [
  { icon: 'bolt' as const, label: 'Instalações Elétricas' },
  { icon: 'settings' as const, label: 'Manutenção Preventiva' },
  { icon: 'home' as const, label: 'Reformas Residenciais' },
  { icon: 'engineering' as const, label: 'Projetos Técnicos' },
];

const MOCK_CERTS = [
  { title: 'NR-10', subtitle: 'Segurança em Instalações Elétricas' },
  { title: 'CREA Registrado', subtitle: 'Conselho Regional de Engenharia' },
  { title: 'ISO 9001', subtitle: 'Gestão da Qualidade' },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

function formatPrice(service: PublicService): string {
  if (!service.price) return 'Sob consulta';
  const prefix = service.price_type === 'a_partir_de' ? 'A partir de ' : '';
  return `${prefix}R$ ${service.price.toFixed(2).replace('.', ',')}`;
}

export default function ProviderProfileScreen() {
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const providerId = Number(id);
  const providerName = name ?? 'Prestador';

  const [activeTab, setActiveTab] = useState<Tab>('servicos');
  const [services, setServices] = useState<PublicService[]>([]);
  const [reviewData, setReviewData] = useState<ProviderReviews | null>(null);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  useEffect(() => {
    if (!providerId) return;
    publicServicesApi
      .list({ provider_id: providerId })
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));
  }, [providerId]);

  const loadReviews = useCallback(() => {
    if (reviewsLoaded || !providerId) return;
    setLoadingReviews(true);
    providerApi
      .reviews(providerId)
      .then(data => {
        setReviewData(data);
        setReviewsLoaded(true);
      })
      .catch(() => setReviewsLoaded(true))
      .finally(() => setLoadingReviews(false));
  }, [providerId, reviewsLoaded]);

  const handleTabPress = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'avaliacoes') loadReviews();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title={providerName} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(providerName)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.providerName} numberOfLines={1}>{providerName}</Text>
              <MaterialIcons name="verified" size={18} color={Colors.primary} />
            </View>
            <View style={styles.ratingRow}>
              <MaterialIcons name="star" size={14} color="#fbbf24" />
              <Text style={styles.ratingText}>
                {reviewData?.avg_rating != null ? reviewData.avg_rating.toFixed(1) : '--'}
              </Text>
              {reviewData && reviewData.total_count > 0 ? (
                <Text style={styles.reviewCount}>({reviewData.total_count} avaliações)</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Stats chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          {STATS.map(stat => (
            <View key={stat.label} style={styles.statChip}>
              <MaterialIcons name={stat.icon} size={14} color={Colors.primary} />
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map(tab => (
            <Pressable
              key={tab.key}
              style={[styles.tabChip, activeTab === tab.key && styles.tabChipActive]}
              onPress={() => handleTabPress(tab.key)}
            >
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tab: Serviços */}
        {activeTab === 'servicos' && (
          <View style={styles.tabContent}>
            {loadingServices ? (
              <ActivityIndicator color={Colors.primary} style={styles.loader} />
            ) : services.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum serviço cadastrado.</Text>
            ) : (
              services.map(service => {
                const cat = CATEGORIES.find(c => c.key === service.category);
                return (
                  <View key={service.id} style={styles.serviceCard}>
                    <View style={[
                      styles.serviceIcon,
                      { backgroundColor: cat?.color ?? Colors.surfaceContainerHighest },
                    ]}>
                      <MaterialIcons
                        name={cat?.icon ?? 'home-repair-service'}
                        size={20}
                        color={Colors.onSurfaceVariant}
                      />
                    </View>
                    <View style={styles.serviceBody}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.servicePrice}>{formatPrice(service)}</Text>
                      {service.description ? (
                        <Text style={styles.serviceDesc} numberOfLines={1}>
                          {service.description}
                        </Text>
                      ) : null}
                    </View>
                    <Pressable
                      style={({ pressed }) => [styles.verBtn, pressed && { opacity: 0.8 }]}
                      onPress={() =>
                        router.push({
                          pathname: '/(client)/service-detail' as any,
                          params: {
                            serviceId: String(service.id),
                            providerName,
                          },
                        })
                      }
                    >
                      <Text style={styles.verBtnText}>Ver</Text>
                    </Pressable>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Tab: Sobre */}
        {activeTab === 'sobre' && (
          <View style={styles.tabContent}>
            <Text style={styles.bio}>{MOCK_BIO}</Text>

            <Text style={styles.subheading}>Especialidades</Text>
            <View style={styles.specialtyGrid}>
              {MOCK_SPECIALTIES.map(s => (
                <View key={s.label} style={styles.specialtyChip}>
                  <MaterialIcons name={s.icon} size={16} color={Colors.primary} />
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
                  <Text style={styles.certSubtitle}>{c.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tab: Avaliações */}
        {activeTab === 'avaliacoes' && (
          <View style={styles.tabContent}>
            {loadingReviews ? (
              <ActivityIndicator color={Colors.primary} style={styles.loader} />
            ) : !reviewData || reviewData.total_count === 0 ? (
              <Text style={styles.emptyText}>Nenhuma avaliação ainda.</Text>
            ) : (
              <>
                <View style={styles.ratingBig}>
                  <Text style={styles.ratingBigNumber}>
                    {reviewData.avg_rating?.toFixed(1)}
                  </Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <MaterialIcons
                        key={i}
                        name={i <= Math.round(reviewData.avg_rating ?? 0) ? 'star' : 'star-border'}
                        size={18}
                        color="#fbbf24"
                      />
                    ))}
                  </View>
                  <Text style={styles.totalCount}>
                    {reviewData.total_count} avaliações
                  </Text>
                </View>

                {reviewData.reviews.slice(0, 5).map(review => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewerName}>{review.reviewer_name}</Text>
                      <Text style={styles.reviewDate}>
                        {new Date(review.created_at).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                    <View style={styles.starsRow}>
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <MaterialIcons key={i} name="star" size={12} color="#fbbf24" />
                      ))}
                    </View>
                    {review.comment ? (
                      <Text style={styles.reviewComment}>"{review.comment}"</Text>
                    ) : null}
                  </View>
                ))}

                <Pressable
                  style={styles.seeAllBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/(client)/provider-reviews' as any,
                      params: { userId: String(providerId), name: providerName },
                    })
                  }
                >
                  <Text style={styles.seeAllBtnText}>Ver todas as avaliações</Text>
                  <MaterialIcons name="chevron-right" size={18} color={Colors.primary} />
                </Pressable>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* CTA fixo */}
      <View style={styles.ctaWrap}>
        <GradientButton
          label="Agendar uma Consulta"
          onPress={() =>
            Alert.alert(
              'Em breve',
              'A funcionalidade de agendamento estará disponível em breve.',
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingBottom: Spacing.xxxl * 3 },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 24,
    color: Colors.primary,
  },
  profileInfo: { flex: 1, gap: Spacing.xs },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  providerName: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.onSurface,
    letterSpacing: -0.3,
    flex: 1,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  reviewCount: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },

  statsRow: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
  },
  statLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    color: Colors.primary,
  },

  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  tabChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  tabChipActive: { backgroundColor: Colors.primaryContainer },
  tabLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  tabLabelActive: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.primary,
  },

  tabContent: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  loader: { marginTop: Spacing.xxxl },
  emptyText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: Spacing.xxxl,
  },

  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.base,
    gap: Spacing.md,
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceBody: { flex: 1, gap: 2 },
  serviceName: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  servicePrice: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    color: Colors.primary,
  },
  serviceDesc: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  verBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  verBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.primary,
  },

  bio: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurface,
    lineHeight: 22,
  },
  subheading: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: 14,
    color: Colors.onSurface,
    marginTop: Spacing.md,
    letterSpacing: -0.2,
  },
  specialtyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
  },
  specialtyLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    color: Colors.primary,
  },
  certRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  certTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  certSubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },

  ratingBig: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  ratingBigNumber: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 48,
    color: Colors.onSurface,
    letterSpacing: -2,
  },
  starsRow: { flexDirection: 'row', gap: 2 },
  totalCount: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  reviewCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.base,
    gap: Spacing.xs,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerName: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  reviewDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  reviewComment: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerHighest,
    marginTop: Spacing.sm,
  },
  seeAllBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.primary,
  },

  ctaWrap: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHighest,
  },
});

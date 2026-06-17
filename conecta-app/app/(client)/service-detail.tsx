import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, Spacing, Radius, GradientColors } from '@/constants/theme';
import { CATEGORIES } from '@/constants/categories';
import { publicServicesApi, PublicService, reviewsApi, ServiceReview } from '@/services/api';

// ── Constants ─────────────────────────────────────────────────────────────────

const INCLUDED_ITEMS = [
  'Materiais básicos de fixação e cabeamento padrão',
  'Mão de obra qualificada por profissionais certificados',
  'Certificado de garantia de 12 meses na instalação',
  'Teste de funcionamento e configuração inicial',
];

const MOCK_REVIEWS: ServiceReview[] = [
  {
    id: -1,
    rating: 5,
    reviewer_name: 'Ricardo M.',
    comment: 'Serviço impecável. O profissional explicou cada passo e deixou a garagem limpa. O carregador está funcionando perfeitamente.',
    created_at: new Date().toISOString(),
  },
  {
    id: -2,
    rating: 5,
    reviewer_name: 'Ana Luísa',
    comment: 'Muito pontuais e profissionais. Recomendo fortemente para quem acabou de comprar um carro elétrico.',
    created_at: new Date().toISOString(),
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

function formatPrice(service: PublicService): string {
  if (!service.price) return 'Sob consulta';
  const prefix = service.price_type === 'a_partir_de' ? 'A partir de ' : '';
  return `${prefix}R$ ${service.price.toFixed(2).replace('.', ',')}`;
}

function formatPriceLabel(service: PublicService): { label: string | null; value: string } {
  if (!service.price) return { label: null, value: 'Sob consulta' };
  return {
    label: service.price_type === 'a_partir_de' ? 'A PARTIR DE' : null,
    value: `R$ ${service.price.toFixed(2).replace('.', ',')}`,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ServiceDetailScreen() {
  // accept both 'id' (new callers) and 'serviceId' (legacy) for compatibility
  const params = useLocalSearchParams<{ id?: string; serviceId?: string }>();
  const rawId = params.id ?? params.serviceId;

  const [service, setService] = useState<PublicService | null>(null);
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    if (!rawId) return;
    const numId = Number(rawId);
    Promise.all([
      publicServicesApi.getById(numId),
      reviewsApi.list(numId),
    ])
      .then(([svc, rvs]) => { setService(svc); setReviews(rvs); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rawId]);

  const cat = service ? CATEGORIES.find(c => c.key === service.category) : null;

  // ── Loading / error states ───────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <TopNav />
        <View style={styles.centerWrap}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <TopNav />
        <View style={styles.centerWrap}>
          <Text style={styles.errorText}>Serviço não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const priceFormatted = formatPriceLabel(service);
  const reviewsToDisplay = reviews.length > 0 ? reviews : MOCK_REVIEWS;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNav />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9Jjk1nyObVUPrJ-VqE1Goa6Wndh6eWakL-h5m1o3qbZ73OZNV-58rLROcX7rNDKcobvWiLJnx0zB7Zg2i8cIuMda3eBje1wPPISi7BshH1kT5FTFhxTMWLGT5lb_d0nZEYCYYVUfYFXo2lbkP8As3c6MiCqlstv0d-EWIKqUQTqi0lviIxd2rVYMoZo_w6UC6iNXk61kIC50fRewkZQLHtAVFv34_CHqKtb5rMdYOE3rGlohCeUE35I8rO-031evGDEwasoqEsFA' }}
            style={styles.heroImage}
          />
          {/* Fade-to-dark overlay at bottom */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)']}
            style={styles.heroOverlay}
          />
        </View>

        {/* ── Header Card (overlapping hero) ─────────────────────────── */}
        <View style={styles.headerCard}>
          {/* "Serviço Premium" badge */}
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>Serviço Premium</Text>
          </View>

          <Text style={styles.serviceName}>{service.name}</Text>

          {/* Rating row */}
          {service.avg_rating != null ? (
            <View style={styles.ratingRow}>
              <MaterialIcons name="star" size={15} color="#eab308" />
              <Text style={styles.ratingNum}>{service.avg_rating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({service.review_count} avaliações)</Text>
            </View>
          ) : (
            <Text style={styles.ratingCount}>Novo serviço</Text>
          )}

          {/* Divider + price/duration row */}
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <View style={styles.priceBlock}>
              {priceFormatted.label && (
                <Text style={styles.priceLabel}>{priceFormatted.label}</Text>
              )}
              <Text style={styles.priceValue}>{priceFormatted.value}</Text>
            </View>
            {service.duration ? (
              <View style={styles.durationChip}>
                <MaterialIcons name="schedule" size={17} color={Colors.outline} />
                <Text style={styles.durationText}>{service.duration}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── Content area ──────────────────────────────────────────────── */}
        <View style={styles.content}>

          {/* Sobre o serviço */}
          {service.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sobre o serviço</Text>
              <Text style={styles.descText}>{service.description}</Text>
            </View>
          ) : null}

          {/* O que está incluso */}
          <View style={styles.includedCard}>
            <Text style={styles.sectionTitle}>O que está incluso</Text>
            <View style={styles.checkList}>
              {INCLUDED_ITEMS.map(item => (
                <View key={item} style={styles.checkRow}>
                  <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                  <Text style={styles.checkText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Avaliações preview */}
          {reviewsToDisplay.length > 0 && (
            <View style={styles.section}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.sectionTitle}>Avaliações</Text>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/(client)/provider-reviews' as any,
                      params: {
                        userId: String(service.provider_id),
                        name: service.provider_name,
                      },
                    })
                  }
                >
                  <Text style={styles.seeAllLink}>VER TODAS</Text>
                </Pressable>
              </View>
              <View style={styles.reviewsList}>
                {reviewsToDisplay.slice(0, 2).map(review => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewCardHeader}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>
                          {getInitials(review.reviewer_name)}
                        </Text>
                      </View>
                      <View style={styles.reviewMeta}>
                        <Text style={styles.reviewerName}>{review.reviewer_name}</Text>
                        <View style={styles.starsRow}>
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <MaterialIcons key={i} name="star" size={12} color="#eab308" />
                          ))}
                          {Array.from({ length: 5 - review.rating }).map((_, i) => (
                            <MaterialIcons key={`e${i}`} name="star-border" size={12} color={Colors.border} />
                          ))}
                        </View>
                      </View>
                    </View>
                    {review.comment ? (
                      <Text style={styles.reviewComment}>{`"${review.comment}"`}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          )}

        </View>
      </ScrollView>

      {/* ── Fixed CTA ─────────────────────────────────────────────────── */}
      <View style={styles.ctaWrap}>
        <Pressable
          style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.92 }]}
          onPress={() =>
            router.push({
              pathname: '/(scheduling)/book' as any,
              params: {
                serviceId: String(service.id),
                providerId: String(service.provider_id),
                serviceName: service.name,
                servicePrice: String(service.price ?? 0),
                serviceDuration: service.duration ?? '',
                providerName: service.provider_name,
              },
            })
          }
        >
          <LinearGradient
            colors={GradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <MaterialIcons name="calendar-today" size={20} color={Colors.onPrimary} />
            <Text style={styles.ctaLabel}>Agendar agora</Text>
          </LinearGradient>
        </Pressable>
      </View>

    </SafeAreaView>
  );
}

// ── TopNav subcomponent ───────────────────────────────────────────────────────

function TopNav() {
  return (
    <View style={styles.topNav}>
      <View style={styles.topNavLeft}>
        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={22} color={Colors.secondary} />
        </Pressable>
        <Text style={styles.topNavLogo}>SevGen</Text>
      </View>
      <Pressable style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}>
        <MaterialIcons name="share" size={22} color={Colors.secondary} />
      </Pressable>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: {
    fontFamily: FontFamily.bodyRegular, fontSize: 14, color: Colors.inkMuted,
  },

  // TopNav
  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, height: 56,
    backgroundColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  topNavLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  topNavLogo: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 18,
    color: Colors.secondary,
    letterSpacing: -0.5,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingBottom: Spacing.xxxl * 3 },

  // Hero
  heroWrap: { height: 300, position: 'relative' },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: { position: 'absolute', inset: 0, flex: 1, alignItems: 'center', justifyContent: 'center' } as any,
  heroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
  },

  // Header card (overlaps hero)
  headerCard: {
    marginHorizontal: Spacing.xl,
    marginTop: -Spacing.xxxl,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.sm,
    elevation: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 20,
    zIndex: 10,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.brand + '15',
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: Radius.full,
  },
  premiumBadgeText: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 11,
    color: Colors.primary,
  },
  serviceName: {
    fontFamily: FontFamily.headlineExtraBold, fontSize: 22,
    color: Colors.ink, letterSpacing: -0.6, lineHeight: 28,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingNum: {
    fontFamily: FontFamily.headlineBold, fontSize: 13, color: Colors.ink,
  },
  ratingCount: {
    fontFamily: FontFamily.bodyRegular, fontSize: 13, color: Colors.inkMuted,
  },
  divider: {
    height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  priceBlock: { gap: 2 },
  priceLabel: {
    fontFamily: FontFamily.bodyMedium, fontSize: 10,
    color: Colors.inkMuted, letterSpacing: 1,
  },
  priceValue: {
    fontFamily: FontFamily.headlineExtraBold, fontSize: 24,
    color: Colors.primary, letterSpacing: -0.5,
  },
  durationChip: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  durationText: {
    fontFamily: FontFamily.bodyMedium, fontSize: 13, color: Colors.inkMuted,
  },

  // Content
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    gap: Spacing.xxl,
  },
  section: { gap: Spacing.md },
  sectionTitle: {
    fontFamily: FontFamily.headlineBold, fontSize: 17,
    color: Colors.ink, letterSpacing: -0.3,
  },
  descText: {
    fontFamily: FontFamily.bodyRegular, fontSize: 14,
    color: Colors.inkMuted, lineHeight: 22,
  },

  // Included card
  includedCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg, padding: Spacing.xl, gap: Spacing.base,
  },
  checkList: { gap: Spacing.base },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  checkText: {
    fontFamily: FontFamily.bodyMedium, fontSize: 14,
    color: Colors.ink, flex: 1, lineHeight: 21,
  },

  // Reviews preview
  reviewsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  seeAllLink: {
    fontFamily: FontFamily.headlineBold, fontSize: 11,
    color: Colors.primary, letterSpacing: 1.5,
  },
  reviewsList: { gap: Spacing.md },
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg, padding: Spacing.xl,
    gap: Spacing.md, borderWidth: 1,
    borderColor: Colors.border + '1A',
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
  },
  reviewCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  reviewAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  reviewAvatarText: {
    fontFamily: FontFamily.headlineBold, fontSize: 13, color: Colors.primary,
  },
  reviewMeta: { gap: 3 },
  reviewerName: {
    fontFamily: FontFamily.headlineBold, fontSize: 13, color: Colors.ink,
  },
  starsRow: { flexDirection: 'row', gap: 1 },
  reviewComment: {
    fontFamily: FontFamily.bodyRegular, fontSize: 13,
    color: Colors.inkMuted, fontStyle: 'italic', lineHeight: 20,
  },

  // CTA
  ctaWrap: {
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base,
    backgroundColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.06, shadowRadius: 20, elevation: 8,
  },
  ctaBtn: { borderRadius: Radius.lg, overflow: 'hidden' },
  ctaGradient: {
    height: 56, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: Spacing.md, borderRadius: Radius.lg,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20,
  },
  ctaLabel: {
    fontFamily: FontFamily.headlineBold, fontSize: 17,
    color: Colors.onPrimary, letterSpacing: -0.2,
  },
});

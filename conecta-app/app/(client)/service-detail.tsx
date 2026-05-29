import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/gradient-button';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { CATEGORIES } from '@/constants/categories';
import {
  publicServicesApi,
  PublicService,
  reviewsApi,
  ServiceReview,
} from '@/services/api';

const INCLUDED_ITEMS = [
  'Mão de obra qualificada',
  'Garantia de 90 dias',
  'Materiais básicos inclusos',
];

function formatPrice(service: PublicService): string {
  if (!service.price) return 'Sob consulta';
  const prefix = service.price_type === 'a_partir_de' ? 'A partir de ' : '';
  return `${prefix}R$ ${service.price.toFixed(2).replace('.', ',')}`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function ServiceDetailScreen() {
  const { serviceId, providerName } = useLocalSearchParams<{
    serviceId?: string;
    providerName?: string;
  }>();

  const [service, setService] = useState<PublicService | null>(null);
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceId) return;
    const id = Number(serviceId);
    Promise.all([
      publicServicesApi.getById(id),
      reviewsApi.list(id),
    ])
      .then(([svc, rvs]) => {
        setService(svc);
        setReviews(rvs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [serviceId]);

  const cat = service ? CATEGORIES.find(c => c.key === service.category) : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <TopAppBar title="Detalhes" />
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <TopAppBar title="Serviço não encontrado" />
        <View style={styles.loaderWrap}>
          <Text style={styles.errorText}>Serviço não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title={service.name} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: cat?.color ?? Colors.primaryContainer }]}>
          <MaterialIcons
            name={cat?.icon ?? 'home-repair-service'}
            size={56}
            color={Colors.primary}
          />
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          {service.category ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{service.category}</Text>
            </View>
          ) : null}
          <Text style={styles.serviceName}>{service.name}</Text>
          <View style={styles.metaRow}>
            {service.avg_rating != null ? (
              <>
                <MaterialIcons name="star" size={14} color="#fbbf24" />
                <Text style={styles.metaText}>
                  {service.avg_rating.toFixed(1)} ({service.review_count})
                </Text>
              </>
            ) : (
              <Text style={styles.metaText}>Novo</Text>
            )}
            <Text style={styles.metaSep}>·</Text>
            <Text style={styles.price}>{formatPrice(service)}</Text>
          </View>
          {service.duration ? (
            <View style={styles.durationRow}>
              <MaterialIcons name="schedule" size={14} color={Colors.outline} />
              <Text style={styles.durationText}>{service.duration}</Text>
            </View>
          ) : null}
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Left: description + checklist */}
          <View style={styles.mainCol}>
            {service.description ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sobre o serviço</Text>
                <Text style={styles.description}>{service.description}</Text>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>O que está incluso</Text>
              {INCLUDED_ITEMS.map(item => (
                <View key={item} style={styles.checkRow}>
                  <MaterialIcons name="check-circle" size={16} color="#16a34a" />
                  <Text style={styles.checkText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Right: reviews preview */}
          {reviews.length > 0 ? (
            <View style={styles.sideCol}>
              <Text style={styles.sectionTitle}>Avaliações</Text>
              {reviews.slice(0, 2).map(review => (
                <View key={review.id} style={styles.reviewPreview}>
                  <View style={styles.reviewAvatarSmall}>
                    <Text style={styles.reviewAvatarText}>
                      {getInitials(review.reviewer_name)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.reviewerName}>{review.reviewer_name}</Text>
                    <View style={styles.starsRow}>
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <MaterialIcons key={i} name="star" size={10} color="#fbbf24" />
                      ))}
                    </View>
                    {review.comment ? (
                      <Text style={styles.reviewComment} numberOfLines={2}>
                        "{review.comment}"
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* CTA fixo */}
      <View style={styles.ctaWrap}>
        <GradientButton
          label="Agendar agora"
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
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  scroll: { paddingBottom: Spacing.xxxl * 3 },

  hero: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoCard: {
    marginHorizontal: Spacing.xl,
    marginTop: -Spacing.xl,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    gap: Spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  categoryBadgeText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.primary,
  },
  serviceName: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  metaSep: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.outlineVariant,
  },
  price: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.primary,
  },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  durationText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },

  body: {
    flexDirection: 'row',
    padding: Spacing.xl,
    gap: Spacing.base,
    alignItems: 'flex-start',
  },
  mainCol: { flex: 3, gap: Spacing.xl },
  sideCol: { flex: 2, gap: Spacing.md },

  section: { gap: Spacing.sm },
  sectionTitle: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: 14,
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  description: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurface,
    lineHeight: 20,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurface,
  },

  reviewPreview: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  reviewAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.primary,
  },
  reviewerName: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.onSurface,
  },
  starsRow: { flexDirection: 'row', gap: 1 },
  reviewComment: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
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

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { providerApi, ProviderReviews } from '@/services/api';

export default function ProviderReviewsScreen() {
  const { userId, name } = useLocalSearchParams<{
    userId?: string;
    name?: string;
  }>();
  const providerName = name ?? 'Prestador';

  const [data, setData] = useState<ProviderReviews | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    providerApi
      .reviews(Number(userId))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title={`Avaliações de ${providerName}`} />

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : !data || data.total_count === 0 ? (
        <View style={styles.loaderWrap}>
          <MaterialIcons name="rate-review" size={48} color={Colors.outlineVariant} />
          <Text style={styles.emptyText}>Nenhuma avaliação ainda.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Rating summary card */}
          <View style={styles.summaryCard}>
            <Text style={styles.ratingBig}>{data.avg_rating?.toFixed(1)}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <MaterialIcons key={i} name="star" size={22} color="#fbbf24" />
              ))}
            </View>
            <Text style={styles.totalCount}>{data.total_count} Avaliações</Text>

            {/* Distribution bars */}
            <View style={styles.distribution}>
              {[5, 4, 3, 2, 1].map(star => {
                const count = data.distribution[star] ?? 0;
                const pct = data.total_count > 0
                  ? Math.round((count / data.total_count) * 100)
                  : 0;
                return (
                  <View key={star} style={styles.barRow}>
                    <MaterialIcons name="star" size={12} color="#fbbf24" />
                    <Text style={styles.barStar}>{star}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${pct}%` as any },
                        ]}
                      />
                    </View>
                    <Text style={styles.barPct}>{pct}%</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Reviews list */}
          <Text style={styles.listHeader}>Avaliações Recentes</Text>
          <View style={styles.reviewsList}>
            {data.reviews.map(review => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewTopRow}>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.reviewer_name}</Text>
                    <View style={styles.serviceChip}>
                      <Text style={styles.serviceChipText} numberOfLines={1}>
                        {review.service_name}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <View style={styles.starsRow}>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <MaterialIcons key={i} name="star" size={14} color="#fbbf24" />
                  ))}
                  {Array.from({ length: 5 - review.rating }).map((_, i) => (
                    <MaterialIcons key={`empty-${i}`} name="star-outline" size={14} color={Colors.outlineVariant} />
                  ))}
                </View>
                {review.comment ? (
                  <Text style={styles.reviewComment}>"{review.comment}"</Text>
                ) : null}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  loaderWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  scroll: {
    padding: Spacing.xl,
    gap: Spacing.xl,
    paddingBottom: Spacing.xxxl * 2,
  },

  // Summary card
  summaryCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  ratingBig: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 56,
    color: Colors.onSurface,
    letterSpacing: -3,
  },
  starsRow: { flexDirection: 'row', gap: 3 },
  totalCount: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },

  // Distribution
  distribution: { width: '100%', gap: Spacing.xs },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  barStar: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    width: 10,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  barPct: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    width: 32,
    textAlign: 'right',
  },

  // Reviews list
  listHeader: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: 16,
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  reviewsList: { gap: Spacing.md },
  reviewCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  reviewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  reviewerInfo: { flex: 1, gap: 4 },
  reviewerName: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  serviceChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  serviceChipText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  reviewDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.outlineVariant,
    flexShrink: 0,
  },
  reviewComment: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});

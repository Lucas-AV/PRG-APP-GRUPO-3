import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { providerApi, ProviderReviews, ProviderReview } from '@/services/api';

const CLIENT_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAwc82zLeu0B7_p29mp9qroynrHleO2haoo2qTAcwvAXaVzpPfvMI-5Z11YD3rdqUlrBTu6LRUGc1MTX2dTJQ2yOu8auCrrpZ8cUUOjqWSIftUePg4HDUeDTzqpG1Xb7vk13ysmCdn7AgUO-3z2fLtgBIjsf9b4WF-UueSGMicaV18Oq7yxkLDw1OWdrSXgdVHc9pXIzaAHVRbp1agWadD5j8u3TaTnkpietf6-iZSGXj138sgYuSrSzqwXyRwIuDP5teZ3tTrjbrY',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAEyt8aKGRoo4cASjst9rzYDo5SDJuSns-JeVJx5Lz4cPfQ0UZQ_SJfQsj05fapd5sPpds6lF7jjwnXhhxfbB6AIzO-FzYhoWXeZFtJI9IjFBWOpDqr0nmsr3xriTLJGtTMDj9DQMKW87pMu_Me_SAbZn_jTytcazT2aKIvtKNWVSYBy6kYDWDWk36_oIPQoWL-aCp-gu7rV2R2KueydTy2__u0XWSczeYV7HlLfgoxDng6h95HiKa_JLmxBeq4cwvnGaaJAykWnwA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBkjg3NyIQjmVGiXuOxRdcAQos0yYalbVHAMPK9auuLGdBHslnmE-OiT1MdCeA_cjG6AQoRSjyWuwhnGmj6TTln1G9_e2Rsk-E-y5Ej5BNuvAMu_HnjARKGZqDDgbGL4sAk48a1qYSGZs7tdh7Xob-86UuKCAHY8nWFTSGvZBmCLb44KaTG5hN-XzVDild1GrUtx475dbeK-VVnVzyrgxNC7ENLPTB_EcKUXImg6fBenBsyiRQ-7Apzzd9-h8pAuyl2IjWSwWwM8bQ',
];

const ATTACHMENT_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCRhxz_o_PlvKZo-Wc_gW1c3ikaoH04lrWzTQ1f3SqZQ9xZ7VgGJLXADJhGmuii4lUyZROlE1jAVGs_-T4MRgTuSXICFOyDAZcUGARQnLtLuJCWF7v0musgGNjkipYP0tuoYfSntJRaSLVmNsZFDspEAd1R_CQl8AAMMXcfrg0fZZg2rQvLe8nwj_qA2B24cRJqZMNqbaM1VqpQ0E_LWSc1vjRrAIy1y211WjB5GnhCtZ39rCPxEXKRr1UfQjfVKInHxxKWLj5nJ_c',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDKwRjWi5qTJpYGHqbNhMbxY-neO2pUyRwi4DV263tX0_sJ2cwNLrrWXUUmlSaTdVarih9ZEEx9vvUTtEM5B8hL0leNL33Qa_Y2tlornU1RlPLpoyhvCHHSiKM4MIqha-BLFSVMc6bLNT1fBtZQljsjTRPHbFAWxTgcelD6yDiFS4MvShf8Z2rCKlpzFqFQQd4-EL2Pri8UFk4igFeENQMAe5YY13gHXW-E9jiq6TNMpFMq_viyP_otrVZlJnRmj7JwEO0MYl-YBbs',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCkS803vDsYrv55vDdMS_0xiJpx8VISdfBrxc5CUXgTqpedxYUhKigueJiiSTwEusNJ38cUIJasIlqGKWntGI-cMVko_VGgFWhUigGy7HTGXZRPa9A25BA3ZLLtug_nloC6Q5-qas_SfZD80kvGCu_LISP3f765OfwNxi4Mdx1Q26Nj9jxt0XnxNL4YUSl9Ql2z5DXj0nXonwJFjl443Te_4r-TnzuuyRdgm5MrG8TWtmYmWPnG1w5gB3SEEcg9Zp4CRY-Hv5VVt4Q',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

const AVATAR_GRADIENTS: [string, string][] = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#a18cd1', '#fbc2eb'],
  ['#fccb90', '#d57eeb'],
];

// Gradient pairs for photo placeholder thumbnails (shown on select reviews)
const THUMB_GRADIENTS: [string, string][] = [
  ['#1e3a8a', '#3b82f6'],
  ['#065f46', '#10b981'],
  ['#7c2d12', '#f97316'],
];

const THUMB_ICONS: Array<keyof typeof MaterialIcons.glyphMap> = [
  'electrical-services',
  'lightbulb',
  'build',
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProviderReviewsScreen() {
  const { userId } = useLocalSearchParams<{ userId?: string; name?: string }>();
  const { width } = useWindowDimensions();

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

  // bar chart: right column width = total width - left column (rating) - gap
  const HPAD   = Spacing.xl * 2;
  const GAP    = Spacing.xxl;
  const LEFT_W = 100;
  const barW   = width - HPAD - GAP - LEFT_W;

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
        <Text style={styles.topBarTitle}>Avaliações e Notas</Text>
        <Pressable style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}>
          <MaterialIcons name="more-vert" size={24} color={Colors.onSurfaceVariant} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : !data || data.total_count === 0 ? (
        <View style={styles.centerWrap}>
          <MaterialIcons name="rate-review" size={52} color={Colors.outlineVariant} />
          <Text style={styles.emptyText}>Nenhuma avaliação ainda.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >

          {/* ── Summary card (2 colunas) ──────────────────────────────── */}
          <View style={styles.summaryCard}>
            {/* Esquerda: nota grande + estrelas + contagem */}
            <View style={styles.summaryLeft}>
              <Text style={styles.ratingBig}>{data.avg_rating?.toFixed(1)}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(i => (
                  <MaterialIcons key={i} name="star" size={20} color={Colors.primary} />
                ))}
              </View>
              <Text style={styles.totalCount}>
                {data.total_count} AVALIAÇÕES
              </Text>
            </View>

            {/* Direita: barras de distribuição */}
            <View style={[styles.summaryRight, { width: barW }]}>
              {[5, 4, 3, 2, 1].map(star => {
                const count = data.distribution[star] ?? 0;
                const pct   = data.total_count > 0
                  ? (count / data.total_count) * 100
                  : 0;
                return (
                  <View key={star} style={styles.barRow}>
                    <Text style={styles.barNum}>{star}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct}%` as any }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ── Filter header ─────────────────────────────────────────── */}
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Avaliações Recentes</Text>
            <Pressable style={({ pressed }) => [styles.sortPill, pressed && { opacity: 0.8 }]}>
              <Text style={styles.sortLabel}>Mais Recentes</Text>
              <MaterialIcons name="expand-more" size={18} color={Colors.onSurface} />
            </Pressable>
          </View>

          {/* ── Reviews list ──────────────────────────────────────────── */}
          <View style={styles.reviewsList}>
            {data.reviews.map((review, idx) => (
              <ReviewCard key={review.id} review={review} index={idx} />
            ))}
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── ReviewCard subcomponent ───────────────────────────────────────────────────

function ReviewCard({ review, index }: { review: ProviderReview; index: number }) {
  const hasThumb = index % 2 === 0;
  const thumbIdx = Math.floor(index / 2) % ATTACHMENT_IMAGES.length;

  return (
    <View style={styles.reviewCard}>
      {/* Header row: avatar+name+date LEFT · stars RIGHT */}
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerRow}>
          <View style={styles.reviewerAvatar}>
            <Image
              source={{ uri: CLIENT_IMAGES[index % CLIENT_IMAGES.length] }}
              style={styles.reviewAvatarImage}
            />
          </View>
          <View style={styles.reviewerMeta}>
            <Text style={styles.reviewerName}>{review.reviewer_name}</Text>
            <Text style={styles.reviewDate}>
              {new Date(review.created_at).toLocaleDateString('pt-BR', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </Text>
          </View>
        </View>
        <View style={styles.reviewStars}>
          {Array.from({ length: review.rating }).map((_, i) => (
            <MaterialIcons key={i} name="star" size={16} color={Colors.primary} />
          ))}
          {Array.from({ length: 5 - review.rating }).map((_, i) => (
            <MaterialIcons key={`e${i}`} name="star-border" size={16} color={Colors.outlineVariant} />
          ))}
        </View>
      </View>

      {/* Comment */}
      {review.comment ? (
        <Text style={styles.reviewComment}>{review.comment}</Text>
      ) : null}

      {/* Service chip */}
      {review.service_name ? (
        <View style={styles.serviceChip}>
          <MaterialIcons name="home-repair-service" size={11} color={Colors.onSurfaceVariant} />
          <Text style={styles.serviceChipText} numberOfLines={1}>
            {review.service_name}
          </Text>
        </View>
      ) : null}

      {/* Optional photo thumbnails */}
      {hasThumb && (
        <View style={styles.thumbsRow}>
          {ATTACHMENT_IMAGES.slice(thumbIdx, thumbIdx + 2).map((imgUrl, ti) => (
            <View key={ti} style={styles.thumb}>
              <Image source={{ uri: imgUrl }} style={styles.thumbImage} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },

  // TopAppBar
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, height: 56,
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  topBarTitle: {
    fontFamily: FontFamily.headlineBold, fontSize: 17,
    color: Colors.onSurface, letterSpacing: -0.3,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
  },

  centerWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md,
  },
  emptyText: {
    fontFamily: FontFamily.bodyRegular, fontSize: 14, color: Colors.onSurfaceVariant,
  },

  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.xxl,
  },

  // Summary card — 2 colunas
  summaryCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20, padding: Spacing.xl,
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.xxl,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
  },
  summaryLeft: {
    width: 100, alignItems: 'center', gap: Spacing.xs,
  },
  ratingBig: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 56, color: Colors.onSurface, letterSpacing: -3,
  },
  starsRow: { flexDirection: 'row', gap: 2 },
  totalCount: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 9, color: Colors.onSurfaceVariant,
    letterSpacing: 1, textAlign: 'center',
  },
  summaryRight: { gap: Spacing.sm },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  barNum: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12, color: Colors.onSurfaceVariant, width: 10,
  },
  barTrack: {
    flex: 1, height: 8,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.full, overflow: 'hidden',
  },
  barFill: {
    height: '100%', backgroundColor: Colors.primary, borderRadius: Radius.full,
  },

  // Filter header
  listHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  listTitle: {
    fontFamily: FontFamily.headlineBold, fontSize: 20,
    color: Colors.onSurface, letterSpacing: -0.5,
  },
  sortPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  sortLabel: {
    fontFamily: FontFamily.bodyMedium, fontSize: 13, color: Colors.onSurface,
  },

  // Reviews list
  reviewsList: { gap: Spacing.xl },
  reviewCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20, padding: Spacing.xl,
    gap: Spacing.md,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
  },
  reviewHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reviewerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  reviewerAvatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  reviewAvatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  reviewerMeta: { gap: 2 },
  reviewerName: {
    fontFamily: FontFamily.headlineBold, fontSize: 14, color: Colors.onSurface,
  },
  reviewDate: {
    fontFamily: FontFamily.bodyMedium, fontSize: 11, color: Colors.onSurfaceVariant,
  },
  reviewStars: { flexDirection: 'row', gap: 1, paddingTop: 2 },

  reviewComment: {
    fontFamily: FontFamily.bodyRegular, fontSize: 14,
    color: Colors.onSurfaceVariant, lineHeight: 22,
  },

  serviceChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: Radius.full,
  },
  serviceChipText: {
    fontFamily: FontFamily.bodyMedium, fontSize: 10, color: Colors.onSurfaceVariant,
  },

  // Photo thumbnails
  thumbsRow: { flexDirection: 'row', gap: Spacing.sm },
  thumb: {
    width: 96, height: 96, borderRadius: Radius.lg, overflow: 'hidden',
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

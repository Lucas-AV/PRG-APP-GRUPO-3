import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, Spacing, Radius, GradientColors } from '@/constants/theme';
import { CATEGORIES } from '@/constants/categories';
import { publicServicesApi, PublicService, providerApi, ProviderReviews, ProviderProfile } from '@/services/api';
import { AvatarInitials } from '@/components/ui/avatar-initials';

type Tab = 'servicos' | 'sobre' | 'avaliacoes';

const TABS: { key: Tab; label: string }[] = [
  { key: 'servicos',   label: 'Serviços e Preços' },
  { key: 'sobre',      label: 'Sobre'             },
  { key: 'avaliacoes', label: 'Avaliações'        },
];

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

function formatPrice(s: PublicService) {
  if (!s.price) return 'Sob consulta';
  return `${s.price_type === 'a_partir_de' ? 'A partir de ' : ''}R$ ${s.price.toFixed(2).replace('.', ',')}`;
}

export default function ProviderProfileScreen() {
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const { width } = useWindowDimensions();
  const providerId = Number(id);
  const providerName = name ?? 'Prestador';

  const [activeTab, setActiveTab]     = useState<Tab>('servicos');
  const [services, setServices]       = useState<PublicService[]>([]);
  const [reviewData, setReviewData]   = useState<ProviderReviews | null>(null);
  const [profile, setProfile]         = useState<ProviderProfile | null>(null);
  const [loading, setLoading]         = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (!providerId) return;
    Promise.all([
      publicServicesApi.list({ provider_id: providerId }),
      providerApi.reviews(providerId),
      providerApi.profile(providerId),
    ])
      .then(([svcs, rvs, prof]) => {
        setServices(svcs);
        setReviewData(rvs);
        setProfile(prof);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [providerId]);

  const specialty = services.length > 0
    ? (CATEGORIES.find(c => c.key === services[0].category)?.label ?? services[0].category)
    : null;

  const avgRating   = reviewData?.avg_rating ?? null;
  const reviewCount = reviewData?.total_count ?? 0;

  const HPAD    = Spacing.xl * 2;
  const GAP     = Spacing.md;
  const halfCol = (width - HPAD - GAP) / 2;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <View style={styles.topBar}>
        <Pressable style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.topBarTitle}>Sobre o Profissional</Text>
        <Pressable style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]} onPress={() => setMenuVisible(true)}>
          <MaterialIcons name="more-vert" size={24} color={Colors.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.avatarWrap}>
            <AvatarInitials initials={getInitials(providerName)} size="lg" />
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={14} color={Colors.onPrimary} />
            </View>
          </View>
          <Text style={styles.heroName}>{providerName}</Text>
          {specialty && <Text style={styles.heroSpecialty}>{specialty}</Text>}
          <View style={styles.ratingPill}>
            <MaterialIcons name="star" size={14} color="#f59e0b" />
            <Text style={styles.ratingNum}>{(avgRating ?? 0).toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({reviewCount} {reviewCount === 1 ? 'avaliação' : 'avaliações'})</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <MaterialIcons name="history-edu" size={20} color={Colors.primary} />
            <View style={styles.statsTextWrap}>
              <Text style={styles.statsLabel}>Experiência</Text>
              <Text style={styles.statsValue}>
                {profile?.years_experience != null ? `${profile.years_experience} Anos` : '—'}
              </Text>
            </View>
          </View>
          <View style={styles.statsCard}>
            <MaterialIcons name="task-alt" size={20} color={Colors.primary} />
            <View style={styles.statsTextWrap}>
              <Text style={styles.statsLabel}>Realizados</Text>
              <Text style={styles.statsValue}>
                {profile != null ? `${profile.completed_count}+ Proj.` : '—'}
              </Text>
            </View>
          </View>
          <View style={styles.statsCard}>
            <MaterialIcons name="bolt" size={20} color={Colors.primary} />
            <View style={styles.statsTextWrap}>
              <Text style={styles.statsLabel}>Resposta</Text>
              <Text style={styles.statsValue}>{profile?.response_time ?? '—'}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabNav}>
          {TABS.map(tab => (
            <Pressable
              key={tab.key}
              style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.key)}
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
            {loading ? (
              <ActivityIndicator color={Colors.primary} style={styles.loader} />
            ) : services.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum serviço cadastrado.</Text>
            ) : (
              services.map(service => (
                <Pressable
                  key={service.id}
                  style={({ pressed }) => [styles.serviceCard, pressed && { opacity: 0.9 }]}
                  onPress={() => router.push({ pathname: '/(client)/service-detail' as any, params: { id: String(service.id) } })}
                >
                  <View style={styles.serviceBody}>
                    <View style={styles.serviceTopRow}>
                      <Text style={styles.serviceName} numberOfLines={1}>{service.name}</Text>
                      <Text style={styles.servicePrice}>{formatPrice(service)}</Text>
                    </View>
                    {service.description ? (
                      <Text style={styles.serviceDesc} numberOfLines={2}>{service.description}</Text>
                    ) : null}
                  </View>
                  <View style={styles.addBtn}>
                    <MaterialIcons name="add" size={22} color={Colors.primary} />
                  </View>
                </Pressable>
              ))
            )}
          </View>
        )}

        {/* Tab: Sobre */}
        {activeTab === 'sobre' && (
          <View style={styles.tabContent}>
            <View style={styles.bioSection}>
              <View style={styles.bioHeader}>
                <Text style={styles.sectionTitle}>Biografia</Text>
                {profile?.years_experience != null && (
                  <View style={styles.expBadge}>
                    <Text style={styles.expBadgeText}>{profile.years_experience} ANOS EXP.</Text>
                  </View>
                )}
              </View>
              <Text style={styles.bioText}>
                {profile?.bio ?? 'Informações sobre este profissional em breve.'}
              </Text>
            </View>

            {profile?.specialties && profile.specialties.length > 0 && (
              <View style={styles.specialtiesSection}>
                <Text style={styles.sectionTitle}>Especialidades</Text>
                <View style={styles.bentoGrid}>
                  {profile.specialties.map((spec, i) => (
                    <View
                      key={i}
                      style={[styles.bentoCard, spec.wide ? { width: '100%' } : { width: halfCol }]}
                    >
                      <MaterialIcons name={spec.icon as any} size={26} color={Colors.primary} />
                      <Text style={styles.bentoLabel}>{spec.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {profile?.certifications && profile.certifications.length > 0 && (
              <View style={styles.certsSection}>
                <Text style={styles.sectionTitle}>Certificações</Text>
                <View style={styles.certList}>
                  {profile.certifications.map(cert => (
                    <View key={cert.title} style={styles.certRow}>
                      <View style={styles.certIconBox}>
                        <MaterialIcons name={cert.icon as any} size={22} color={Colors.inkMuted} />
                      </View>
                      <View style={styles.certText}>
                        <Text style={styles.certTitle}>{cert.title}</Text>
                        <Text style={styles.certSubtitle}>{cert.subtitle}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Tab: Avaliações */}
        {activeTab === 'avaliacoes' && (
          <View style={styles.tabContent}>
            {loading ? (
              <ActivityIndicator color={Colors.primary} style={styles.loader} />
            ) : !reviewData || reviewData.total_count === 0 ? (
              <Text style={styles.emptyText}>Nenhuma avaliação ainda.</Text>
            ) : (
              <>
                <View style={styles.ratingCardContainer}>
                  <View style={styles.ratingCardLeft}>
                    <Text style={styles.ratingBigNum}>{reviewData.avg_rating?.toFixed(1)}</Text>
                    <View style={styles.starsRow}>
                      {[1,2,3,4,5].map(i => <MaterialIcons key={i} name="star" size={16} color="#f59e0b" />)}
                    </View>
                    <Text style={styles.ratingCardCount}>{reviewData.total_count} avaliações</Text>
                  </View>
                  <View style={styles.ratingCardRight}>
                    {[5,4,3,2,1].map(star => {
                      const count = reviewData.distribution?.[star] ?? 0;
                      const pct = reviewData.total_count > 0 ? (count / reviewData.total_count) * 100 : 0;
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

                {reviewData.reviews.slice(0, 5).map(review => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewCardHeader}>
                      <AvatarInitials initials={getInitials(review.reviewer_name)} size="md" />
                      <View style={styles.reviewMeta}>
                        <Text style={styles.reviewerName}>{review.reviewer_name}</Text>
                        <Text style={styles.reviewDate}>
                          {new Date(review.created_at).toLocaleDateString('pt-BR')}
                        </Text>
                      </View>
                      <View style={styles.starsRowRight}>
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <MaterialIcons key={i} name="star" size={13} color="#f59e0b" />
                        ))}
                        {Array.from({ length: 5 - review.rating }).map((_, i) => (
                          <MaterialIcons key={`e${i}`} name="star-border" size={13} color={Colors.border} />
                        ))}
                      </View>
                    </View>
                    {review.comment ? (
                      <Text style={styles.reviewComment}>{`"${review.comment}"`}</Text>
                    ) : null}
                  </View>
                ))}

                <Pressable
                  style={({ pressed }) => [styles.seeAllBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => router.push({ pathname: '/(client)/provider-reviews' as any, params: { userId: String(providerId), name: providerName } })}
                >
                  <Text style={styles.seeAllBtnLabel}>Ver todas as avaliações</Text>
                  <MaterialIcons name="chevron-right" size={18} color={Colors.primary} />
                </Pressable>
              </>
            )}
          </View>
        )}

      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaWrap}>
        <Pressable
          style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.92 }]}
          onPress={() => Alert.alert('Em breve', 'A funcionalidade de agendamento estará disponível em breve.')}
        >
          <LinearGradient colors={GradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGradient}>
            <Text style={styles.ctaLabel}>Agendar uma Consulta</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Menu Modal */}
      <Modal visible={menuVisible} transparent animationType="slide" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIndicator} />
              <Text style={styles.modalTitle}>{providerName}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.modalOption, pressed && styles.modalOptionPressed]}
              onPress={() => { setMenuVisible(false); Share.share({ message: `Confira o perfil de ${providerName} no Conecta!`, title: providerName }); }}
            >
              <MaterialIcons name="share" size={22} color={Colors.inkMuted} />
              <Text style={styles.modalOptionText}>Compartilhar perfil</Text>
            </Pressable>
            <View style={styles.modalDivider} />
            <Pressable
              style={({ pressed }) => [styles.modalOption, pressed && styles.modalOptionPressed]}
              onPress={() => { setMenuVisible(false); Alert.alert('Salvo!', `${providerName} foi adicionado aos seus favoritos.`); }}
            >
              <MaterialIcons name="bookmark-border" size={22} color={Colors.inkMuted} />
              <Text style={styles.modalOptionText}>Salvar prestador</Text>
            </Pressable>
            <View style={styles.modalDivider} />
            <Pressable
              style={({ pressed }) => [styles.modalOption, pressed && styles.modalOptionPressed]}
              onPress={() => { setMenuVisible(false); Alert.alert('Denúncia enviada', 'Obrigado. Vamos analisar este perfil em breve.'); }}
            >
              <MaterialIcons name="report-problem" size={22} color="#dc2626" />
              <Text style={[styles.modalOptionText, styles.modalOptionDestructive]}>Denunciar perfil</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.modalCancelBtn, pressed && { opacity: 0.9 }]} onPress={() => setMenuVisible(false)}>
              <Text style={styles.modalCancelLabel}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: Colors.surface },
  topBar:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, height: 56 },
  topBarTitle:         { fontFamily: FontFamily.headlineBold, fontSize: 17, color: Colors.ink, letterSpacing: -0.3 },
  iconBtn:             { width: 40, height: 40, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  scroll:              { paddingBottom: Spacing.xxxl * 3 },
  hero:                { alignItems: 'center', paddingTop: Spacing.xxl, paddingBottom: Spacing.xl, paddingHorizontal: Spacing.xl, gap: Spacing.xs },
  avatarWrap:          { position: 'relative', marginBottom: Spacing.md },
  verifiedBadge:       { position: 'absolute', bottom: 4, right: 4, width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.card },
  heroName:            { fontFamily: FontFamily.headlineExtraBold, fontSize: 28, color: Colors.ink, letterSpacing: -1, textAlign: 'center' },
  heroSpecialty:       { fontFamily: FontFamily.bodyMedium, fontSize: 15, color: Colors.inkMuted, textAlign: 'center' },
  ratingPill:          { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.card, paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: Radius.full, marginTop: 4 },
  ratingNum:           { fontFamily: FontFamily.headlineBold, fontSize: 13, color: Colors.ink },
  ratingCount:         { fontFamily: FontFamily.bodyRegular, fontSize: 12, color: Colors.inkMuted },
  statsContainer:      { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm, marginHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  statsCard:           { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.card, paddingHorizontal: Spacing.xs, paddingVertical: Spacing.md, borderRadius: Radius.lg },
  statsTextWrap:       { flex: 1 },
  statsLabel:          { fontFamily: FontFamily.bodySemiBold, fontSize: 9, color: Colors.inkMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  statsValue:          { fontFamily: FontFamily.headlineBold, fontSize: 11, color: Colors.ink },
  tabNav:              { flexDirection: 'row', marginHorizontal: Spacing.xl, marginBottom: Spacing.xl, backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 4, gap: 2 },
  tabItem:             { flex: 1, paddingVertical: Spacing.md - 2, borderRadius: Radius.md, alignItems: 'center' },
  tabItemActive:       { backgroundColor: Colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  tabLabel:            { fontFamily: FontFamily.bodySemiBold, fontSize: 12, color: Colors.inkMuted, textAlign: 'center' },
  tabLabelActive:      { fontFamily: FontFamily.headlineBold, color: Colors.primary },
  tabContent:          { paddingHorizontal: Spacing.xl, gap: Spacing.xxl },
  loader:              { marginTop: Spacing.xxxl },
  emptyText:           { fontFamily: FontFamily.bodyRegular, fontSize: 14, color: Colors.inkMuted, textAlign: 'center', marginTop: Spacing.xxxl },
  serviceCard:         { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.xl, flexDirection: 'row', alignItems: 'center', gap: Spacing.base, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  serviceBody:         { flex: 1, gap: Spacing.xs },
  serviceTopRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.sm },
  serviceName:         { fontFamily: FontFamily.headlineBold, fontSize: 16, color: Colors.ink, flex: 1, letterSpacing: -0.2 },
  servicePrice:        { fontFamily: FontFamily.headlineExtraBold, fontSize: 16, color: Colors.primary, flexShrink: 0 },
  serviceDesc:         { fontFamily: FontFamily.bodyRegular, fontSize: 13, color: Colors.inkMuted, lineHeight: 19 },
  addBtn:              { width: 48, height: 48, borderRadius: Radius.full, backgroundColor: Colors.brand + '15', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bioSection:          { gap: Spacing.md },
  bioHeader:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle:        { fontFamily: FontFamily.headlineBold, fontSize: 20, color: Colors.ink, letterSpacing: -0.5 },
  expBadge:            { backgroundColor: Colors.brand + '15', paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.sm },
  expBadgeText:        { fontFamily: FontFamily.bodySemiBold, fontSize: 10, color: Colors.primary, letterSpacing: 1 },
  bioText:             { fontFamily: FontFamily.bodyRegular, fontSize: 16, color: Colors.inkMuted, lineHeight: 26 },
  specialtiesSection:  { gap: Spacing.base },
  bentoGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  bentoCard:           { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.xl, gap: Spacing.md, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  bentoLabel:          { fontFamily: FontFamily.bodySemiBold, fontSize: 13, color: Colors.ink },
  certsSection:        { gap: Spacing.base },
  certList:            { gap: Spacing.md },
  certRow:             { flexDirection: 'row', alignItems: 'center', gap: Spacing.base, backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.base },
  certIconBox:         { width: 48, height: 48, borderRadius: Radius.md, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  certText:            { flex: 1, gap: 2 },
  certTitle:           { fontFamily: FontFamily.headlineBold, fontSize: 14, color: Colors.ink },
  certSubtitle:        { fontFamily: FontFamily.bodyRegular, fontSize: 12, color: Colors.inkMuted, lineHeight: 17 },
  ratingCardContainer: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center', gap: Spacing.xxl },
  ratingCardLeft:      { alignItems: 'center', gap: Spacing.xs, width: 100 },
  ratingCardRight:     { flex: 1, gap: Spacing.sm },
  barRow:              { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  barNum:              { fontFamily: FontFamily.bodySemiBold, fontSize: 12, color: Colors.inkMuted, width: 10 },
  barTrack:            { flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: Radius.full, overflow: 'hidden' },
  barFill:             { height: '100%', backgroundColor: Colors.primary, borderRadius: Radius.full },
  ratingBigNum:        { fontFamily: FontFamily.headlineExtraBold, fontSize: 56, color: Colors.ink, letterSpacing: -3 },
  starsRow:            { flexDirection: 'row', gap: 2 },
  ratingCardCount:     { fontFamily: FontFamily.bodyRegular, fontSize: 13, color: Colors.inkMuted },
  reviewCard:          { backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.base, gap: Spacing.xs },
  reviewCardHeader:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  reviewMeta:          { flex: 1, gap: 2 },
  starsRowRight:       { flexDirection: 'row', gap: 1 },
  reviewerName:        { fontFamily: FontFamily.bodySemiBold, fontSize: 13, color: Colors.ink },
  reviewDate:          { fontFamily: FontFamily.bodyRegular, fontSize: 11, color: Colors.border },
  reviewComment:       { fontFamily: FontFamily.bodyRegular, fontSize: 13, color: Colors.inkMuted, fontStyle: 'italic', lineHeight: 19 },
  seeAllBtn:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.md, backgroundColor: Colors.border, borderRadius: Radius.md },
  seeAllBtnLabel:      { fontFamily: FontFamily.bodySemiBold, fontSize: 13, color: Colors.primary },
  ctaWrap:             { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base, backgroundColor: Colors.surface },
  ctaBtn:              { borderRadius: Radius.lg, overflow: 'hidden' },
  ctaGradient:         { height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.lg },
  ctaLabel:            { fontFamily: FontFamily.headlineBold, fontSize: 17, color: Colors.onPrimary, letterSpacing: -0.2 },
  modalOverlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent:        { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.xs },
  modalHeader:         { alignItems: 'center', marginBottom: Spacing.md },
  modalIndicator:      { width: 38, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: Spacing.md },
  modalTitle:          { fontFamily: FontFamily.headlineBold, fontSize: 16, color: Colors.ink },
  modalOption:         { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.base },
  modalOptionPressed:  { opacity: 0.7 },
  modalOptionText:     { fontFamily: FontFamily.bodySemiBold, fontSize: 15, color: Colors.ink },
  modalOptionDestructive: { color: '#dc2626' },
  modalDivider:        { height: 1, backgroundColor: Colors.border, opacity: 0.4 },
  modalCancelBtn:      { backgroundColor: Colors.card, borderRadius: Radius.lg, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.base },
  modalCancelLabel:    { fontFamily: FontFamily.headlineBold, fontSize: 15, color: Colors.inkMuted },
});

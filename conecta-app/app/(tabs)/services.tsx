import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, GradientColors, Spacing, Radius } from '@/constants/theme';

type ServiceStatus = 'ativo' | 'rascunho';

type Service = {
  id: string;
  title: string;
  price: number;
  priceType: 'fixo' | 'a_partir_de';
  status: ServiceStatus;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  appointments?: number;
  rating?: number;
  createdAt?: string;
};

const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    title: 'Instalação de Tomadas',
    price: 80,
    priceType: 'a_partir_de',
    status: 'ativo',
    icon: 'electrical-services',
    appointments: 124,
    rating: 4.9,
  },
  {
    id: '2',
    title: 'Manutenção de AC',
    price: 150,
    priceType: 'a_partir_de',
    status: 'ativo',
    icon: 'ac-unit',
    appointments: 86,
    rating: 4.7,
  },
  {
    id: '3',
    title: 'Pintura Residencial',
    price: 0,
    priceType: 'a_partir_de',
    status: 'rascunho',
    icon: 'format-paint',
    createdAt: '12 de Outubro',
  },
];

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const activeServices = MOCK_SERVICES.filter((s) => s.status === 'ativo');
  const draftServices = MOCK_SERVICES.filter((s) => s.status === 'rascunho');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.headerIconBtn}>
            <MaterialIcons name="menu" size={24} color={Colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Meus Serviços</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.headerIconBtn}>
            <MaterialIcons name="search" size={24} color={Colors.onSurface} />
          </Pressable>
          <Pressable style={styles.headerIconBtn}>
            <MaterialIcons name="notifications" size={24} color={Colors.onSurface} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 88 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* CTA Card */}
        <Pressable
          onPress={() => router.push('/(services)/create')}
          style={({ pressed }) => pressed && { opacity: 0.92 }}
        >
          <LinearGradient
            colors={GradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaCard}
          >
            <View style={styles.ctaContent}>
              <View style={styles.ctaText}>
                <Text style={styles.ctaTitle}>Expandir Catálogo</Text>
                <Text style={styles.ctaSubtitle}>
                  Crie novos serviços e alcance mais clientes.
                </Text>
              </View>
              <View style={styles.ctaIconWrap}>
                <MaterialIcons name="add-circle" size={32} color="rgba(255,255,255,0.9)" />
              </View>
            </View>
          </LinearGradient>
        </Pressable>

        {/* Serviços Ativos */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionTitle}>Serviços Ativos</Text>
              <Text style={styles.sectionSubtitle}>Gerencie sua presença atual</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeServices.length} Ativos</Text>
            </View>
          </View>

          <View style={styles.cardList}>
            {activeServices.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.cardTopRow}>
                  <LinearGradient
                    colors={[Colors.primaryContainer, Colors.surfaceContainerHigh]}
                    style={styles.serviceThumb}
                  >
                    <MaterialIcons name={service.icon} size={26} color={Colors.primary} />
                  </LinearGradient>

                  <View style={styles.cardInfo}>
                    <View style={styles.cardInfoTop}>
                      <Text style={styles.serviceTitle} numberOfLines={1}>
                        {service.title}
                      </Text>
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>Ativo</Text>
                      </View>
                    </View>
                    <Text style={styles.servicePrice}>
                      {service.priceType === 'a_partir_de' ? 'A partir de ' : ''}
                      R$ {service.price.toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <MaterialIcons name="event-available" size={16} color={Colors.onSurfaceVariant} />
                    <View>
                      <Text style={styles.statLabel}>Agendamentos</Text>
                      <Text style={styles.statValue}>{service.appointments}</Text>
                    </View>
                  </View>
                  <View style={styles.statItem}>
                    <MaterialIcons name="star" size={16} color="#F59E0B" />
                    <View>
                      <Text style={styles.statLabel}>Nota Média</Text>
                      <Text style={styles.statValue}>{service.rating?.toFixed(1)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <Pressable
                    style={styles.viewBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/(services)/view',
                        params: { id: service.id },
                      })
                    }
                  >
                    <Text style={styles.viewBtnText}>Visualizar</Text>
                  </Pressable>
                  <Pressable
                    style={styles.editBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/(services)/edit',
                        params: { id: service.id },
                      })
                    }
                  >
                    <MaterialIcons name="edit" size={14} color={Colors.onPrimaryContainer} />
                    <Text style={styles.editBtnText}>Editar</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Rascunhos */}
        {draftServices.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View>
                <Text style={styles.sectionTitle}>Rascunhos</Text>
                <Text style={styles.sectionSubtitle}>Aguardando finalização</Text>
              </View>
              <View style={styles.draftBadge}>
                <Text style={styles.draftBadgeText}>{draftServices.length} Item</Text>
              </View>
            </View>

            {draftServices.map((service) => (
              <Pressable
                key={service.id}
                style={({ pressed }) => [styles.draftCard, pressed && { opacity: 0.75 }]}
                onPress={() =>
                  router.push({
                    pathname: '/(services)/edit',
                    params: { id: service.id },
                  })
                }
              >
                <View style={styles.draftThumb}>
                  <MaterialIcons name="image" size={26} color={Colors.outline} />
                </View>
                <View style={styles.draftInfo}>
                  <View style={styles.draftInfoTop}>
                    <Text style={styles.draftTitle}>{service.title}</Text>
                    <View style={styles.draftStatusBadge}>
                      <Text style={styles.draftStatusText}>Rascunho</Text>
                    </View>
                  </View>
                  <Text style={styles.draftDate}>Criado em {service.createdAt}</Text>
                  <View style={styles.draftContinue}>
                    <Text style={styles.draftContinueLabel}>Continuar Edição</Text>
                    <MaterialIcons name="arrow-forward" size={12} color={Colors.primary} />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 72 }]}
        onPress={() => router.push('/(services)/create')}
      >
        <LinearGradient colors={GradientColors} style={styles.fabInner}>
          <MaterialIcons name="add" size={28} color={Colors.onPrimary} />
        </LinearGradient>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    height: 56,
    backgroundColor: Colors.background,
    borderBottomColor: Colors.surfaceContainerLow,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  headerTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 20,
    letterSpacing: -0.5,
    color: Colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    gap: Spacing.xxxl,
  },

  // CTA card
  ctaCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 6,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaText: { gap: Spacing.xs, flex: 1 },
  ctaTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 22,
    color: Colors.onPrimary,
    letterSpacing: -0.5,
  },
  ctaSubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
    maxWidth: 220,
  },
  ctaIconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section
  section: { gap: Spacing.base },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 22,
    letterSpacing: -0.5,
    color: Colors.onSurface,
  },
  sectionSubtitle: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  badge: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  badgeText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 10,
    color: Colors.onPrimaryContainer,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  draftBadge: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  draftBadgeText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  cardList: { gap: Spacing.base },

  // Service card
  serviceCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    gap: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  serviceThumb: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardInfoTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  serviceTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 16,
    color: Colors.onSurface,
    letterSpacing: -0.3,
    flex: 1,
    lineHeight: 22,
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    flexShrink: 0,
  },
  activeBadgeText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 10,
    color: '#065F46',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  servicePrice: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: Colors.primary,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    lineHeight: 13,
  },
  statValue: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.onSurface,
  },

  // Card actions
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  viewBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
  },
  viewBtnText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryContainer,
  },
  editBtnText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: Colors.onPrimaryContainer,
  },

  // Draft card
  draftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant + '55',
    borderRadius: Radius.xl,
    padding: Spacing.base,
    opacity: 0.85,
  },
  draftThumb: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  draftInfo: { flex: 1, gap: 4 },
  draftInfoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  draftTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 15,
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  draftStatusBadge: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  draftStatusText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  draftDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  draftContinue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  draftContinueLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 12,
    color: Colors.primary,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

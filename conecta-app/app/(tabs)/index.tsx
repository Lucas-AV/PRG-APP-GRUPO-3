import { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, Spacing, Radius, GradientColors } from '@/constants/theme';
import { CATEGORIES } from '@/constants/categories';
import { useAuth } from '@/context/AuthContext';
import { publicServicesApi, PublicService } from '@/services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const CARD_GRADIENTS: [string, string][] = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
];

// ── Componente ────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isClient = user?.role === 'cliente';

  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const HPAD = Spacing.xl * 2;
  const GAPS = Spacing.sm * 3;
  const tileSize = (width - HPAD - GAPS) / 4;

  const fetchServices = (category?: string, q?: string) => {
    setLoading(true);
    publicServicesApi
      .list({ category: category || undefined, q: q || undefined })
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchServices(selectedCategory ?? undefined, text);
    }, 400);
  };

  const handleCategoryPress = (key: string) => {
    if (key === 'Mais') return;
    const next = selectedCategory === key ? null : key;
    setSelectedCategory(next);
    fetchServices(next ?? undefined, searchText);
  };

  const featuredProviders = useMemo(() => {
    const seen = new Set<number>();
    return services.filter(s => {
      if (seen.has(s.provider_id)) return false;
      seen.add(s.provider_id);
      return true;
    }).slice(0, 5);
  }, [services]);

  if (!isClient) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.placeholderContent}>
          <View style={styles.placeholderIcon}>
            <MaterialIcons name="home" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.placeholderTitle}>Bem-vindo ao Conecta</Text>
          <Text style={styles.placeholderSubtitle}>
            A visão inicial do prestador estará disponível em breve.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── TopAppBar ─────────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <MaterialIcons name="grid-view" size={22} color={Colors.primary} />
          <Text style={styles.topBarLogo}>Conecta</Text>
        </View>
        <View style={styles.topBarRight}>
          <Pressable style={styles.notifBtn}>
            <MaterialIcons name="notifications-none" size={24} color={Colors.onSurfaceVariant} />
          </Pressable>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.name ?? 'U')}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Saudação + Headline ───────────────────────────────────────── */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingLine}>
            Olá,{' '}
            <Text style={styles.greetingName}>
              {user?.name?.split(' ')[0] ?? 'usuário'}
            </Text>
          </Text>
          <Text style={styles.greetingHeadline}>
            Encontre o profissional perfeito
          </Text>
        </View>

        {/* ── Barra de busca ───────────────────────────────────────────── */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <View style={styles.searchIconWrap}>
              <MaterialIcons name="search" size={22} color={Colors.outline} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar serviços: limpeza, reparos..."
              placeholderTextColor={Colors.outline}
              value={searchText}
              onChangeText={handleSearchChange}
              returnKeyType="search"
            />
            <Pressable style={styles.filterBtn}>
              <MaterialIcons name="tune" size={20} color={Colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* ── Categorias Populares ──────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categorias Populares</Text>
            <Pressable>
              <Text style={styles.sectionLink}>Ver todos</Text>
            </Pressable>
          </View>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => {
              const active = selectedCategory === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  style={({ pressed }) => [
                    styles.categoryTile,
                    { width: tileSize, height: tileSize },
                    active && styles.categoryTileActive,
                    pressed && { opacity: 0.82 },
                  ]}
                  onPress={() => handleCategoryPress(cat.key)}
                >
                  <MaterialIcons
                    name={cat.icon}
                    size={30}
                    color={active ? Colors.primary : Colors.primary}
                  />
                  <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>
                    {cat.label.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : services.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialIcons name="search-off" size={40} color={Colors.outlineVariant} />
            <Text style={styles.emptyText}>Nenhum serviço encontrado.</Text>
          </View>
        ) : (
          <>
            {/* ── Profissionais em Destaque ─────────────────────────────── */}
            {featuredProviders.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Profissionais Próximos</Text>
                </View>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={featuredProviders}
                  keyExtractor={item => String(item.provider_id)}
                  contentContainerStyle={styles.carouselContent}
                  renderItem={({ item, index }) => {
                    const grad = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
                    return (
                      <Pressable
                        style={({ pressed }) => [
                          styles.providerCard,
                          pressed && { opacity: 0.88 },
                        ]}
                        onPress={() =>
                          router.push({
                            pathname: '/(client)/provider-profile' as any,
                            params: {
                              id: String(item.provider_id),
                              name: item.provider_name,
                            },
                          })
                        }
                      >
                        {/* Imagem / gradient */}
                        <View style={styles.providerImageWrap}>
                          <LinearGradient colors={grad} style={styles.providerGradient}>
                            <Text style={styles.providerCardInitials}>
                              {getInitials(item.provider_name)}
                            </Text>
                          </LinearGradient>
                          {item.avg_rating !== null && (
                            <View style={styles.ratingBadge}>
                              <MaterialIcons name="star" size={12} color="#f59e0b" />
                              <Text style={styles.ratingBadgeText}>
                                {item.avg_rating.toFixed(1)}
                              </Text>
                            </View>
                          )}
                        </View>
                        {/* Corpo */}
                        <View style={styles.providerCardBody}>
                          <Text style={styles.providerName} numberOfLines={1}>
                            {item.provider_name}
                          </Text>
                          <Text style={styles.providerService} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <View style={styles.providerDistRow}>
                            <MaterialIcons name="near-me" size={13} color={Colors.primary} />
                            <Text style={styles.providerDist}>PRÓXIMO A VOCÊ</Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  }}
                />
              </View>
            )}

            {/* ── Serviços Disponíveis ──────────────────────────────────── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Serviços Disponíveis</Text>
              </View>
              <View style={styles.serviceList}>
                {services.map(service => {
                  const cat = CATEGORIES.find(c => c.key === service.category);
                  return (
                    <Pressable
                      key={service.id}
                      style={({ pressed }) => [
                        styles.serviceCard,
                        pressed && { opacity: 0.88 },
                      ]}
                      onPress={() =>
                        router.push({
                          pathname: '/(client)/service-detail' as any,
                          params: { id: String(service.id) },
                        })
                      }
                    >
                      <View
                        style={[
                          styles.serviceIconBox,
                          { backgroundColor: cat?.color ?? Colors.surfaceContainerHighest },
                        ]}
                      >
                        <MaterialIcons
                          name={cat?.icon ?? 'home-repair-service'}
                          size={26}
                          color={Colors.onSurfaceVariant}
                        />
                      </View>

                      <View style={styles.serviceBody}>
                        <Text style={styles.serviceName} numberOfLines={1}>
                          {service.name}
                        </Text>
                        <View style={styles.serviceMeta}>
                          <Text style={styles.serviceProvider} numberOfLines={1}>
                            {service.provider_name}
                          </Text>
                          {service.avg_rating !== null && (
                            <View style={styles.ratingPill}>
                              <MaterialIcons name="star" size={10} color="#d97706" />
                              <Text style={styles.ratingPillText}>
                                {service.avg_rating.toFixed(1)}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View style={styles.serviceRight}>
                        <Text style={styles.servicePrice}>{formatPrice(service)}</Text>
                        <View style={styles.bookBtn}>
                          <Text style={styles.bookBtnText}>CONTRATAR</Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },

  // Placeholder (prestador)
  placeholderContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: Spacing.base, paddingHorizontal: Spacing.xxxl,
  },
  placeholderIcon: {
    width: 80, height: 80, borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  placeholderTitle: {
    fontFamily: FontFamily.headlineBold, fontSize: 20,
    color: Colors.onSurface, letterSpacing: -0.4,
    marginTop: Spacing.base, textAlign: 'center',
  },
  placeholderSubtitle: {
    fontFamily: FontFamily.bodyRegular, fontSize: 14,
    color: Colors.onSurfaceVariant, textAlign: 'center',
    lineHeight: 20, maxWidth: 280,
  },

  // TopAppBar
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 0,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  topBarLogo: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 22, color: Colors.primary, letterSpacing: -0.8,
  },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  notifBtn: { padding: Spacing.xs },
  avatar: {
    width: 38, height: 38, borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.primary + '1A',
  },
  avatarText: {
    fontFamily: FontFamily.headlineBold, fontSize: 13, color: Colors.primary,
  },

  scroll: { paddingBottom: Spacing.xxxl * 2 },

  // Greeting
  greetingSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
    gap: 4,
  },
  greetingLine: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14, color: Colors.onSurfaceVariant,
  },
  greetingName: { fontFamily: FontFamily.bodySemiBold, color: Colors.onSurface },
  greetingHeadline: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 28, color: Colors.onSurface,
    letterSpacing: -1,
  },

  // Search bar
  searchWrap: { paddingHorizontal: Spacing.xl, marginTop: Spacing.base, marginBottom: Spacing.xs },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radius.full,
    paddingLeft: Spacing.base,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.md - 2,
  },
  searchIconWrap: { marginRight: Spacing.sm },
  searchInput: {
    flex: 1, fontFamily: FontFamily.bodyRegular,
    fontSize: 14, color: Colors.onSurface,
  },
  filterBtn: {
    width: 38, height: 38, borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },

  // Sections
  section: { marginTop: Spacing.xxl },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18, color: Colors.onSurface, letterSpacing: -0.4,
  },
  sectionLink: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11, color: Colors.primary,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },

  // Category grid
  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl, gap: Spacing.sm,
  },
  categoryTile: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
    gap: 6,
  },
  categoryTileActive: {
    backgroundColor: Colors.primaryContainer + '4D',
  },
  categoryLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 9, color: Colors.onSurfaceVariant,
    textAlign: 'center', letterSpacing: 0.8,
  },
  categoryLabelActive: { color: Colors.primary },

  loadingWrap: { paddingVertical: Spacing.xxxl * 2, alignItems: 'center' },
  emptyWrap: {
    paddingVertical: Spacing.xxxl * 2, alignItems: 'center', gap: Spacing.md,
  },
  emptyText: {
    fontFamily: FontFamily.bodyRegular, fontSize: 14, color: Colors.onSurfaceVariant,
  },

  // Featured providers carousel
  carouselContent: { paddingHorizontal: Spacing.xl, gap: Spacing.base },
  providerCard: {
    width: 260,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8,
  },
  providerImageWrap: { height: 148, position: 'relative' },
  providerGradient: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  providerCardInitials: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 40, color: 'rgba(255,255,255,0.9)',
    letterSpacing: -1,
  },
  ratingBadge: {
    position: 'absolute', top: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.md,
  },
  ratingBadgeText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 12, color: Colors.onSurface,
  },
  providerCardBody: {
    padding: Spacing.xl, gap: 4,
  },
  providerName: {
    fontFamily: FontFamily.headlineBold, fontSize: 16, color: Colors.onSurface,
  },
  providerService: {
    fontFamily: FontFamily.bodyRegular, fontSize: 13, color: Colors.onSurfaceVariant,
  },
  providerDistRow: {
    flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4,
  },
  providerDist: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 10,
    color: Colors.primary, letterSpacing: 1.5,
  },

  // Services list
  serviceList: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  serviceCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20, padding: Spacing.base,
    gap: Spacing.base,
    elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4,
  },
  serviceIconBox: {
    width: 64, height: 64, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  serviceBody: { flex: 1, gap: 4 },
  serviceName: {
    fontFamily: FontFamily.headlineBold, fontSize: 14, color: Colors.onSurface,
  },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  serviceProvider: {
    fontFamily: FontFamily.bodyRegular, fontSize: 12, color: Colors.onSurfaceVariant,
  },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 5, paddingVertical: 2,
    borderRadius: Radius.full,
  },
  ratingPillText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10, color: '#b45309',
  },
  serviceRight: { alignItems: 'flex-end', gap: Spacing.sm, flexShrink: 0 },
  servicePrice: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 13, color: Colors.onSurface,
  },
  bookBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
  },
  bookBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 9, color: Colors.onPrimary,
    letterSpacing: 1.2,
  },
});

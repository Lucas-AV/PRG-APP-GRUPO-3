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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { CATEGORIES, Category } from '@/constants/categories';
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

// ── Componente ────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { user } = useAuth();
  const isClient = user?.role === 'cliente';

  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchServices = (category?: string, q?: string) => {
    setLoading(true);
    publicServicesApi
      .list({ category: category || undefined, q: q || undefined })
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
  }, []);

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

  const goToProvider = (service: PublicService) => {
    router.push({
      pathname: '/(client)/provider-profile' as any,
      params: { id: String(service.provider_id), name: service.provider_name },
    });
  };

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Olá, {user?.name?.split(' ')[0] ?? 'usuário'} 👋
            </Text>
            <Text style={styles.greetingSubtitle}>O que você precisa hoje?</Text>
          </View>
          <Pressable style={styles.notifBtn}>
            <MaterialIcons name="notifications-none" size={24} color={Colors.onSurface} />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={Colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar serviços: limpeza, elétrica..."
            placeholderTextColor={Colors.outline}
            value={searchText}
            onChangeText={handleSearchChange}
            returnKeyType="search"
          />
          <Pressable style={styles.filterBtn}>
            <MaterialIcons name="tune" size={20} color={Colors.primary} />
          </Pressable>
        </View>

        {/* Categorias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => {
              const active = selectedCategory === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  style={styles.categoryItem}
                  onPress={() => handleCategoryPress(cat.key)}
                >
                  <View style={[
                    styles.categoryIcon,
                    { backgroundColor: active ? Colors.primaryContainer : cat.color },
                    active && styles.categoryIconActive,
                  ]}>
                    <MaterialIcons
                      name={cat.icon}
                      size={22}
                      color={active ? Colors.primary : Colors.onSurfaceVariant}
                    />
                  </View>
                  <Text style={[
                    styles.categoryLabel,
                    active && styles.categoryLabelActive,
                  ]}>
                    {cat.label}
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
            {/* Profissionais em Destaque */}
            {featuredProviders.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profissionais em Destaque</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={featuredProviders}
                  keyExtractor={item => String(item.provider_id)}
                  contentContainerStyle={styles.carouselContent}
                  renderItem={({ item }) => (
                    <Pressable
                      style={({ pressed }) => [styles.providerCard, pressed && { opacity: 0.88 }]}
                      onPress={() => goToProvider(item)}
                    >
                      <View style={styles.providerAvatar}>
                        <Text style={styles.providerInitials}>
                          {getInitials(item.provider_name)}
                        </Text>
                      </View>
                      <Text style={styles.providerName} numberOfLines={1}>
                        {item.provider_name}
                      </Text>
                      <Text style={styles.providerService} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.providerMeta}>
                        {item.avg_rating !== null ? (
                          <>
                            <MaterialIcons name="star" size={12} color="#fbbf24" />
                            <Text style={styles.providerRating}>
                              {item.avg_rating.toFixed(1)}
                            </Text>
                          </>
                        ) : (
                          <Text style={styles.providerRating}>Novo</Text>
                        )}
                        <Text style={styles.providerPrice}> · {formatPrice(item)}</Text>
                      </View>
                    </Pressable>
                  )}
                />
              </View>
            )}

            {/* Serviços Disponíveis */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Serviços Disponíveis</Text>
              <View style={styles.serviceList}>
                {services.map(service => {
                  const cat = CATEGORIES.find(c => c.key === service.category);
                  return (
                    <Pressable
                      key={service.id}
                      style={({ pressed }) => [styles.serviceCard, pressed && { opacity: 0.88 }]}
                      onPress={() => goToProvider(service)}
                    >
                      <View style={[
                        styles.serviceIcon,
                        { backgroundColor: cat?.color ?? Colors.surfaceContainerHighest },
                      ]}>
                        <MaterialIcons
                          name={cat?.icon ?? 'home-repair-service'}
                          size={22}
                          color={Colors.onSurfaceVariant}
                        />
                      </View>
                      <View style={styles.serviceBody}>
                        <Text style={styles.serviceName} numberOfLines={1}>
                          {service.name}
                        </Text>
                        <Text style={styles.serviceProvider} numberOfLines={1}>
                          {service.provider_name}
                        </Text>
                        <View style={styles.serviceMeta}>
                          {service.avg_rating !== null ? (
                            <>
                              <MaterialIcons name="star" size={11} color="#fbbf24" />
                              <Text style={styles.serviceRating}>
                                {service.avg_rating.toFixed(1)}
                              </Text>
                              <Text style={styles.serviceReviews}>
                                ({service.review_count})
                              </Text>
                            </>
                          ) : (
                            <Text style={styles.serviceRating}>Novo</Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.serviceRight}>
                        <Text style={styles.servicePrice}>{formatPrice(service)}</Text>
                        <View style={styles.verBtn}>
                          <Text style={styles.verBtnText}>Ver</Text>
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
  scroll: { paddingBottom: Spacing.xxxl * 2 },

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

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  greeting: {
    fontFamily: FontFamily.headlineBold, fontSize: 22,
    color: Colors.onSurface, letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontFamily: FontFamily.bodyRegular, fontSize: 13,
    color: Colors.onSurfaceVariant, marginTop: 2,
  },
  notifBtn: { padding: Spacing.sm },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
    elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4,
  },
  searchInput: {
    flex: 1, fontFamily: FontFamily.bodyRegular, fontSize: 14,
    color: Colors.onSurface,
  },
  filterBtn: { padding: Spacing.xs },

  section: { marginTop: Spacing.xl },
  sectionTitle: {
    fontFamily: FontFamily.headlineSemiBold, fontSize: 16,
    color: Colors.onSurface, letterSpacing: -0.3,
    paddingHorizontal: Spacing.xl, marginBottom: Spacing.md,
  },

  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl, gap: Spacing.md,
  },
  categoryItem: {
    width: '21%', alignItems: 'center', gap: Spacing.xs,
  },
  categoryIcon: {
    width: 52, height: 52, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  categoryIconActive: {
    borderWidth: 1.5, borderColor: Colors.primary + '40',
  },
  categoryLabel: {
    fontFamily: FontFamily.bodyMedium, fontSize: 10,
    color: Colors.onSurfaceVariant, textAlign: 'center',
  },
  categoryLabelActive: {
    fontFamily: FontFamily.bodySemiBold, color: Colors.primary,
  },

  loadingWrap: { paddingVertical: Spacing.xxxl * 2, alignItems: 'center' },
  emptyWrap: {
    paddingVertical: Spacing.xxxl * 2, alignItems: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    fontFamily: FontFamily.bodyRegular, fontSize: 14,
    color: Colors.onSurfaceVariant,
  },

  carouselContent: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  providerCard: {
    width: 160, backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg, padding: Spacing.base,
    gap: Spacing.xs, elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4,
  },
  providerAvatar: {
    width: 48, height: 48, borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  providerInitials: {
    fontFamily: FontFamily.headlineBold, fontSize: 16, color: Colors.primary,
  },
  providerName: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 13, color: Colors.onSurface,
  },
  providerService: {
    fontFamily: FontFamily.bodyRegular, fontSize: 11, color: Colors.onSurfaceVariant,
  },
  providerMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  providerRating: {
    fontFamily: FontFamily.bodyMedium, fontSize: 11, color: Colors.onSurfaceVariant,
    marginLeft: 2,
  },
  providerPrice: {
    fontFamily: FontFamily.bodyMedium, fontSize: 11, color: Colors.primary,
  },

  serviceList: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  serviceCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md, padding: Spacing.base,
    gap: Spacing.md, elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4,
  },
  serviceIcon: {
    width: 44, height: 44, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  serviceBody: { flex: 1, gap: 2 },
  serviceName: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 13, color: Colors.onSurface,
  },
  serviceProvider: {
    fontFamily: FontFamily.bodyRegular, fontSize: 11, color: Colors.onSurfaceVariant,
  },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  serviceRating: {
    fontFamily: FontFamily.bodyMedium, fontSize: 11, color: Colors.onSurfaceVariant,
    marginLeft: 1,
  },
  serviceReviews: {
    fontFamily: FontFamily.bodyRegular, fontSize: 11, color: Colors.outlineVariant,
  },
  serviceRight: { alignItems: 'flex-end', gap: Spacing.xs },
  servicePrice: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 12, color: Colors.primary,
  },
  verBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  verBtnText: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 11, color: Colors.primary,
  },
});

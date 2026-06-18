import { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { CATEGORIES } from '@/constants/categories';
import { publicServicesApi, PublicService } from '@/services/api';
import { AvatarInitials } from '@/components/ui/avatar-initials';

// ── Componente de Busca ────────────────────────────────────────────────────────
export default function SearchScreen() {
  const { width } = useWindowDimensions();
  const searchInputRef = useRef<TextInput>(null);

  // Filtros vindos da tela de Filtros via search params
  const params = useLocalSearchParams<{
    q?: string;
    sortBy?: string;
    distance?: string;
    rating?: string;
    priceRange?: string;
    category?: string;
    applied?: string;
  }>();

  // Estados locais
  const [searchText, setSearchText] = useState(params.q ?? '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(params.category ?? null);
  const [history, setHistory] = useState<string[]>([]);
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(false);
  const [featured, setFeatured] = useState<PublicService[]>([]);

  // Carregar top-rated services para a seção de destaque
  useEffect(() => {
    publicServicesApi.list().then(all => {
      const top = [...all]
        .filter(s => s.avg_rating != null)
        .sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0))
        .slice(0, 3);
      setFeatured(top);
    }).catch(() => {});
  }, []);

  // Carregar histórico inicial
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem('@recent_searches');
        if (stored) {
          setHistory(JSON.parse(stored));
        } else {
          setHistory(['Eletricista', 'Limpeza pesada', 'Jane Doe']);
        }
      } catch {
        setHistory(['Eletricista', 'Limpeza pesada', 'Jane Doe']);
      }
    };
    loadHistory();
  }, []);

  // Sincronizar parâmetros de filtros quando retornados
  useEffect(() => {
    if (params.q !== undefined) {
      setSearchText(params.q);
    }
    if (params.category !== undefined) {
      setSelectedCategory(params.category || null);
    }
  }, [params.q, params.category]);

  // Disparar busca ao mudar termo ou categoria
  useEffect(() => {
    fetchResults();
  }, [searchText, selectedCategory]);

  const fetchResults = () => {
    setLoading(true);
    publicServicesApi
      .list({
        q: searchText || undefined,
        category: selectedCategory || undefined,
      })
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  };

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      saveSearch(searchText.trim());
    }
    fetchResults();
  };

  const saveSearch = async (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const nextHistory = [
      clean,
      ...history.filter(h => h.toLowerCase() !== clean.toLowerCase()),
    ].slice(0, 5);
    setHistory(nextHistory);
    try {
      await AsyncStorage.setItem('@recent_searches', JSON.stringify(nextHistory));
    } catch {}
  };

  const removeHistoryItem = async (index: number) => {
    const nextHistory = history.filter((_, i) => i !== index);
    setHistory(nextHistory);
    try {
      await AsyncStorage.setItem('@recent_searches', JSON.stringify(nextHistory));
    } catch {}
  };

  const clearHistory = async () => {
    setHistory([]);
    try {
      await AsyncStorage.setItem('@recent_searches', JSON.stringify([]));
    } catch {}
  };

  const handleCategoryPress = (key: string) => {
    const next = selectedCategory === key ? null : key;
    setSelectedCategory(next);
  };

  const handleHistoryPress = (term: string) => {
    setSearchText(term);
    saveSearch(term);
  };

  // Filtragem e Ordenação Local baseada nos parâmetros do filtro
  const filteredServices = useMemo(() => {
    let result = [...services];

    // Filtro por Avaliação
    if (params.rating === '4.5+') {
      result = result.filter(s => (s.avg_rating ?? 0) >= 4.5);
    } else if (params.rating === '4.0+') {
      result = result.filter(s => (s.avg_rating ?? 0) >= 4.0);
    }

    // Filtro por Preço
    if (params.priceRange) {
      result = result.filter(s => {
        const price = s.price ?? 0;
        if (params.priceRange === 'R$') return price <= 50;
        if (params.priceRange === 'R$$') return price > 50 && price <= 150;
        if (params.priceRange === 'R$$$') return price > 150 && price <= 300;
        if (params.priceRange === 'R$$$$') return price > 300;
        return true;
      });
    }

    // Ordenação (Sort By)
    if (params.sortBy === 'Avaliação') {
      result.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0));
    } else if (params.sortBy === 'Preço') {
      result.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    } else if (params.sortBy === 'Distância') {
      // Mock de ordenação por distância utilizando provider_id
      result.sort((a, b) => a.provider_id - b.provider_id);
    }

    return result;
  }, [services, params.sortBy, params.rating, params.priceRange]);

  const hasSearch = searchText.trim().length > 0 || selectedCategory !== null;

  // Layout grid de categorias do template
  const tileWidth = (width - Spacing.xl * 2 - Spacing.sm * 3) / 4;

  const formatPrice = (service: PublicService): string => {
    if (!service.price) return 'Sob consulta';
    const prefix = service.price_type === 'a_partir_de' ? 'A partir de ' : '';
    return `${prefix}R$ ${service.price.toFixed(2).replace('.', ',')}`;
  };

  const hasAnyActiveFilter = params.applied === 'true' || selectedCategory !== null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── TopAppBar ──────────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.ink} />
          </Pressable>
          <Text style={styles.topBarLogo}>SevGen</Text>
        </View>
        <Pressable style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}>
          <MaterialIcons name="more-vert" size={24} color={Colors.secondary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Barra de Busca com Botão de Filtro ───────────────────────────── */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={22} color={Colors.inkMuted} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Busque serviços, profissionais ou setores"
              placeholderTextColor={Colors.inkMuted}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => setSearchText('')} style={{ marginRight: 8 }}>
                <MaterialIcons name="clear" size={18} color={Colors.inkMuted} />
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.filterBtn,
                params.applied === 'true' && styles.filterBtnActive,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() =>
                router.push({
                  pathname: '/(client)/filter',
                  params: {
                    source: 'search',
                    q: searchText,
                    category: selectedCategory ?? '',
                    sortBy: params.sortBy ?? '',
                    distance: params.distance ?? '',
                    rating: params.rating ?? '',
                    priceRange: params.priceRange ?? '',
                  },
                })
              }
            >
              <MaterialIcons
                name="tune"
                size={20}
                color={params.applied === 'true' ? Colors.onPrimary : Colors.primary}
              />
            </Pressable>
          </View>
        </View>

        {/* ── Indicador de Filtros Ativos ───────────────────────────────────── */}
        {hasAnyActiveFilter && (
          <View style={styles.activeFiltersRow}>
            <Text style={styles.activeFiltersTitle}>Filtros ativos:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, alignItems: 'center' }}>
              {selectedCategory && (
                <Pressable
                  onPress={() => setSelectedCategory(null)}
                  style={styles.activeFilterChip}
                >
                  <Text style={styles.activeFilterText}>Categoria: {selectedCategory}</Text>
                  <MaterialIcons name="close" size={12} color={Colors.primary} />
                </Pressable>
              )}
              {params.sortBy && (
                <Pressable
                  onPress={() =>
                    router.setParams({
                      sortBy: undefined,
                      applied: (params.rating || params.priceRange || params.distance) ? 'true' : undefined
                    })
                  }
                  style={styles.activeFilterChip}
                >
                  <Text style={styles.activeFilterText}>Ordenar: {params.sortBy}</Text>
                  <MaterialIcons name="close" size={12} color={Colors.primary} />
                </Pressable>
              )}
              {params.rating && (
                <Pressable
                  onPress={() =>
                    router.setParams({
                      rating: undefined,
                      applied: (params.sortBy || params.priceRange || params.distance) ? 'true' : undefined
                    })
                  }
                  style={styles.activeFilterChip}
                >
                  <Text style={styles.activeFilterText}>Avaliação: {params.rating}</Text>
                  <MaterialIcons name="close" size={12} color={Colors.primary} />
                </Pressable>
              )}
              {params.priceRange && (
                <Pressable
                  onPress={() =>
                    router.setParams({
                      priceRange: undefined,
                      applied: (params.sortBy || params.rating || params.distance) ? 'true' : undefined
                    })
                  }
                  style={styles.activeFilterChip}
                >
                  <Text style={styles.activeFilterText}>Preço: {params.priceRange}</Text>
                  <MaterialIcons name="close" size={12} color={Colors.primary} />
                </Pressable>
              )}
              {params.distance && (
                <Pressable
                  onPress={() =>
                    router.setParams({
                      distance: undefined,
                      applied: (params.sortBy || params.rating || params.priceRange) ? 'true' : undefined
                    })
                  }
                  style={styles.activeFilterChip}
                >
                  <Text style={styles.activeFilterText}>Distância: {params.distance}km</Text>
                  <MaterialIcons name="close" size={12} color={Colors.primary} />
                </Pressable>
              )}
              <Pressable
                onPress={() => {
                  setSelectedCategory(null);
                  router.setParams({
                    sortBy: undefined,
                    distance: undefined,
                    rating: undefined,
                    priceRange: undefined,
                    applied: undefined,
                  });
                }}
                style={styles.clearFiltersChip}
              >
                <Text style={styles.clearFiltersText}>Limpar Tudo</Text>
              </Pressable>
            </ScrollView>
          </View>
        )}

        {!hasSearch ? (
          <>
            {/* ── Histórico (Buscas Recentes) ────────────────────────────────── */}
            {history.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Buscas Recentes</Text>
                  <Pressable onPress={clearHistory}>
                    <Text style={styles.sectionLink}>Limpar</Text>
                  </Pressable>
                </View>
                <View style={styles.historyList}>
                  {history.map((term, index) => (
                    <View key={index} style={styles.historyItem}>
                      <Pressable
                        style={styles.historyItemPress}
                        onPress={() => handleHistoryPress(term)}
                      >
                        <MaterialIcons name="history" size={20} color={Colors.border} style={{ marginRight: Spacing.md }} />
                        <Text style={styles.historyItemText}>{term}</Text>
                      </Pressable>
                      <Pressable onPress={() => removeHistoryItem(index)} style={styles.historyCloseBtn}>
                        <MaterialIcons name="close" size={16} color={Colors.inkMuted} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ── Categorias Populares do Template ──────────────────────────── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitleWithoutLink}>Navegue por Categorias</Text>
              <View style={styles.categoryGrid}>
                {/* 1. Reformas (home_repair_service) */}
                <Pressable
                  style={({ pressed }) => [
                    styles.categoryTile,
                    { width: tileWidth, height: tileWidth },
                    selectedCategory === 'Reformas' && styles.categoryTileActive,
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={() => handleCategoryPress('Reformas')}
                >
                  <View style={[styles.categoryIconBox, { backgroundColor: Colors.brand + '15' }]}>
                    <MaterialIcons name="construction" size={24} color={Colors.primary} />
                  </View>
                  <Text style={styles.categoryLabel}>REFORMAS</Text>
                </Pressable>

                {/* 2. Bem-estar (self_improvement) */}
                <Pressable
                  style={({ pressed }) => [
                    styles.categoryTile,
                    { width: tileWidth, height: tileWidth },
                    selectedCategory === 'Elétrica' && styles.categoryTileActive, // Mapeamos Elétrica
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={() => handleCategoryPress('Elétrica')}
                >
                  <View style={[styles.categoryIconBox, { backgroundColor: Colors.tertiaryContainer }]}>
                    <MaterialIcons name="self-improvement" size={24} color={Colors.onTertiaryContainer} />
                  </View>
                  <Text style={styles.categoryLabel}>BEM-ESTAR</Text>
                </Pressable>

                {/* 3. Aulas (school) */}
                <Pressable
                  style={({ pressed }) => [
                    styles.categoryTile,
                    { width: tileWidth, height: tileWidth },
                    selectedCategory === 'Aulas' && styles.categoryTileActive,
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={() => handleCategoryPress('Aulas')}
                >
                  <View style={[styles.categoryIconBox, { backgroundColor: Colors.brand + '15' }]}>
                    <MaterialIcons name="school" size={24} color={Colors.onSecondaryContainer} />
                  </View>
                  <Text style={styles.categoryLabel}>AULAS</Text>
                </Pressable>

                {/* 4. Tecnologia (memory) */}
                <Pressable
                  style={({ pressed }) => [
                    styles.categoryTile,
                    { width: tileWidth, height: tileWidth },
                    selectedCategory === 'Climatização' && styles.categoryTileActive, // Mapeamos Climatização
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={() => handleCategoryPress('Climatização')}
                >
                  <View style={[styles.categoryIconBox, { backgroundColor: Colors.brand + '15', opacity: 0.8 }]}>
                    <MaterialIcons name="memory" size={24} color={Colors.primary} />
                  </View>
                  <Text style={styles.categoryLabel}>TECNOLOGIA</Text>
                </Pressable>
              </View>
            </View>

            {/* ── Profissionais em Destaque ──────────────────────────────────── */}
            {featured.length > 0 && (
              <View style={styles.suggestionsSection}>
                <Text style={styles.suggestionsTitle}>Profissionais em Destaque</Text>
                {featured.map(svc => (
                  <Pressable
                    key={svc.id}
                    style={({ pressed }) => [styles.suggestionItem, pressed && { opacity: 0.8 }]}
                    onPress={() => router.push({ pathname: '/(client)/service-detail' as any, params: { id: String(svc.id) } })}
                  >
                    <AvatarInitials
                      initials={svc.provider_name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')}
                      size="md"
                    />
                    <View style={styles.suggestionInfo}>
                      <Text style={styles.suggestionName} numberOfLines={1}>{svc.provider_name}</Text>
                      <Text style={styles.suggestionSpecialty} numberOfLines={1}>{svc.name}</Text>
                    </View>
                    {svc.avg_rating != null && (
                      <View style={styles.suggestionRating}>
                        <MaterialIcons name="star" size={14} color="#f59e0b" />
                        <Text style={styles.suggestionRatingText}>{svc.avg_rating.toFixed(1)}</Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </>
        ) : (
          /* ── Resultados de Busca ────────────────────────────────────────── */
          <View style={styles.resultsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {loading ? 'Pesquisando...' : `Resultados (${filteredServices.length})`}
              </Text>
            </View>

            {loading ? (
              <View style={styles.loaderWrap}>
                <ActivityIndicator color={Colors.primary} size="large" />
              </View>
            ) : filteredServices.length === 0 ? (
              <View style={styles.emptyWrap}>
                <MaterialIcons name="search-off" size={48} color={Colors.border} />
                <Text style={styles.emptyText}>Nenhum serviço ou prestador encontrado.</Text>
                <Text style={styles.emptySubtitle}>
                  Tente ajustar os termos da busca ou limpar os filtros ativos.
                </Text>
              </View>
            ) : (
              <View style={styles.resultsList}>
                {filteredServices.map(service => {
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
                          { backgroundColor: cat?.color ?? Colors.border },
                        ]}
                      >
                        <MaterialIcons
                          name={cat?.icon ?? 'home-repair-service'}
                          size={26}
                          color={Colors.inkMuted}
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
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  topBarLogo: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 22,
    color: Colors.primary,
    letterSpacing: -0.8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPressed: {
    backgroundColor: Colors.card,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  searchSection: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    paddingLeft: Spacing.base,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.md - 2,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.ink,
    paddingVertical: 4,
  },
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  activeFiltersTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.brand + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  activeFilterText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
    color: Colors.primary,
  },
  clearFiltersChip: {
    backgroundColor: Colors.errorContainer + '40',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  clearFiltersText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
    color: Colors.error,
  },
  section: {
    marginTop: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.ink,
    letterSpacing: -0.4,
  },
  sectionTitleWithoutLink: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.ink,
    letterSpacing: -0.4,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionLink: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.primary,
  },
  historyList: {
    paddingHorizontal: Spacing.xl,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  historyItemPress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyItemText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  historyCloseBtn: {
    padding: Spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  categoryTile: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    shadowColor: 'rgba(0,0,0,0.02)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  categoryTileActive: {
    backgroundColor: Colors.brand + '15',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  categoryIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.ink,
    letterSpacing: 0.8,
  },
  suggestionsSection: { paddingHorizontal: Spacing.xl, gap: Spacing.md, marginTop: Spacing.xl },
  suggestionsTitle: { fontFamily: FontFamily.headlineBold, fontSize: 17, color: Colors.ink, letterSpacing: -0.3, marginBottom: Spacing.xs },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.base },
  suggestionInfo: { flex: 1, gap: 2 },
  suggestionName: { fontFamily: FontFamily.headlineBold, fontSize: 14, color: Colors.ink },
  suggestionSpecialty: { fontFamily: FontFamily.bodyRegular, fontSize: 12, color: Colors.inkMuted },
  suggestionRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  suggestionRatingText: { fontFamily: FontFamily.headlineBold, fontSize: 13, color: Colors.ink },
  resultsSection: {
    marginTop: Spacing.md,
  },
  loaderWrap: {
    paddingVertical: Spacing.xxxl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    paddingVertical: Spacing.xxxl * 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 16,
    color: Colors.ink,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
  resultsList: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: Spacing.base,
    gap: Spacing.base,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  serviceIconBox: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  serviceBody: {
    flex: 1,
    gap: 4,
  },
  serviceName: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.ink,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  serviceProvider: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  ratingPillText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: '#b45309',
  },
  serviceRight: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
    flexShrink: 0,
  },
  servicePrice: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 13,
    color: Colors.ink,
  },
  bookBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  bookBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.onPrimary,
    letterSpacing: 1.2,
  },
});

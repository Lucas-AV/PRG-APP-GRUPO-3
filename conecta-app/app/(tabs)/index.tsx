import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
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
import { Colors, FontFamily, Spacing, Radius, GradientColors } from '@/constants/theme';
import { CATEGORIES } from '@/constants/categories';
import { useAuth } from '@/context/AuthContext';
import {
  publicServicesApi, PublicService,
  appointmentsApi, Appointment,
  servicesApi, Service,
} from '@/services/api';
import { useTranslation } from 'react-i18next';
import { AvatarInitials } from '@/components/ui/avatar-initials';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(service: PublicService): string {
  if (!service.price) return 'Sob consulta';
  const prefix = service.price_type === 'a_partir_de' ? 'A partir de ' : '';
  return `${prefix}R$ ${service.price.toFixed(2).replace('.', ',')}`;
}

const PROVIDER_IMAGES: string[] = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDDYvz5DNWYKumUPqcHbsPW4oXDpyN1aawLRcHRWXFnuOg5IbdH_QwkwLBxdOAhh0GFR_iPArXrcN8FuD4YOTgAeTGDs-nA5PqLbrAnlI2WyVgvMTPkxWGMdA8AH1fkRh_5LJGI1T7jMSYhSaL8iHhLp2Ok5C5FToGPJZhYiHzgrL22wHUQJGUqTK8Z9Hx-xUHZJld_BFkBnM7Sf5tNlW-6AiozFaA7sCEv5QC5HI0dH82oVk2SVxf8NeMJjtrq1UNEqLqWaZlevTQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBdsI7AlRE5Y8UVf7NA4Y7MfRVlL6yrakbEXSHbtAe2NABe8NHpHos6BpYPvQmw68PequalsJ4b-c4v13-3Esc9awoEK4qFLhzidjdiqUUjUWFJThaDKPlunxSFFlW8PKwP0BnFuuxd8Le8HZDBPePA-ldtlc0bZm61cMj6k40b8N1LeHfi3ZAp02k3bxKTvU3mteNZHseJmnRkwrTcnDYiAldeI4yzR33uLMVW6_iSoUFqIj-V8PsHdsENtwG4HeePPKseNMbUqsM',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDl6nnS_1yci62TCyJKWdDJpTGso1WVbB7SWS1dFycbQNVK5VKGbo0KBHPdjVNy5WW_hAwlevHZC2Jt65vNkzznm4XRfsrzC4tN34SaMywsGDXjI89hizixuHhSRavg0MLl0kc0eDEMSFwlhXwrbiL_bgS_jeXETbmplm2OaP6v_-8AN-T7N9zl81nantEZUNLGjh-mW9Os3nlPAqyMjkJKmr0OVdGPoq1uIH-bGAriAi8INsKdO4sZkyfQFOArpBJqh04oPU6xaK4',
];

const QUICK_FILTERS = [
  { key: 'todos',   label: 'Todos',            icon: 'grid-view'    as const },
  { key: 'rating',  label: 'Melhor Avaliados', icon: 'star'         as const },
  { key: 'preco',   label: 'Menor Preço',      icon: 'attach-money' as const },
  { key: 'proximos',label: 'Mais Próximos',    icon: 'near-me'      as const },
];

// ── Provider Dashboard ────────────────────────────────────────────────────────

function ProviderHomeScreen() {
  const { user, token } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'prestador';
  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : 'P';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([appointmentsApi.list(token), servicesApi.list(token)])
      .then(([appts, svcs]) => { setAppointments(appts); setServices(svcs); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const today = new Date().toISOString().split('T')[0];

  const todayCount = appointments.filter(
    a => a.scheduled_date === today && a.status === 'confirmado'
  ).length;

  const activeServices = services.filter(s => s.status === 'ativo');

  const totalRevenue = appointments
    .filter(a => a.status === 'concluido')
    .reduce((sum, a) => sum + a.total_price, 0);

  const upcomingAppts = appointments
    .filter(a => a.status === 'confirmado')
    .sort((a, b) => {
      const da = new Date(`${a.scheduled_date}T${a.scheduled_time}`).getTime();
      const db = new Date(`${b.scheduled_date}T${b.scheduled_time}`).getTime();
      return da - db;
    })
    .slice(0, 5);

  const formatApptDate = (date: string, time: string) => {
    const d = new Date(`${date}T${time}`);
    const isToday = date === today;
    const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Hoje, ${timeStr}`;
    return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}, ${timeStr}`;
  };

  return (
    <SafeAreaView style={pStyles.container} edges={['top']}>
      {/* Header */}
      <View style={pStyles.header}>
        <View style={pStyles.headerTop}>
          <View>
            <Text style={pStyles.greetingSmall}>Olá, <Text style={pStyles.greetingBold}>{firstName} 👋</Text></Text>
            <Text style={pStyles.headerBrand}>Conecta</Text>
          </View>
          <View style={pStyles.headerActions}>
            <Pressable
              style={pStyles.notifBtn}
              onPress={() => router.push('/(account)/notifications' as any)}
            >
              <MaterialIcons name="notifications-none" size={24} color={Colors.onSurfaceVariant} />
              {appointments.some(a => a.scheduled_date === today && a.status === 'confirmado') && (
                <View style={pStyles.notifDot} />
              )}
            </Pressable>
            <Pressable
              style={pStyles.avatarCircle}
              onPress={() => router.push('/(account)/edit-profile' as any)}
            >
              <Text style={pStyles.avatarInitials}>{initials}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={pStyles.loadingWrap}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={pStyles.scroll}>

          {/* Stats row */}
          <View style={pStyles.statsRow}>
            <View style={[pStyles.statCard, { backgroundColor: Colors.primaryContainer }]}>
              <MaterialIcons name="today" size={22} color={Colors.primary} />
              <Text style={pStyles.statValue}>{todayCount}</Text>
              <Text style={pStyles.statLabel}>Hoje</Text>
            </View>
            <View style={[pStyles.statCard, { backgroundColor: Colors.secondaryContainer }]}>
              <MaterialIcons name="home-repair-service" size={22} color={Colors.secondary} />
              <Text style={pStyles.statValue}>{activeServices.length}</Text>
              <Text style={pStyles.statLabel}>Serviços ativos</Text>
            </View>
            <View style={[pStyles.statCard, { backgroundColor: Colors.tertiaryContainer }]}>
              <MaterialIcons name="attach-money" size={22} color={Colors.tertiary} />
              <Text style={pStyles.statValue}>
                {totalRevenue > 0 ? `R$ ${totalRevenue.toFixed(0)}` : '—'}
              </Text>
              <Text style={pStyles.statLabel}>Receita total</Text>
            </View>
          </View>

          {/* Quick actions */}
          <View style={pStyles.section}>
            <Text style={pStyles.sectionTitle}>Ações rápidas</Text>
            <View style={pStyles.quickActions}>
              {[
                { icon: 'build' as const, label: 'Meus Serviços', path: '/(services)/create' as any },
                { icon: 'event-available' as const, label: 'Disponibilidade', path: '/(account)/edit-profile' as any },
                { icon: 'bar-chart' as const, label: 'Desempenho', path: '/(services)/view' as any },
                { icon: 'star-border' as const, label: 'Avaliações', path: '/(account)/payments' as any },
              ].map(action => (
                <Pressable
                  key={action.label}
                  style={({ pressed }) => [pStyles.quickAction, pressed && { opacity: 0.7 }]}
                  onPress={() => router.push(action.path)}
                >
                  <View style={pStyles.quickActionIcon}>
                    <MaterialIcons name={action.icon} size={22} color={Colors.primary} />
                  </View>
                  <Text style={pStyles.quickActionLabel}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Upcoming appointments */}
          <View style={pStyles.section}>
            <View style={pStyles.sectionHeader}>
              <Text style={pStyles.sectionTitle}>Próximos agendamentos</Text>
              <Pressable onPress={() => router.push('/(tabs)/schedule' as any)}>
                <Text style={pStyles.sectionLink}>VER TODOS</Text>
              </Pressable>
            </View>
            {upcomingAppts.length === 0 ? (
              <View style={pStyles.emptyBox}>
                <MaterialIcons name="event-busy" size={32} color={Colors.outlineVariant} />
                <Text style={pStyles.emptyText}>Nenhum agendamento pendente</Text>
              </View>
            ) : (
              <View style={pStyles.apptList}>
                {upcomingAppts.map(appt => (
                  <Pressable
                    key={appt.id}
                    style={({ pressed }) => [pStyles.apptCard, pressed && { opacity: 0.85 }]}
                    onPress={() =>
                      router.push({
                        pathname: '/(scheduling)/appointment-detail' as any,
                        params: { id: String(appt.id) },
                      })
                    }
                  >
                    <View style={pStyles.apptIconBox}>
                      <MaterialIcons name="person" size={20} color={Colors.primary} />
                    </View>
                    <View style={pStyles.apptBody}>
                      <Text style={pStyles.apptClient} numberOfLines={1}>{appt.client_name}</Text>
                      <Text style={pStyles.apptService} numberOfLines={1}>{appt.service_name}</Text>
                    </View>
                    <View style={pStyles.apptRight}>
                      <Text style={pStyles.apptTime}>{formatApptDate(appt.scheduled_date, appt.scheduled_time)}</Text>
                      <Text style={pStyles.apptPrice}>R$ {appt.total_price.toFixed(2).replace('.', ',')}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Active services */}
          <View style={pStyles.section}>
            <View style={pStyles.sectionHeader}>
              <Text style={pStyles.sectionTitle}>Meus serviços</Text>
              <Pressable onPress={() => router.push('/(services)/create' as any)}>
                <Text style={pStyles.sectionLink}>ADICIONAR</Text>
              </Pressable>
            </View>
            {activeServices.length === 0 ? (
              <View style={pStyles.emptyBox}>
                <MaterialIcons name="add-business" size={32} color={Colors.outlineVariant} />
                <Text style={pStyles.emptyText}>Nenhum serviço ativo. Crie o primeiro!</Text>
              </View>
            ) : (
              <View style={pStyles.serviceGrid}>
                {activeServices.slice(0, 4).map(svc => (
                  <Pressable
                    key={svc.id}
                    style={({ pressed }) => [pStyles.serviceChip, pressed && { opacity: 0.75 }]}
                    onPress={() =>
                      router.push({
                        pathname: '/(services)/view' as any,
                        params: { id: String(svc.id) },
                      })
                    }
                  >
                    <MaterialIcons name="home-repair-service" size={16} color={Colors.primary} />
                    <Text style={pStyles.serviceChipLabel} numberOfLines={1}>{svc.name}</Text>
                    {svc.price != null && (
                      <Text style={pStyles.serviceChipPrice}>
                        R$ {svc.price.toFixed(0)}
                      </Text>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const pStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: Spacing.xxxl * 2 },

  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingSmall: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  greetingBold: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurface,
  },
  headerBrand: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 24,
    color: Colors.primary,
    letterSpacing: -0.8,
    marginTop: -2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary + '33',
  },
  avatarInitials: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 15,
    color: Colors.primary,
    letterSpacing: -0.5,
  },

  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.md,
    padding: Spacing.base,
    gap: Spacing.xs,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 20,
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },

  section: { paddingHorizontal: Spacing.xl, marginTop: Spacing.xxl, gap: Spacing.base },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 17,
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  sectionLink: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 1.5,
  },

  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    gap: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  emptyBox: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    paddingVertical: Spacing.xxxl,
    alignItems: 'center',
    gap: Spacing.base,
  },
  emptyText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },

  apptList: { gap: Spacing.sm },
  apptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  apptIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  apptBody: { flex: 1, gap: 2 },
  apptClient: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  apptService: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  apptRight: { alignItems: 'flex-end', gap: 2 },
  apptTime: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.primary,
  },
  apptPrice: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: Colors.onSurface,
  },

  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '44',
    maxWidth: '48%',
  },
  serviceChipLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.onSurface,
    flex: 1,
  },
  serviceChipPrice: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 12,
    color: Colors.primary,
  },
});

// ── Componente ────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isClient = user?.role === 'cliente';

  const params = useLocalSearchParams<{
    sortBy?: string; distance?: string; rating?: string;
    priceRange?: string; category?: string; applied?: string; q?: string;
  }>();

  const [services, setServices]           = useState<PublicService[]>([]);
  const [loading, setLoading]             = useState(true);
  const [searchText, setSearchText]       = useState(params.q ?? '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(params.category ?? null);
  const [activeFilter, setActiveFilter]   = useState<string>('todos');

  // Grid tile size — 4 per row
  const HPAD = Spacing.xl * 2;
  const tileSize = (width - HPAD - Spacing.sm * 3) / 4;

  const fetchServices = (category?: string, q?: string) => {
    setLoading(true);
    publicServicesApi
      .list({ category: category || undefined, q: q || undefined })
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices(selectedCategory ?? undefined, searchText || undefined);
  }, []);

  useEffect(() => {
    if (params.applied === 'true') {
      const nextCategory = params.category || null;
      const nextQ        = params.q || '';
      setSelectedCategory(nextCategory);
      setSearchText(nextQ);
      fetchServices(nextCategory ?? undefined, nextQ || undefined);
    }
  }, [params.category, params.q, params.applied]);

  const handleCategoryPress = (key: string) => {
    if (key === 'Mais') return;
    const next = selectedCategory === key ? null : key;
    setSelectedCategory(next);
    fetchServices(next ?? undefined, searchText);
  };

  const heroStats = useMemo(() => {
    const rated = services.filter(s => s.avg_rating !== null);
    const avgRating = rated.length > 0
      ? (rated.reduce((sum, s) => sum + (s.avg_rating ?? 0), 0) / rated.length).toFixed(1)
      : null;
    return [
      { value: services.length > 0 ? `${services.length}` : '—', label: t('feed.statServices') },
      { value: avgRating ? `${avgRating}★` : '—',               label: t('feed.statRating') },
      { value: String(CATEGORIES.length),                        label: t('feed.statCategories') },
    ];
  }, [services, t]);

  const featuredProviders = useMemo(() => {
    const seen = new Set<number>();
    return services.filter(s => {
      if (seen.has(s.provider_id)) return false;
      seen.add(s.provider_id);
      return true;
    }).slice(0, 5);
  }, [services]);

  const sortedServices = useMemo(() => {
    let result = [...services];
    if (params.applied === 'true') {
      if (params.rating === '4.5+') result = result.filter(s => (s.avg_rating ?? 0) >= 4.5);
      else if (params.rating === '4.0+') result = result.filter(s => (s.avg_rating ?? 0) >= 4.0);
      if (params.priceRange) {
        result = result.filter(s => {
          const price = s.price ?? 0;
          if (params.priceRange === 'R$')    return price <= 50;
          if (params.priceRange === 'R$$')   return price > 50  && price <= 150;
          if (params.priceRange === 'R$$$')  return price > 150 && price <= 300;
          if (params.priceRange === 'R$$$$') return price > 300;
          return true;
        });
      }
    }
    let sortMode = activeFilter;
    if (params.applied === 'true' && params.sortBy) {
      if (params.sortBy === 'Avaliação') sortMode = 'rating';
      else if (params.sortBy === 'Preço') sortMode = 'preco';
      else if (params.sortBy === 'Distância') sortMode = 'proximos';
      else sortMode = 'todos';
    }
    if (sortMode === 'rating')   result.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0));
    else if (sortMode === 'preco')    result.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    else if (sortMode === 'proximos') result.sort((a, b) => a.provider_id - b.provider_id);
    return result;
  }, [services, activeFilter, params.applied, params.sortBy, params.rating, params.priceRange]);

  // ── Dashboard do prestador ───────────────────────────────────────────────
  if (!isClient) {
    return <ProviderHomeScreen />;
  }

  // ── Hero header height ───────────────────────────────────────────────────
  const firstName = user?.name?.split(' ')[0] ?? 'usuário';
  const initials  = user?.name
    ? user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ═══════════════════════════════════════════════════════════════════
          HEADER FIXO — Logo + avatar + barra de pesquisa + filtros rápidos
          ═══════════════════════════════════════════════════════════════════ */}
      <View style={styles.header}>
        {/* Linha 1: Logo + saudação + avatar */}
        <View style={styles.headerTopRow}>
          <View style={styles.headerGreeting}>
            <Text style={styles.greetingSmall}>
              {t('feed.hello')} <Text style={styles.greetingBold}>{firstName} 👋</Text>
            </Text>
            <Text style={styles.headerBrand}>Conecta</Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={styles.notifBtn}
              onPress={() => router.push('/(account)/notifications' as any)}
            >
              <MaterialIcons name="notifications-none" size={24} color={Colors.onSurfaceVariant} />
              {/* Badge de notificação */}
              <View style={styles.notifDot} />
            </Pressable>
            <View style={styles.avatarBtn}>
              <AvatarInitials
                initials={initials}
                imageUri={user?.avatar as string | undefined}
                size="sm"
                onPress={() => router.push('/(account)/edit-profile' as any)}
              />
            </View>
          </View>
        </View>

        {/* Linha 2: Barra de pesquisa — navega para tela dedicada */}
        <View style={styles.searchContainer}>
          <Pressable
            style={styles.searchFakeInput}
            onPress={() =>
              router.push({
                pathname: '/(client)/search',
                params: { q: searchText, category: selectedCategory ?? '' },
              })
            }
          >
            <MaterialIcons name="search" size={22} color={Colors.outline} style={styles.searchIcon} />
            <Text style={searchText ? styles.searchInputText : styles.searchPlaceholder} numberOfLines={1}>
              {searchText || t('feed.searchPlaceholder')}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterBtn,
              params.applied === 'true' && { backgroundColor: Colors.primary },
            ]}
            onPress={() =>
              router.push({
                pathname: '/(client)/filter',
                params: {
                  source: 'feed',
                  q: searchText,
                  sortBy: params.sortBy || (activeFilter === 'rating' ? 'Avaliação' : activeFilter === 'preco' ? 'Preço' : activeFilter === 'proximos' ? 'Distância' : 'Relevância'),
                  distance: params.distance || '5',
                  rating: params.rating || 'Qualquer',
                  priceRange: params.priceRange || 'R$$',
                  category: selectedCategory || 'Reformas',
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

        {/* Linha 3: Filtros rápidos */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFiltersContent}
        >
          {QUICK_FILTERS.map(filter => {
            const active = activeFilter === filter.key;
            return (
              <Pressable
                key={filter.key}
                style={[styles.filterPill, active && styles.filterPillActive]}
                onPress={() => {
                  setActiveFilter(filter.key);
                  if (params.applied === 'true') {
                    router.setParams({
                      sortBy: undefined, distance: undefined,
                      rating: undefined, priceRange: undefined, applied: undefined,
                    });
                  }
                }}
              >
                <MaterialIcons
                  name={filter.icon}
                  size={14}
                  color={active ? Colors.onPrimary : Colors.primary}
                />
                <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Separador */}
        <View style={styles.headerDivider} />
      </View>

      {/* ═══════════════════════════════════════════════════════════════════
          CONTEÚDO SCROLLÁVEL
          ═══════════════════════════════════════════════════════════════════ */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >

        {/* ── Hero banner com headline ───────────────────────────────────── */}
        <LinearGradient
          colors={['#f0f4ff', '#faf5ff', '#fff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroHeadline}>{t('feed.headline')}</Text>
            <Text style={styles.heroSub}>
              Profissionais verificados, serviços de qualidade perto de você.
            </Text>
          </View>
          <View style={styles.heroStatsRow}>
            {heroStats.map(stat => (
              <View key={stat.label} style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{stat.value}</Text>
                <Text style={styles.heroStatLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ── Categorias Populares ──────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('feed.popularCategories')}</Text>
            <Pressable onPress={() => router.push({ pathname: '/(client)/search' })}>
              <Text style={styles.sectionLink}>{t('feed.viewAll')}</Text>
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
                  <View style={[styles.categoryIconWrap, active && styles.categoryIconWrapActive]}>
                    <MaterialIcons name={cat.icon} size={26} color={active ? Colors.primary : Colors.onSurfaceVariant} />
                  </View>
                  <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>
                    {cat.label.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Conteúdo dinâmico ──────────────────────────────────────────── */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>{t('feed.loading')}</Text>
          </View>
        ) : services.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <MaterialIcons name="search-off" size={36} color={Colors.outlineVariant} />
            </View>
            <Text style={styles.emptyTitle}>{t('feed.empty')}</Text>
            <Text style={styles.emptySubtitle}>Tente ajustar seus filtros ou busca</Text>
          </View>
        ) : (
          <>
            {/* Profissionais próximos */}
            {featuredProviders.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{t('feed.featuredProfessionals')}</Text>
                </View>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={featuredProviders}
                  keyExtractor={item => String(item.provider_id)}
                  contentContainerStyle={styles.carouselContent}
                  renderItem={({ item, index }) => (
                    <Pressable
                      style={({ pressed }) => [styles.providerCard, pressed && { opacity: 0.88 }]}
                      onPress={() =>
                        router.push({
                          pathname: '/(client)/provider-profile' as any,
                          params: { id: String(item.provider_id), name: item.provider_name },
                        })
                      }
                    >
                      <View style={styles.providerImageWrap}>
                        <Image
                          source={{ uri: PROVIDER_IMAGES[index % PROVIDER_IMAGES.length] }}
                          style={styles.providerCardImage}
                        />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.55)']}
                          style={styles.providerImageGradient}
                        />
                        {item.avg_rating !== null && (
                          <View style={styles.ratingBadge}>
                            <MaterialIcons name="star" size={12} color="#f59e0b" />
                            <Text style={styles.ratingBadgeText}>{item.avg_rating.toFixed(1)}</Text>
                          </View>
                        )}
                        <View style={styles.providerNearTag}>
                          <MaterialIcons name="near-me" size={11} color={Colors.primary} />
                          <Text style={styles.providerNearText}>{t('feed.nearYou')}</Text>
                        </View>
                      </View>
                      <View style={styles.providerCardBody}>
                        <Text style={styles.providerName} numberOfLines={1}>{item.provider_name}</Text>
                        <Text style={styles.providerService} numberOfLines={1}>{item.name}</Text>
                        <Pressable
                          style={styles.providerBtn}
                          onPress={() =>
                            router.push({
                              pathname: '/(client)/provider-profile' as any,
                              params: { id: String(item.provider_id), name: item.provider_name },
                            })
                          }
                        >
                          <Text style={styles.providerBtnText}>{t('common.viewProfile')}</Text>
                        </Pressable>
                      </View>
                    </Pressable>
                  )}
                />
              </View>
            )}

            {/* Serviços disponíveis */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('feed.availableServices')}</Text>
                <Text style={styles.sectionCount}>{sortedServices.length} serviços</Text>
              </View>
              <View style={styles.serviceList}>
                {sortedServices.map(service => {
                  const cat = CATEGORIES.find(c => c.key === service.category);
                  return (
                    <Pressable
                      key={service.id}
                      style={({ pressed }) => [styles.serviceCard, pressed && { opacity: 0.88 }]}
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
                        <Text style={styles.serviceName} numberOfLines={1}>{service.name}</Text>
                        <View style={styles.serviceMeta}>
                          <Text style={styles.serviceProvider} numberOfLines={1}>
                            {service.provider_name}
                          </Text>
                          {service.avg_rating !== null && (
                            <View style={styles.ratingPill}>
                              <MaterialIcons name="star" size={10} color="#d97706" />
                              <Text style={styles.ratingPillText}>{service.avg_rating.toFixed(1)}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View style={styles.serviceRight}>
                        <Text style={styles.servicePrice}>{formatPrice(service)}</Text>
                        <View style={styles.bookBtn}>
                          <Text style={styles.bookBtnText}>{t('feed.book')}</Text>
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

  // ── HEADER FIXO ──────────────────────────────────────────────────────────
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: 0,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerGreeting: { gap: 0 },
  greetingSmall: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  greetingBold: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurface,
  },
  headerBrand: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 24,
    color: Colors.primary,
    letterSpacing: -0.8,
    marginTop: -2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  avatarBtn: {
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.primary + '33',
    overflow: 'hidden',
  },

  // Barra de pesquisa
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radius.full,
    paddingLeft: Spacing.base,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  searchFakeInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
  },
  searchIcon: { marginRight: Spacing.sm },
  searchPlaceholder: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.outline,
  },
  searchInputText: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurface,
  },
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },

  // Quick filters
  quickFiltersContent: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.sm,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '44',
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  filterPillTextActive: { color: Colors.onPrimary },

  headerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.outlineVariant + '33',
    marginHorizontal: -Spacing.xl,
  },

  // ── SCROLL ───────────────────────────────────────────────────────────────
  scroll: { paddingBottom: Spacing.xxxl * 2 },

  // Hero banner
  heroBanner: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xxl,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    gap: Spacing.xl,
    overflow: 'hidden',
  },
  heroTextBlock: { gap: Spacing.xs },
  heroHeadline: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 26,
    color: Colors.onSurface,
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  heroSub: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  heroStat: { gap: 2 },
  heroStatValue: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.primary,
    letterSpacing: -0.4,
  },
  heroStatLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },

  // Sections
  section: { marginTop: Spacing.xxl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.onSurface,
    letterSpacing: -0.4,
  },
  sectionLink: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },

  // Category grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  categoryTile: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryTileActive: {
    backgroundColor: Colors.primaryContainer + '55',
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconWrapActive: {
    backgroundColor: Colors.primaryContainer,
  },
  categoryLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    letterSpacing: 0.6,
  },
  categoryLabelActive: { color: Colors.primary },

  // Loading / empty
  loadingWrap: {
    paddingVertical: Spacing.xxxl * 2,
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  emptyWrap: {
    paddingVertical: Spacing.xxxl * 2,
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  emptySubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },

  // Featured providers
  carouselContent: { paddingHorizontal: Spacing.xl, gap: Spacing.base },
  providerCard: {
    width: 240,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  providerImageWrap: { height: 150, position: 'relative' },
  providerCardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  providerImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.md,
  },
  ratingBadgeText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 12,
    color: Colors.onSurface,
  },
  providerNearTag: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  providerNearText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 9,
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  providerCardBody: { padding: Spacing.base, gap: 4 },
  providerName: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 15,
    color: Colors.onSurface,
  },
  providerService: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  providerBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  providerBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.onPrimary,
  },

  // Services list
  serviceList: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 18,
    padding: Spacing.base,
    gap: Spacing.base,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  serviceIconBox: {
    width: 58,
    height: 58,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  serviceBody: { flex: 1, gap: 4 },
  serviceName: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  serviceProvider: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    flex: 1,
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
  serviceRight: { alignItems: 'flex-end', gap: Spacing.sm, flexShrink: 0 },
  servicePrice: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  bookBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  bookBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.onPrimary,
    letterSpacing: 1,
  },
});

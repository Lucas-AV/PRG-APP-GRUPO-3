import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
// Colors imported: ink, inkMuted, card, border, brand
import { useAuth } from '@/context/AuthContext';
import { appointmentsApi, Appointment, servicesApi, Service } from '@/services/api';
import { AvatarInitials } from '@/components/ui/avatar-initials';

export function ProviderHomeScreen() {
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greetingSmall}>Olá, <Text style={styles.greetingBold}>{firstName} 👋</Text></Text>
            <Text style={styles.headerBrand}>Conecta</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.notifBtn}
              onPress={() => router.push('/(account)/notifications' as any)}
            >
              <MaterialIcons name="notifications-none" size={24} color={Colors.inkMuted} />
              {appointments.some(a => a.scheduled_date === today && a.status === 'confirmado') && (
                <View style={styles.notifDot} />
              )}
            </Pressable>
            <View style={styles.avatarWrapper}>
              <AvatarInitials
                initials={initials}
                imageUri={user?.avatar}
                size="sm"
                onPress={() => router.push('/(account)/edit-profile' as any)}
              />
            </View>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderLeftColor: Colors.primary }]}>
              <MaterialIcons name="today" size={22} color={Colors.primary} />
              <Text style={styles.statValue}>{todayCount}</Text>
              <Text style={styles.statLabel}>Hoje</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: Colors.secondary }]}>
              <MaterialIcons name="home-repair-service" size={22} color={Colors.secondary} />
              <Text style={styles.statValue}>{activeServices.length}</Text>
              <Text style={styles.statLabel}>Serviços ativos</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: Colors.tertiary }]}>
              <MaterialIcons name="attach-money" size={22} color={Colors.tertiary} />
              <Text style={styles.statValue}>
                {totalRevenue > 0 ? `R$ ${totalRevenue.toFixed(0)}` : '—'}
              </Text>
              <Text style={styles.statLabel}>Receita total</Text>
            </View>
          </View>

          {/* Quick actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ações rápidas</Text>
            <View style={styles.quickActions}>
              {[
                { icon: 'build' as const,           label: 'Meus Serviços',  path: '/(services)/create' as any },
                { icon: 'event-available' as const,  label: 'Disponibilidade', path: '/(account)/edit-profile' as any },
                { icon: 'bar-chart' as const,        label: 'Desempenho',     path: '/(services)/view' as any },
                { icon: 'star-border' as const,      label: 'Avaliações',     path: '/(account)/payments' as any },
              ].map(action => (
                <Pressable
                  key={action.label}
                  style={({ pressed }) => [styles.quickAction, pressed && { opacity: 0.7 }]}
                  onPress={() => router.push(action.path)}
                >
                  <View style={styles.quickActionIcon}>
                    <MaterialIcons name={action.icon} size={22} color={Colors.primary} />
                  </View>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Upcoming appointments */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Próximos agendamentos</Text>
              <Pressable onPress={() => router.push('/(tabs)/schedule' as any)}>
                <Text style={styles.sectionLink}>VER TODOS</Text>
              </Pressable>
            </View>
            {upcomingAppts.length === 0 ? (
              <View style={styles.emptyBox}>
                <MaterialIcons name="event-busy" size={32} color={Colors.outlineVariant} />
                <Text style={styles.emptyText}>Nenhum agendamento pendente</Text>
              </View>
            ) : (
              <View style={styles.apptList}>
                {upcomingAppts.map(appt => (
                  <Pressable
                    key={appt.id}
                    style={({ pressed }) => [styles.apptCard, pressed && { opacity: 0.85 }]}
                    onPress={() =>
                      router.push({
                        pathname: '/(scheduling)/appointment-detail' as any,
                        params: { id: String(appt.id) },
                      })
                    }
                  >
                    <View style={styles.apptIconBox}>
                      <MaterialIcons name="person" size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.apptBody}>
                      <Text style={styles.apptClient} numberOfLines={1}>{appt.client_name}</Text>
                      <Text style={styles.apptService} numberOfLines={1}>{appt.service_name}</Text>
                    </View>
                    <View style={styles.apptRight}>
                      <Text style={styles.apptTime}>{formatApptDate(appt.scheduled_date, appt.scheduled_time)}</Text>
                      <Text style={styles.apptPrice}>R$ {appt.total_price.toFixed(2).replace('.', ',')}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Active services */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Meus serviços</Text>
              <Pressable onPress={() => router.push('/(services)/create' as any)}>
                <Text style={styles.sectionLink}>ADICIONAR</Text>
              </Pressable>
            </View>
            {activeServices.length === 0 ? (
              <View style={styles.emptyBox}>
                <MaterialIcons name="add-business" size={32} color={Colors.outlineVariant} />
                <Text style={styles.emptyText}>Nenhum serviço ativo. Crie o primeiro!</Text>
              </View>
            ) : (
              <View style={styles.serviceGrid}>
                {activeServices.slice(0, 4).map(svc => (
                  <Pressable
                    key={svc.id}
                    style={({ pressed }) => [styles.serviceChip, pressed && { opacity: 0.75 }]}
                    onPress={() =>
                      router.push({
                        pathname: '/(services)/view' as any,
                        params: { id: String(svc.id) },
                      })
                    }
                  >
                    <MaterialIcons name="home-repair-service" size={16} color={Colors.primary} />
                    <Text style={styles.serviceChipLabel} numberOfLines={1}>{svc.name}</Text>
                    {svc.price != null && (
                      <Text style={styles.serviceChipPrice}>R$ {svc.price.toFixed(0)}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: Spacing.xxxl * 2 },

  header: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.base,
    shadowColor: Colors.ink,
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
    color: Colors.inkMuted,
  },
  greetingBold: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.ink,
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
    backgroundColor: Colors.card,
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
  avatarWrapper: {
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.primary + '33',
    overflow: 'hidden',
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
    backgroundColor: Colors.card,
    borderLeftWidth: 3,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 22,
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.inkMuted,
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
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  sectionLink: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 1.5,
  },

  quickActions: { flexDirection: 'row', gap: Spacing.sm },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    gap: Spacing.xs,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.brand + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.inkMuted,
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  emptyBox: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingVertical: Spacing.xxxl,
    alignItems: 'center',
    gap: Spacing.base,
  },
  emptyText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: 'center',
  },

  apptList: { gap: Spacing.sm },
  apptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.base,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  apptIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.brand + '15',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  apptBody: { flex: 1, gap: 2 },
  apptClient: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.ink,
  },
  apptService: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.inkMuted,
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
    color: Colors.ink,
  },

  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.card,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: '48%',
  },
  serviceChipLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.ink,
    flex: 1,
  },
  serviceChipPrice: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 12,
    color: Colors.primary,
  },
});

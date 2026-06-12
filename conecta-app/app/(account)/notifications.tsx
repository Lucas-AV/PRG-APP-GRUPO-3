import { useEffect, useState } from 'react';
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
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { appointmentsApi, Appointment } from '@/services/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface NotificationItem {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  timeLabel: string;
  appointmentId: number;
  isToday: boolean;
  isThisWeek: boolean;
  timestamp: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { icon: keyof typeof MaterialIcons.glyphMap; color: string; bg: string; verb: string }> = {
  confirmado: { icon: 'event-available', color: Colors.brand,   bg: Colors.brand + '15',   verb: 'confirmado' },
  cancelado:  { icon: 'event-busy',      color: '#dc2626',      bg: '#fee2e2',              verb: 'cancelado'  },
  concluido:  { icon: 'check-circle',    color: '#16a34a',      bg: '#dcfce7',              verb: 'concluído'  },
};

function buildNotification(appt: Appointment, isProvider: boolean, today: string, weekAgo: string): NotificationItem {
  const meta = STATUS_META[appt.status] ?? STATUS_META.confirmado;
  const title = isProvider
    ? appt.status === 'confirmado'
      ? `Novo agendamento de ${appt.client_name}`
      : appt.status === 'concluido'
        ? `Serviço concluído com ${appt.client_name}`
        : `Agendamento cancelado por ${appt.client_name}`
    : appt.status === 'confirmado'
      ? `Reserva confirmada: ${appt.service_name}`
      : appt.status === 'concluido'
        ? `Serviço concluído: ${appt.service_name}`
        : `Agendamento cancelado: ${appt.service_name}`;

  const subtitle = isProvider
    ? `${appt.service_name} • ${appt.scheduled_date.split('-').reverse().join('/')} às ${appt.scheduled_time.slice(0, 5)}`
    : `Com ${appt.provider_name} • ${appt.scheduled_date.split('-').reverse().join('/')} às ${appt.scheduled_time.slice(0, 5)}`;

  const createdAt = new Date(appt.created_at);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  let timeLabel: string;
  if (diffHours < 1) timeLabel = 'Agora mesmo';
  else if (diffHours < 24) timeLabel = `${Math.floor(diffHours)}h atrás`;
  else if (diffDays < 7) timeLabel = `${Math.floor(diffDays)}d atrás`;
  else timeLabel = createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  const isToday = appt.created_at.slice(0, 10) === today;
  const isThisWeek = appt.created_at.slice(0, 10) >= weekAgo;

  return {
    id: String(appt.id),
    icon: meta.icon,
    iconColor: meta.color,
    iconBg: meta.bg,
    title,
    subtitle,
    timeLabel,
    appointmentId: appt.id,
    isToday,
    isThisWeek,
    timestamp: createdAt.getTime(),
  };
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    appointmentsApi.list(token)
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [token]);

  const isProvider = user?.role === 'prestador';
  const today = new Date().toISOString().slice(0, 10);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const notifications = appointments
    .map(a => buildNotification(a, isProvider, today, weekAgo))
    .sort((a, b) => b.timestamp - a.timestamp);

  const todayItems = notifications.filter(n => n.isToday);
  const weekItems = notifications.filter(n => !n.isToday && n.isThisWeek);
  const olderItems = notifications.filter(n => !n.isThisWeek);

  const renderItem = (item: NotificationItem) => (
    <Pressable
      key={item.id}
      style={({ pressed }) => [styles.item, pressed && { backgroundColor: Colors.brand + '08' }]}
      onPress={() =>
        router.push({
          pathname: '/(scheduling)/appointment-detail' as any,
          params: { id: String(item.appointmentId) },
        })
      }
    >
      <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
        <MaterialIcons name={item.icon} size={22} color={item.iconColor} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
      </View>
      <Text style={styles.time}>{item.timeLabel}</Text>
    </Pressable>
  );

  const renderGroup = (label: string, items: NotificationItem[]) => {
    if (items.length === 0) return null;
    return (
      <View style={styles.group} key={label}>
        <Text style={styles.groupLabel}>{label}</Text>
        <View style={styles.groupItems}>
          {items.map(renderItem)}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopAppBar title="Notificações" />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.brand} size="large" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <MaterialIcons name="notifications-none" size={40} color={Colors.inkMuted} />
          </View>
          <Text style={styles.emptyTitle}>Sem notificações</Text>
          <Text style={styles.emptySubtitle}>
            Suas atividades de agendamento aparecerão aqui.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {renderGroup('Hoje', todayItems)}
          {renderGroup('Esta semana', weekItems)}
          {renderGroup('Anteriores', olderItems)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingTop: Spacing.base, paddingBottom: Spacing.xxxl },

  group: { marginBottom: Spacing.xxl },
  groupLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.inkMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xs,
  },
  groupItems: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    overflow: 'hidden',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1, gap: 2 },
  title: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: Colors.ink,
    lineHeight: 18,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  time: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 10,
    color: Colors.inkMuted,
    flexShrink: 0,
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
    paddingHorizontal: Spacing.xxxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.brand + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
});

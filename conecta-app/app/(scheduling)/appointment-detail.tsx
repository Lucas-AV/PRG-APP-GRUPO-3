import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { GradientButton } from '@/components/ui/gradient-button';
import { MapPreview } from '@/components/ui/map-preview';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { appointmentsApi, Appointment } from '@/services/api';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${day} de ${MONTHS[month - 1]} de ${year}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `Aprox. ${h}h${m > 0 ? `${m}min` : ''}`;
}

const STATUS_CONFIG = {
  confirmado: { bg: Colors.primaryContainer, text: Colors.primary, label: 'Confirmado', icon: 'check-circle' as const },
  cancelado: { bg: '#FFE4E4', text: Colors.error, label: 'Cancelado', icon: 'cancel' as const },
  concluido: { bg: Colors.surfaceContainerHigh, text: Colors.onSurfaceVariant, label: 'Concluído', icon: 'task-alt' as const },
};

export default function AppointmentDetailScreen() {
  const { user, token } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id || !token) return;
    appointmentsApi.get(Number(id), token)
      .then(setAppointment)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Agendamento',
      'Tem certeza que deseja cancelar este agendamento?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            if (!token || !appointment) return;
            setCancelling(true);
            try {
              await appointmentsApi.cancel(appointment.id, token);
              setAppointment(prev => prev ? { ...prev, status: 'cancelado' } : prev);
            } catch (e: any) {
              Alert.alert('Erro', e.message ?? 'Não foi possível cancelar.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <TopAppBar title="Detalhes do Agendamento" />
        <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <TopAppBar title="Detalhes do Agendamento" />
        <View style={styles.center}><Text style={styles.errorText}>Agendamento não encontrado.</Text></View>
      </SafeAreaView>
    );
  }

  const isClient = user?.role === 'cliente';
  const isConfirmed = appointment.status === 'confirmado';
  const statusCfg = STATUS_CONFIG[appointment.status];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Detalhes do Agendamento" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status badge */}
        <View style={styles.statusWrap}>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <MaterialIcons name={statusCfg.icon} size={16} color={statusCfg.text} />
            <Text style={[styles.statusLabel, { color: statusCfg.text }]}>{statusCfg.label}</Text>
          </View>
          {isConfirmed && (
            <Text style={styles.statusNote}>Seu profissional já confirmou este serviço.</Text>
          )}
        </View>

        {/* Service card */}
        <View style={styles.serviceCard}>
          <Text style={styles.serviceName}>{appointment.service_name}</Text>
          <View style={styles.providerRow}>
            <MaterialIcons name="verified" size={16} color={Colors.primary} />
            <Text style={styles.providerName}>{appointment.provider_name}</Text>
          </View>
        </View>

        {/* Appointment details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dados da Agenda</Text>
            <View style={styles.sectionTag}><Text style={styles.sectionTagText}>RESUMO</Text></View>
          </View>
          <View style={styles.detailGrid}>
            <View style={styles.detailCard}>
              <MaterialIcons name="calendar-today" size={22} color={Colors.primary} />
              <Text style={styles.detailLabel}>DATA</Text>
              <Text style={styles.detailValue}>{formatDisplayDate(appointment.scheduled_date)}</Text>
            </View>
            <View style={styles.detailCard}>
              <MaterialIcons name="schedule" size={22} color={Colors.primary} />
              <Text style={styles.detailLabel}>HORÁRIO</Text>
              <Text style={styles.detailValue}>{appointment.scheduled_time}</Text>
            </View>
          </View>
          <View style={styles.durationCard}>
            <MaterialIcons name="timer" size={22} color={Colors.primary} />
            <View>
              <Text style={styles.detailLabel}>DURAÇÃO ESTIMADA</Text>
              <Text style={styles.detailValue}>{formatDuration(appointment.duration_minutes)}</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        {appointment.client_address_street ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Local do Serviço</Text>
            <View style={styles.locationCard}>
              <MapPreview
                street={appointment.client_address_street ?? ''}
                number={appointment.client_address_number ?? ''}
                neighborhood={appointment.client_address_neighborhood ?? ''}
                city={appointment.client_address_city ?? ''}
                state={appointment.client_address_state ?? ''}
                zipCode={appointment.client_address_zip ?? ''}
                height={128}
              />
              <View style={styles.locationAddress}>
                <Text style={styles.locationStreet}>
                  {appointment.client_address_street}{appointment.client_address_number ? `, ${appointment.client_address_number}` : ''}
                </Text>
                <Text style={styles.locationCity}>
                  {appointment.client_address_neighborhood ? `${appointment.client_address_neighborhood}, ` : ''}{appointment.client_address_city} - {appointment.client_address_state}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Payment */}
        <View style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Resumo de Pagamento</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.payRowLabel}>Valor do Serviço</Text>
            <Text style={styles.payRowValue}>R$ {appointment.total_price.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.payRowLabel}>Taxa de Plataforma</Text>
            <Text style={[styles.payRowValue, { color: Colors.primary }]}>Incluída</Text>
          </View>
          <View style={styles.payDivider} />
          <View style={styles.payTotalRow}>
            {isClient ? (
              <View style={styles.payMethodRow}>
                <MaterialIcons name="credit-card" size={16} color={Colors.onSurfaceVariant} />
                <Text style={styles.payMethodLabel}>
                  {appointment.payment_method === 'cartao'
                    ? appointment.card_brand
                      ? `${appointment.card_brand} •••• ${appointment.card_last_four}`
                      : 'Cartão de Crédito'
                    : 'Pix'}
                </Text>
              </View>
            ) : (
              <Text style={styles.payMethodLabel}>
                Pago via {appointment.payment_method === 'cartao' ? 'Cartão' : 'Pix'}
              </Text>
            )}
            <Text style={styles.payTotalValue}>R$ {appointment.total_price.toFixed(2).replace('.', ',')}</Text>
          </View>
        </View>

        {/* Actions */}
        {isConfirmed && (
          <View style={styles.actions}>
            <GradientButton
              label="Enviar Mensagem"
              onPress={() => router.push('/(tabs)/messages' as any)}
            />
            <Pressable
              style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}
              onPress={handleCancel}
              disabled={cancelling}
            >
              <Text style={styles.cancelBtnLabel}>{cancelling ? 'Cancelando...' : 'Cancelar Agendamento'}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontFamily: FontFamily.bodyRegular, fontSize: 14, color: Colors.onSurfaceVariant },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxl, paddingBottom: Spacing.xxxl * 2, gap: Spacing.xxl },

  statusWrap: { alignItems: 'center', gap: Spacing.sm },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  statusLabel: { fontFamily: FontFamily.headlineBold, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  statusNote: { fontFamily: FontFamily.bodyRegular, fontSize: 12, color: Colors.onSurfaceVariant, textAlign: 'center' },

  serviceCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.sm, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16 },
  serviceName: { fontFamily: FontFamily.headlineExtraBold, fontSize: 20, color: Colors.onSurface, letterSpacing: -0.5 },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  providerName: { fontFamily: FontFamily.bodyMedium, fontSize: 14, color: Colors.onSurfaceVariant },

  section: { gap: Spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: FontFamily.headlineExtraBold, fontSize: 18, color: Colors.onSurface, letterSpacing: -0.3 },
  sectionTag: { backgroundColor: Colors.surfaceContainer, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  sectionTagText: { fontFamily: FontFamily.bodySemiBold, fontSize: 9, color: Colors.onSurfaceVariant, letterSpacing: 1.5, textTransform: 'uppercase' },

  detailGrid: { flexDirection: 'row', gap: Spacing.md },
  detailCard: { flex: 1, backgroundColor: Colors.surfaceContainerLow, borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.xs },
  durationCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base, backgroundColor: Colors.surfaceContainerLow, borderRadius: Radius.xl, padding: Spacing.base },
  detailLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: 10, color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1.2, marginTop: Spacing.xs },
  detailValue: { fontFamily: FontFamily.headlineBold, fontSize: 14, color: Colors.onSurface },

  locationCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.xl, overflow: 'hidden' },
  locationAddress: { padding: Spacing.base },
  locationStreet: { fontFamily: FontFamily.bodyMedium, fontSize: 14, color: Colors.onSurface },
  locationCity: { fontFamily: FontFamily.bodyRegular, fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },

  paymentCard: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.md, borderLeftWidth: 4, borderLeftColor: Colors.primary },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  payRowLabel: { fontFamily: FontFamily.bodyRegular, fontSize: 14, color: Colors.onSurfaceVariant },
  payRowValue: { fontFamily: FontFamily.headlineBold, fontSize: 14, color: Colors.onSurface },
  payDivider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.outlineVariant },
  payTotalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  payMethodRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  payMethodLabel: { fontFamily: FontFamily.bodyMedium, fontSize: 13, color: Colors.onSurfaceVariant },
  payTotalValue: { fontFamily: FontFamily.headlineExtraBold, fontSize: 20, color: Colors.primary, letterSpacing: -0.5 },

  actions: { gap: Spacing.md },
  cancelBtn: { alignItems: 'center', paddingVertical: Spacing.base },
  cancelBtnLabel: { fontFamily: FontFamily.headlineBold, fontSize: 14, color: Colors.error },
});

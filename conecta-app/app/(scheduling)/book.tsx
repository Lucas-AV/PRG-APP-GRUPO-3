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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { availabilityApi, appointmentsApi, cardsApi, TimeSlot } from '@/services/api';

type PaymentMethod = 'pix' | 'cartao';

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_NAMES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function generateDates() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    dates.push({ dateStr, dayName: DAY_NAMES[d.getDay()], dayNum: d.getDate(), monthName: MONTH_NAMES[d.getMonth()], year: d.getFullYear() });
  }
  return dates;
}

function groupSlots(slots: TimeSlot[]) {
  const manha = slots.filter(s => parseInt(s.time.split(':')[0]) < 12);
  const tarde = slots.filter(s => { const h = parseInt(s.time.split(':')[0]); return h >= 12 && h < 18; });
  const noite = slots.filter(s => parseInt(s.time.split(':')[0]) >= 18);
  return { manha, tarde, noite };
}

export default function BookScreen() {
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    serviceId: string; providerId: string; serviceName: string;
    servicePrice: string; serviceDuration: string; providerName: string;
  }>();

  const dates = generateDates();
  const [selectedDate, setSelectedDate] = useState(dates[0].dateStr);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [cardLabel, setCardLabel] = useState<string>('Nenhum cartão salvo');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!user || !token) return;
    cardsApi.list(user.id, token)
      .then((cards) => {
        if (cards.length > 0) {
          setSelectedCardId(cards[0].id);
          setCardLabel(`${cards[0].brand} •••• ${cards[0].last_four}`);
        }
      })
      .catch(() => {});
  }, [user?.id, token]);

  useEffect(() => { fetchSlots(selectedDate); }, [selectedDate]);

  const fetchSlots = async (date: string) => {
    setSlotsLoading(true);
    setSelectedTime(null);
    try {
      const res = await availabilityApi.slots(Number(params.providerId), date, Number(params.serviceId));
      setSlots(res.slots);
    } catch { setSlots([]); } finally { setSlotsLoading(false); }
  };

  const handleConfirm = async () => {
    if (!selectedTime || !user || !token) return;
    if (paymentMethod === 'cartao' && !selectedCardId) {
      Alert.alert('Selecione um cartão', 'Adicione um cartão em Conta > Pagamentos ou escolha Pix.');
      return;
    }
    setConfirming(true);
    try {
      await appointmentsApi.create({
        service_id: Number(params.serviceId),
        provider_id: Number(params.providerId),
        scheduled_date: selectedDate,
        scheduled_time: selectedTime,
        payment_method: paymentMethod,
        ...(paymentMethod === 'cartao' && selectedCardId ? { card_id: selectedCardId } : {}),
      }, token);
      Alert.alert('Agendado!', 'Seu agendamento foi confirmado.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/schedule' as any) },
      ]);
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível confirmar o agendamento.');
    } finally { setConfirming(false); }
  };

  const { manha, tarde, noite } = groupSlots(slots);
  const selectedDateInfo = dates.find(d => d.dateStr === selectedDate);
  const price = parseFloat(params.servicePrice || '0');
  const priceFormatted = price.toFixed(2).replace('.', ',');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Agendar Serviço" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Service card */}
        <View style={styles.serviceCard}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName} numberOfLines={2}>{params.serviceName}</Text>
            <View style={styles.providerRow}>
              <MaterialIcons name="verified" size={16} color={Colors.brand} />
              <Text style={styles.providerName}>{params.providerName}</Text>
            </View>
          </View>
          <Text style={styles.servicePrice}>R$ {priceFormatted}</Text>
        </View>

        {/* Date selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Selecione o Dia</Text>
            {selectedDateInfo && (
              <Text style={styles.sectionSub}>{selectedDateInfo.monthName.toUpperCase()} {selectedDateInfo.year}</Text>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesRow}>
            {dates.map(d => {
              const isSelected = d.dateStr === selectedDate;
              return (
                <Pressable key={d.dateStr} style={[styles.dateChip, isSelected && styles.dateChipSelected]} onPress={() => setSelectedDate(d.dateStr)}>
                  <Text style={[styles.dateDayName, isSelected && styles.dateTextSelected]}>{d.dayName}</Text>
                  <Text style={[styles.dateDayNum, isSelected && styles.dateTextSelected]}>{d.dayNum}</Text>
                  {isSelected && <View style={styles.dateDot} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Time slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecione o Horário</Text>
          {slotsLoading ? (
            <ActivityIndicator color={Colors.brand} style={{ marginTop: Spacing.xl }} />
          ) : slots.length === 0 ? (
            <Text style={styles.noSlotsText}>Nenhum horário disponível para este dia.</Text>
          ) : (
            <View style={styles.slotGroups}>
              {manha.length > 0 && <SlotGroup icon="light-mode" label="Manhã" slots={manha} selected={selectedTime} onSelect={setSelectedTime} />}
              {tarde.length > 0 && <SlotGroup icon="sunny" label="Tarde" slots={tarde} selected={selectedTime} onSelect={setSelectedTime} />}
              {noite.length > 0 && <SlotGroup icon="dark-mode" label="Noite" slots={noite} selected={selectedTime} onSelect={setSelectedTime} />}
            </View>
          )}
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pagamento</Text>
          <Pressable style={[styles.paymentRow, paymentMethod === 'pix' && styles.paymentRowSelected]} onPress={() => setPaymentMethod('pix')}>
            <View style={[styles.paymentIcon, { backgroundColor: Colors.brand + '15' }]}>
              <MaterialIcons name="bolt" size={22} color={Colors.brand} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>Pix</Text>
              <Text style={styles.paymentSub}>Aprovação imediata</Text>
            </View>
            <RadioDot selected={paymentMethod === 'pix'} />
          </Pressable>

          <Pressable style={[styles.paymentRow, paymentMethod === 'cartao' && styles.paymentRowSelected]} onPress={() => setPaymentMethod('cartao')}>
            <View style={[styles.paymentIcon, { backgroundColor: Colors.card }]}>
              <MaterialIcons name="credit-card" size={22} color={Colors.inkMuted} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>Cartão de Crédito</Text>
              <Text style={styles.paymentSub}>{cardLabel}</Text>
            </View>
            <RadioDot selected={paymentMethod === 'cartao'} />
          </Pressable>
        </View>

        {/* Cancellation note */}
        <View style={styles.infoCard}>
          <MaterialIcons name="info" size={20} color={Colors.brand} />
          <Text style={styles.infoText}>Cancelamento gratuito até 24h antes do serviço.</Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 8, Spacing.xl) }]}>
        <View style={styles.footerInfo}>
          <View>
            <Text style={styles.totalLabel}>TOTAL ESTIMADO</Text>
            <Text style={styles.totalValue}>R$ {priceFormatted}</Text>
          </View>
          {selectedTime && selectedDateInfo && (
            <Text style={styles.footerDateTime}>{selectedDateInfo.dayNum} {selectedDateInfo.monthName} • {selectedTime}</Text>
          )}
        </View>
        <GradientButton
          label={confirming ? 'Aguarde...' : 'Confirmar Agendamento'}
          onPress={handleConfirm}
          disabled={!selectedTime || confirming}
          style={styles.confirmBtn}
        />
      </View>
    </SafeAreaView>
  );
}

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <View style={[rdStyles.radio, selected && rdStyles.radioSelected]}>
      {selected && <View style={rdStyles.dot} />}
    </View>
  );
}

function SlotGroup({ icon, label, slots, selected, onSelect }: {
  icon: any; label: string; slots: TimeSlot[]; selected: string | null; onSelect: (t: string) => void;
}) {
  return (
    <View style={sgStyles.group}>
      <View style={sgStyles.header}>
        <MaterialIcons name={icon} size={16} color={Colors.inkMuted} />
        <Text style={sgStyles.label}>{label}</Text>
      </View>
      <View style={sgStyles.grid}>
        {slots.map(slot => {
          const isSelected = slot.time === selected;
          const disabled = slot.is_occupied || slot.is_past;
          return (
            <Pressable
              key={slot.time}
              disabled={disabled}
              onPress={() => onSelect(slot.time)}
              style={[sgStyles.btn, isSelected && sgStyles.btnSelected, disabled && sgStyles.btnDisabled]}
            >
              <Text style={[sgStyles.time, isSelected && sgStyles.timeSelected, disabled && sgStyles.timeDisabled]}>{slot.time}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const rdStyles = StyleSheet.create({
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: Colors.brand, backgroundColor: Colors.brand },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.onPrimary },
});

const sgStyles = StyleSheet.create({
  group: { gap: Spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  label: { fontFamily: FontFamily.headlineBold, fontSize: 11, color: Colors.inkMuted, textTransform: 'uppercase', letterSpacing: 1.2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  btn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  btnSelected: { backgroundColor: Colors.brand },
  btnDisabled: { opacity: 0.4 },
  time: { fontFamily: FontFamily.headlineBold, fontSize: 13, color: Colors.ink },
  timeSelected: { color: Colors.onPrimary },
  timeDisabled: { color: Colors.inkMuted },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxl, paddingBottom: 160, gap: Spacing.xxxl },

  serviceCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.md, elevation: 2, shadowColor: Colors.ink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
  serviceInfo: { flex: 1, gap: Spacing.xs },
  serviceName: { fontFamily: FontFamily.headlineExtraBold, fontSize: 16, color: Colors.ink, letterSpacing: -0.3 },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  providerName: { fontFamily: FontFamily.bodyMedium, fontSize: 13, color: Colors.inkMuted },
  servicePrice: { fontFamily: FontFamily.headlineExtraBold, fontSize: 20, color: Colors.brand, letterSpacing: -0.5 },

  section: { gap: Spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: FontFamily.headlineExtraBold, fontSize: 18, color: Colors.ink, letterSpacing: -0.3 },
  sectionSub: { fontFamily: FontFamily.bodyMedium, fontSize: 12, color: Colors.inkMuted },

  datesRow: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  dateChip: { width: 64, height: 80, borderRadius: Radius.xl, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', gap: 4, elevation: 1, shadowColor: Colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
  dateChipSelected: { backgroundColor: Colors.brand, shadowColor: Colors.brand, shadowOpacity: 0.3, elevation: 4 },
  dateDayName: { fontFamily: FontFamily.bodyMedium, fontSize: 11, color: Colors.inkMuted, textTransform: 'uppercase' },
  dateDayNum: { fontFamily: FontFamily.headlineExtraBold, fontSize: 20, color: Colors.ink },
  dateTextSelected: { color: Colors.onPrimary },
  dateDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.onPrimary },

  noSlotsText: { fontFamily: FontFamily.bodyRegular, fontSize: 14, color: Colors.inkMuted, textAlign: 'center', marginTop: Spacing.xl },
  slotGroups: { gap: Spacing.xl },

  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base, padding: Spacing.base + 4, borderRadius: Radius.xl, backgroundColor: Colors.card, borderWidth: 1.5, borderColor: 'transparent' },
  paymentRowSelected: { borderColor: Colors.brand },
  paymentIcon: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  paymentInfo: { flex: 1 },
  paymentLabel: { fontFamily: FontFamily.headlineBold, fontSize: 15, color: Colors.ink },
  paymentSub: { fontFamily: FontFamily.bodyRegular, fontSize: 12, color: Colors.inkMuted, marginTop: 1 },

  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, backgroundColor: Colors.brand + '10', borderRadius: Radius.xl, padding: Spacing.base, borderLeftWidth: 3, borderLeftColor: Colors.brand },
  infoText: { fontFamily: FontFamily.bodyMedium, fontSize: 12, color: Colors.ink, flex: 1, lineHeight: 18 },

  footer: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, backgroundColor: Colors.surface, shadowColor: Colors.ink, shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 6, gap: Spacing.md },
  footerInfo: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  totalLabel: { fontFamily: FontFamily.bodyMedium, fontSize: 10, color: Colors.inkMuted, letterSpacing: 1.2 },
  totalValue: { fontFamily: FontFamily.headlineExtraBold, fontSize: 24, color: Colors.ink, letterSpacing: -0.5 },
  footerDateTime: { fontFamily: FontFamily.bodyMedium, fontSize: 12, color: Colors.inkMuted },
  confirmBtn: { height: 56 },
});

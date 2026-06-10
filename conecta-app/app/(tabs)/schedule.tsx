import { useState, useEffect, useRef } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, Spacing, Radius, GradientColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { appointmentsApi, Appointment } from '@/services/api';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type CalCell = { day: number; currentMonth: boolean; dateStr: string };

function generateCalendarCells(year: number, month: number): CalCell[] {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells: CalCell[] = [];

  for (let i = firstDow - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const pm = month === 0 ? 11 : month - 1;
    const py = month === 0 ? year - 1 : year;
    cells.push({ day: d, currentMonth: false, dateStr: `${py}-${String(pm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true, dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  }
  const trailing = 7 - (cells.length % 7);
  if (trailing < 7) {
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    for (let d = 1; d <= trailing; d++) {
      cells.push({ day: d, currentMonth: false, dateStr: `${ny}-${String(nm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
    }
  }
  return cells;
}

export default function ScheduleScreen() {
  const { user, token } = useAuth();
  const todayRef = useRef(new Date());
  const today = todayRef.current;
  const todayStr = toDateStr(today);
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    appointmentsApi.list(token)
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [token]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const cells = generateCalendarCells(year, month);

  const datesWithAppts = new Set(appointments.map(a => a.scheduled_date));

  const selectedAppts = appointments
    .filter(a => a.scheduled_date === selectedDate)
    .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));

  const selectedDateObj = new Date(selectedDate + 'T12:00:00');

  const monthApptCount = appointments.filter(a =>
    a.scheduled_date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
  ).length;

  const nextDays = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    const ds = toDateStr(d);
    return { dateStr: ds, label: i === 0 ? 'Amanhã' : WEEKDAYS[d.getDay()], dayNum: d.getDate(), count: appointments.filter(a => a.scheduled_date === ds).length };
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <MaterialIcons name="calendar-today" size={22} color={Colors.primary} />
          <Text style={styles.topTitle}>Agendamentos</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Month header */}
        <View style={styles.monthHeader}>
          <View>
            <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
            <Text style={styles.monthSub}>{monthApptCount} compromisso{monthApptCount !== 1 ? 's' : ''} este mês</Text>
          </View>
          <View style={styles.monthNav}>
            <Pressable style={styles.monthNavBtn} onPress={() => setViewDate(new Date(year, month - 1, 1))}>
              <MaterialIcons name="chevron-left" size={22} color={Colors.onSurfaceVariant} />
            </Pressable>
            <Pressable style={styles.monthNavBtn} onPress={() => setViewDate(new Date(year, month + 1, 1))}>
              <MaterialIcons name="chevron-right" size={22} color={Colors.onSurfaceVariant} />
            </Pressable>
          </View>
        </View>

        {/* Calendar grid */}
        <View style={styles.calCard}>
          <View style={styles.weekdays}>
            {WEEKDAYS.map(d => <Text key={d} style={styles.weekdayLabel}>{d}</Text>)}
          </View>
          <View style={styles.calGrid}>
            {cells.map((cell, idx) => {
              const isSel = cell.dateStr === selectedDate;
              const hasAppt = cell.currentMonth && datesWithAppts.has(cell.dateStr);
              const isToday = cell.dateStr === todayStr;
              return (
                <Pressable
                  key={idx}
                  style={[styles.calCell, isSel && styles.calCellSel]}
                  onPress={() => {
                    if (!cell.currentMonth) {
                      const d = new Date(cell.dateStr + 'T12:00:00');
                      setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
                    }
                    setSelectedDate(cell.dateStr);
                  }}
                >
                  <Text style={[styles.calDay, !cell.currentMonth && styles.calDayOut, isSel && styles.calDaySelected, isToday && !isSel && styles.calDayToday]}>
                    {cell.day}
                  </Text>
                  {hasAppt && !isSel && <View style={styles.calDot} />}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.legend}>
            {[{ color: Colors.primary, label: 'Agendado' }, { color: Colors.error, label: 'Ocupado' }, { color: Colors.surfaceContainerHighest, label: 'Livre' }].map(l => (
              <View key={l.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                <Text style={styles.legendLabel}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Selected day gradient card */}
        <LinearGradient colors={GradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.dayCard}>
          <View style={styles.dayCardHeader}>
            <View>
              <Text style={styles.dayCardDate}>{selectedDateObj.getDate()} de {MONTHS[selectedDateObj.getMonth()]}</Text>
              <Text style={styles.dayCardWeekday}>{WEEKDAYS[selectedDateObj.getDay()]}</Text>
            </View>
            <View style={styles.dayCardIcon}>
              <MaterialIcons name="event-note" size={22} color={Colors.onPrimary} />
            </View>
          </View>
          <View style={styles.dayCardBadge}>
            <MaterialIcons name="event-available" size={14} color={Colors.onPrimary} />
            <Text style={styles.dayCardBadgeText}>{selectedAppts.length} compromisso{selectedAppts.length !== 1 ? 's' : ''}</Text>
          </View>

          {selectedAppts.length === 0 ? (
            <Text style={styles.dayCardEmpty}>Nenhum compromisso neste dia.</Text>
          ) : (
            <View style={styles.dayEvents}>
              {selectedAppts.map(appt => (
                <Pressable
                  key={appt.id}
                  style={styles.dayEvent}
                  onPress={() => router.push({ pathname: '/(scheduling)/appointment-detail' as any, params: { id: String(appt.id) } })}
                >
                  <View style={styles.dayEventTime}>
                    <Text style={styles.dayEventTimeText}>{appt.scheduled_time}</Text>
                  </View>
                  <View style={styles.dayEventInfo}>
                    <Text style={styles.dayEventName}>{appt.service_name}</Text>
                    <Text style={styles.dayEventSub}>{user?.role === 'cliente' ? appt.provider_name : appt.client_name}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={18} color={Colors.onPrimary + 'AA'} />
                </Pressable>
              ))}
            </View>
          )}
        </LinearGradient>

        {/* Próximos dias */}
        <View style={styles.nextSection}>
          <View style={styles.nextHeader}>
            <Text style={styles.nextTitle}>Próximos Dias</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nextScroll}>
            {nextDays.map(d => (
              <Pressable key={d.dateStr} style={styles.nextCard} onPress={() => {
                const parsed = new Date(d.dateStr + 'T12:00:00');
                setViewDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
                setSelectedDate(d.dateStr);
              }}>
                <Text style={styles.nextLabel}>{d.label}</Text>
                <Text style={styles.nextDay}>{d.dayNum}</Text>
                <Text style={styles.nextCount}>{d.count > 0 ? `${d.count} Agendamento${d.count > 1 ? 's' : ''}` : 'Livre'}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* FAB — clientes apenas */}
      {user?.role === 'cliente' && (
        <Pressable style={styles.fab} onPress={() => router.push('/(tabs)/explore' as any)}>
          <LinearGradient colors={GradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fabGradient}>
            <MaterialIcons name="add" size={20} color={Colors.onPrimary} />
            <Text style={styles.fabLabel}>Agendar Novo Serviço</Text>
          </LinearGradient>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  topTitle: { fontFamily: FontFamily.headlineBold, fontSize: 18, color: Colors.onSurface, letterSpacing: -0.4 },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100, gap: Spacing.xxl },

  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthTitle: { fontFamily: FontFamily.headlineExtraBold, fontSize: 24, color: Colors.onSurface, letterSpacing: -0.6 },
  monthSub: { fontFamily: FontFamily.bodyRegular, fontSize: 13, color: Colors.onSurfaceVariant },
  monthNav: { flexDirection: 'row', gap: Spacing.xs },
  monthNavBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },

  calCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.base, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12 },
  weekdays: { flexDirection: 'row' },
  weekdayLabel: { flex: 1, textAlign: 'center', fontFamily: FontFamily.bodySemiBold, fontSize: 10, color: Colors.outline, textTransform: 'uppercase', letterSpacing: 1 },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: `${100 / 7}%` as any, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  calCellSel: {},
  calDay: { fontFamily: FontFamily.bodyMedium, fontSize: 14, color: Colors.onSurface, width: 36, height: 36, textAlign: 'center', lineHeight: 36, borderRadius: 18 },
  calDayOut: { color: Colors.outlineVariant },
  calDaySelected: { backgroundColor: Colors.primary, color: Colors.onPrimary, fontFamily: FontFamily.headlineBold, overflow: 'hidden' },
  calDayToday: { color: Colors.primary, fontFamily: FontFamily.headlineBold },
  calDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary },

  legend: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xl, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.surfaceContainer, paddingTop: Spacing.base },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: 10, color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.8 },

  dayCard: { borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.md },
  dayCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  dayCardDate: { fontFamily: FontFamily.headlineExtraBold, fontSize: 28, color: Colors.onPrimary, letterSpacing: -0.8 },
  dayCardWeekday: { fontFamily: FontFamily.bodyMedium, fontSize: 16, color: Colors.onPrimary + 'CC' },
  dayCardIcon: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  dayCardBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start', paddingHorizontal: Spacing.base, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  dayCardBadgeText: { fontFamily: FontFamily.bodyMedium, fontSize: 12, color: Colors.onPrimary, textTransform: 'uppercase', letterSpacing: 1 },
  dayCardEmpty: { fontFamily: FontFamily.bodyRegular, fontSize: 14, color: Colors.onPrimary + 'AA', fontStyle: 'italic' },

  dayEvents: { gap: Spacing.sm },
  dayEvent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base, backgroundColor: 'rgba(255,255,255,0.1)', padding: Spacing.base, borderRadius: Radius.xl },
  dayEventTime: { minWidth: 48, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm, borderRadius: Radius.md },
  dayEventTimeText: { fontFamily: FontFamily.headlineBold, fontSize: 12, color: Colors.onPrimary },
  dayEventInfo: { flex: 1 },
  dayEventName: { fontFamily: FontFamily.headlineBold, fontSize: 14, color: Colors.onPrimary },
  dayEventSub: { fontFamily: FontFamily.bodyRegular, fontSize: 12, color: Colors.onPrimary + 'BB' },

  nextSection: { gap: Spacing.md },
  nextHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nextTitle: { fontFamily: FontFamily.headlineExtraBold, fontSize: 18, color: Colors.onSurface, letterSpacing: -0.3 },
  nextScroll: { gap: Spacing.md, paddingBottom: Spacing.xs },
  nextCard: { width: 120, backgroundColor: Colors.surfaceContainerLow, borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.xs },
  nextLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: 10, color: Colors.outline, textTransform: 'uppercase' },
  nextDay: { fontFamily: FontFamily.headlineExtraBold, fontSize: 28, color: Colors.onSurface, letterSpacing: -0.6 },
  nextCount: { fontFamily: FontFamily.bodyRegular, fontSize: 12, color: Colors.onSurfaceVariant },

  fab: { position: 'absolute', bottom: 90, right: Spacing.xl, borderRadius: Radius.full, overflow: 'hidden', elevation: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
  fabGradient: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xl, height: 52 },
  fabLabel: { fontFamily: FontFamily.headlineBold, fontSize: 14, color: Colors.onPrimary },
});

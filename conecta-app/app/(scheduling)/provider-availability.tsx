import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { availabilityApi, AvailabilityDay } from '@/services/api';

const DAY_LABELS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

type DayConfig = {
  day_of_week: number;
  label: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

function makeDefaultDays(): DayConfig[] {
  return DAY_LABELS.map((label, i) => ({
    day_of_week: i,
    label,
    start_time: '08:00',
    end_time: '18:00',
    is_active: i >= 1 && i <= 5,
  }));
}

function mergeWithApi(apiDays: AvailabilityDay[]): DayConfig[] {
  return makeDefaultDays().map(def => {
    const api = apiDays.find(d => d.day_of_week === def.day_of_week);
    if (!api) return def;
    return {
      ...def,
      start_time: api.start_time ?? def.start_time,
      end_time: api.end_time ?? def.end_time,
      is_active: api.is_active,
    };
  });
}

export default function ProviderAvailabilityScreen() {
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();
  const [days, setDays] = useState<DayConfig[]>(makeDefaultDays());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !token) return;
    availabilityApi.get(user.id, token)
      .then(apiDays => setDays(mergeWithApi(apiDays)))
      .catch(() => {});
  }, [user?.id, token]);

  const updateDay = (idx: number, patch: Partial<DayConfig>) => {
    setDays(prev => prev.map((d, i) => i === idx ? { ...d, ...patch } : d));
  };

  const handleSave = async () => {
    if (!user || !token) return;

    for (const d of days) {
      if (d.is_active) {
        if (!d.start_time.trim() || !d.end_time.trim()) {
          Alert.alert('Horário inválido', `Preencha os horários de ${d.label}.`);
          return;
        }
        const [sh, sm] = d.start_time.split(':').map(Number);
        const [eh, em] = d.end_time.split(':').map(Number);
        if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) {
          Alert.alert('Horário inválido', `Verifique os horários de ${d.label}.`);
          return;
        }
        if (sh > 23 || sm > 59 || eh > 23 || em > 59) {
          Alert.alert('Horário inválido', `Horário fora do intervalo válido em ${d.label}.`);
          return;
        }
        if (sh * 60 + sm >= eh * 60 + em) {
          Alert.alert('Horário inválido', `O horário de início deve ser anterior ao fim em ${d.label}.`);
          return;
        }
      }
    }

    const normalise = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    setSaving(true);
    try {
      await availabilityApi.update(user.id, days.map(d => ({
        day_of_week: d.day_of_week,
        start_time: d.is_active ? normalise(d.start_time) : d.start_time,
        end_time: d.is_active ? normalise(d.end_time) : d.end_time,
        is_active: d.is_active,
      })), token);
      Alert.alert('Disponibilidade salva', 'Suas configurações foram atualizadas.');
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Minha Disponibilidade" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.hint}>
          Configure os dias e horários em que você está disponível para atender clientes.
        </Text>

        {days.map((day, idx) => (
          <View key={day.day_of_week} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>{day.label}</Text>
              <Switch
                value={day.is_active}
                onValueChange={v => updateDay(idx, { is_active: v })}
                trackColor={{ false: Colors.border, true: Colors.brand }}
                thumbColor="#ffffff"
                ios_backgroundColor={Colors.border}
              />
            </View>

            {day.is_active ? (
              <View style={styles.timeRow}>
                <View style={styles.timeField}>
                  <Text style={styles.timeLabel}>INÍCIO</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={day.start_time}
                    onChangeText={v => updateDay(idx, { start_time: v })}
                    placeholder="08:00"
                    placeholderTextColor={Colors.inkMuted}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
                <Text style={styles.timeSep}>→</Text>
                <View style={styles.timeField}>
                  <Text style={styles.timeLabel}>FIM</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={day.end_time}
                    onChangeText={v => updateDay(idx, { end_time: v })}
                    placeholder="18:00"
                    placeholderTextColor={Colors.inkMuted}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
              </View>
            ) : (
              <Text style={styles.unavailableText}>Indisponível</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 8, Spacing.xl) }]}>
        <GradientButton
          label={saving ? 'Salvando...' : 'Salvar Disponibilidade'}
          onPress={handleSave}
          disabled={saving}
          style={styles.saveBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxl, paddingBottom: 120, gap: Spacing.md },
  hint: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.inkMuted,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  dayCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.base,
  },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 15,
    color: Colors.ink,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  timeField: { flex: 1, gap: Spacing.xs },
  timeLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.inkMuted,
    letterSpacing: 1.2,
  },
  timeInput: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.ink,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    textAlign: 'center',
  },
  timeSep: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.border,
    marginTop: Spacing.xl,
  },
  unavailableText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.border,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    backgroundColor: Colors.surface,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtn: { height: 56 },
});

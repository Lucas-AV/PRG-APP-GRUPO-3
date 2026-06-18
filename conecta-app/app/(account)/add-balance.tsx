import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable,
  StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { cardsApi, Card } from '@/services/api';

type PaymentMethod = 'pix' | 'card' | 'boleto';
const QUICK_VALUES = [50, 100, 200, 500];

function formatCurrency(digits: string): string {
  const cents = parseInt(digits || '0', 10);
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function AddBalanceScreen() {
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();

  const [rawDigits, setRawDigits] = useState('');
  const [activeChip, setActiveChip] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cards, setCards] = useState<Card[]>([]);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!user || !token) return;
    cardsApi.list(user.id, token).then(setCards).catch(() => setCards([]));
  }, [user, token]);

  const handleAmountChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    setRawDigits(digits);
    setActiveChip(null);
  };

  const handleChipPress = (value: number) => {
    setRawDigits(String(value * 100));
    setActiveChip(value);
  };

  const amountCents = parseInt(rawDigits || '0', 10);
  const displayValue = rawDigits ? formatCurrency(rawDigits) : '';

  const handleConfirm = () => {
    if (!amountCents) return;
    setConfirming(true);
    // TODO: replace with real deposit API call when backend is ready
    setTimeout(() => {
      setConfirming(false);
      Alert.alert(
        'Depósito realizado!',
        'Seu saldo será atualizado em instantes.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    }, 1500);
  };

  const firstCard = cards[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Adicionar Saldo" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount Input */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>VALOR A DEPOSITAR</Text>
          <TextInput
            style={styles.amountInput}
            value={displayValue}
            onChangeText={handleAmountChange}
            placeholder="R$ 0,00"
            placeholderTextColor={Colors.brand+'66'}
            keyboardType="numeric"
            textAlign="center"
          />
          <View style={[styles.amountUnderline, amountCents > 0 && styles.amountUnderlineActive]} />
        </View>

        {/* Quick Chips */}
        <View style={styles.chipsRow}>
          {QUICK_VALUES.map(v => (
            <Pressable
              key={v}
              style={({ pressed }) => [
                styles.chip,
                activeChip === v && styles.chipActive,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => handleChipPress(v)}
            >
              <Text style={[styles.chipLabel, activeChip === v && styles.chipLabelActive]}>
                R$ {v}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Payment Method */}
        <View style={styles.methodSection}>
          <Text style={styles.methodTitle}>Selecione a forma de pagamento</Text>

          <MethodOption
            selected={paymentMethod === 'pix'}
            onPress={() => setPaymentMethod('pix')}
            icon="bolt"
            label="Pix"
            subtitle="Aprovação imediata"
            iconBg={Colors.brand+'15'}
            iconColor={Colors.brand}
          />
          <MethodOption
            selected={paymentMethod === 'card'}
            onPress={() => setPaymentMethod('card')}
            icon="credit-card"
            label="Cartão de Crédito"
            subtitle={firstCard ? `${firstCard.brand} final ${firstCard.last_four}` : 'Nenhum cartão salvo'}
            iconBg={Colors.card}
            iconColor={Colors.inkMuted}
          />
          <MethodOption
            selected={paymentMethod === 'boleto'}
            onPress={() => setPaymentMethod('boleto')}
            icon="qr-code-scanner"
            label="Boleto"
            subtitle="Aprovação em até 2 dias úteis"
            iconBg={Colors.card}
            iconColor={Colors.inkMuted}
          />

          <Pressable
            style={({ pressed }) => [styles.newCardBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/(account)/new-card' as any)}
          >
            <MaterialIcons name="add" size={20} color={Colors.inkMuted} />
            <Text style={styles.newCardLabel}>Usar novo cartão</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Fixed Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 8, Spacing.xl) }]}>
        <GradientButton
          label={confirming ? 'Aguarde...' : 'Confirmar Depósito'}
          onPress={handleConfirm}
          disabled={!amountCents || confirming}
        />
      </View>
    </SafeAreaView>
  );
}

type MethodOptionProps = {
  selected: boolean;
  onPress: () => void;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  subtitle: string;
  iconBg: string;
  iconColor: string;
};

function MethodOption({ selected, onPress, icon, label, subtitle, iconBg, iconColor }: MethodOptionProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.methodRow,
        pressed && { backgroundColor: Colors.brand+'08' },
      ]}
      onPress={onPress}
    >
      <View style={[styles.methodIconWrap, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.methodInfo}>
        <Text style={styles.methodLabel}>{label}</Text>
        <Text style={styles.methodSub}>{subtitle}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },

  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: 120,
    gap: Spacing.xxxl,
  },

  // Amount section
  amountSection: { alignItems: 'center', gap: Spacing.sm },
  amountLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.inkMuted,
    letterSpacing: 1.6,
  },
  amountInput: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 48,
    color: Colors.brand,
    letterSpacing: -1.5,
    minWidth: 200,
    paddingVertical: Spacing.sm,
  },
  amountUnderline: {
    width: '25%',
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.brand+'15',
  },
  amountUnderlineActive: { backgroundColor: Colors.brand },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  chipActive: {
    backgroundColor: Colors.brand+'15',
    borderWidth: 1,
    borderColor: Colors.brand,
  },
  chipLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.ink,
  },
  chipLabelActive: { color: Colors.ink },

  // Method section
  methodSection: { gap: Spacing.md },
  methodTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 18,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    padding: Spacing.base + 4,
    borderRadius: Radius.xl,
    backgroundColor: Colors.card,
  },
  methodIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: { flex: 1 },
  methodLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 15,
    color: Colors.ink,
  },
  methodSub: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.brand,
    backgroundColor: Colors.brand,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.onPrimary,
  },

  // New card button
  newCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.base,
    marginTop: Spacing.xs,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.border,
  },
  newCardLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.inkMuted,
  },

  // Footer
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
});

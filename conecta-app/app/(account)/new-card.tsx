import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GradientButton } from '@/components/ui/gradient-button';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { cardsApi } from '@/services/api';

const CARD_WIDTH = Dimensions.get('window').width - Spacing.xl * 2;
const CARD_HEIGHT = CARD_WIDTH / 1.586;

function formatCardNumber(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  if (digits.length === 2) return `${digits}/`;
  return digits;
}

function detectBrand(number: string): string {
  const digits = number.replace(/\s/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]\d|7[01])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^6(?:011|5)/.test(digits)) return 'Discover';
  return 'Outro';
}

export default function NewCardScreen() {
  const { user, token } = useAuth();
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [loading, setLoading] = useState(false);

  const displayedNumber = cardNumber || '•••• •••• •••• ••••';
  const displayedName = cardName ? cardName.toUpperCase() : 'SEU NOME AQUI';
  const displayedExpiry = expiry || 'MM/AA';

  const handleSave = async () => {
    if (!cardNumber || !cardName || !expiry || !cvv) {
      return Alert.alert('Atenção', 'Preencha todos os campos para continuar.');
    }
    if (!user || !token) return;

    const digits = cardNumber.replace(/\s/g, '');
    const last_four = digits.slice(-4);
    const brand = detectBrand(cardNumber);
    const [expiry_month, expiry_year] = expiry.split('/');

    if (!expiry_month || !expiry_year) {
      return Alert.alert('Atenção', 'Preencha todos os campos do cartão.');
    }

    setLoading(true);
    try {
      await cardsApi.add(user.id, { brand, last_four, expiry_month, expiry_year }, token);
      Alert.alert('Cartão adicionado', 'Seu cartão foi salvo com sucesso.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível salvar o cartão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Adicionar Cartão" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Live card preview */}
        <LinearGradient
          colors={['#0054d6', '#003894']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cardPreview, { height: CARD_HEIGHT }]}
        >
          <View style={styles.decorTop} />
          <View style={styles.decorBottom} />

          <View style={styles.cardTopRow}>
            <View style={styles.chip}>
              {[0, 1].map(row => (
                <View key={row} style={styles.chipRow}>
                  {[0, 1, 2].map(col => (
                    <View key={col} style={styles.chipCell} />
                  ))}
                </View>
              ))}
            </View>
            <MaterialIcons name="contactless" size={32} color="rgba(255,255,255,0.9)" />
          </View>

          <Text style={styles.cardNumber}>{displayedNumber}</Text>

          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardFieldLabel}>TITULAR</Text>
              <Text style={styles.cardFieldValue}>{displayedName}</Text>
            </View>
            <View style={styles.cardBottomRight}>
              <Text style={styles.cardFieldLabel}>VALIDADE</Text>
              <Text style={styles.cardFieldValue}>{displayedExpiry}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Form */}
        <View style={styles.form}>
          {/* Card number */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Número do Cartão</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={Colors.inkMuted}
                value={cardNumber}
                onChangeText={t => setCardNumber(formatCardNumber(t))}
                keyboardType="number-pad"
                maxLength={19}
              />
              <MaterialIcons name="credit-card" size={20} color={Colors.inkMuted} style={styles.inputIcon} />
            </View>
            <Text style={styles.fieldHint}>Insira os 16 dígitos na frente do seu cartão.</Text>
          </View>

          {/* Cardholder name */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nome do Titular</Text>
            <TextInput
              style={styles.inputSolo}
              placeholder="Como aparece no cartão"
              placeholderTextColor={Colors.inkMuted}
              value={cardName}
              onChangeText={setCardName}
              autoCapitalize="characters"
            />
          </View>

          {/* Expiry + CVV row */}
          <View style={styles.row2}>
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.fieldLabel}>Validade</Text>
              <TextInput
                style={[styles.inputSolo, styles.centered]}
                placeholder="MM/AA"
                placeholderTextColor={Colors.inkMuted}
                value={expiry}
                onChangeText={t => setExpiry(formatExpiry(t))}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.fieldLabel}>CVV</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={[styles.input, styles.centered]}
                  placeholder="•••"
                  placeholderTextColor={Colors.inkMuted}
                  value={cvv}
                  onChangeText={setCvv}
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={3}
                />
                <MaterialIcons name="help-outline" size={18} color={Colors.inkMuted} style={styles.inputIcon} />
              </View>
            </View>
          </View>

          {/* Save toggle */}
          <View style={styles.saveRow}>
            <View style={styles.saveIconWrap}>
              <MaterialIcons name="shield" size={22} color={Colors.brand} />
            </View>
            <View style={styles.saveInfo}>
              <Text style={styles.saveLabel}>Salvar cartão com segurança</Text>
              <Text style={styles.saveSub}>Para pagamentos mais rápidos no futuro</Text>
            </View>
            <Switch
              value={saveCard}
              onValueChange={setSaveCard}
              trackColor={{ false: Colors.border, true: Colors.brand }}
              thumbColor="#ffffff"
              ios_backgroundColor={Colors.border}
            />
          </View>

          <GradientButton label={loading ? 'Salvando...' : 'Salvar Cartão'} onPress={handleSave} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.xxxl,
  },
  cardPreview: {
    borderRadius: 20,
    padding: Spacing.xxl,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  decorTop: {
    position: 'absolute',
    top: -48,
    right: -48,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorBottom: {
    position: 'absolute',
    bottom: -32,
    left: -32,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(218,225,255,0.15)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chip: {
    width: 44,
    height: 34,
    backgroundColor: 'rgba(250,204,21,0.9)',
    borderRadius: 6,
    padding: 5,
    gap: 3,
  },
  chipRow: {
    flexDirection: 'row',
    flex: 1,
    gap: 3,
  },
  chipCell: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 1,
  },
  cardNumber: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 20,
    letterSpacing: 4,
    color: '#ffffff',
    marginTop: Spacing.base,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardBottomRight: { alignItems: 'flex-end' },
  cardFieldLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    marginBottom: 2,
  },
  cardFieldValue: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: '#ffffff',
    letterSpacing: 1,
  },
  form: { gap: Spacing.xl },
  field: { gap: Spacing.xs },
  flex1: { flex: 1 },
  fieldLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.ink,
    marginLeft: Spacing.xs,
  },
  fieldHint: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.inkMuted,
    marginLeft: Spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: Spacing.base,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 15,
    color: Colors.ink,
  },
  inputSolo: {
    height: 52,
    paddingHorizontal: Spacing.base,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 15,
    color: Colors.ink,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: { marginRight: Spacing.base },
  centered: { textAlign: 'center' },
  row2: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brand + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveInfo: { flex: 1, gap: 2 },
  saveLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.ink,
  },
  saveSub: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.inkMuted,
  },
});

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

const CARD_WIDTH = Dimensions.get('window').width - Spacing.xl * 2;
const CARD_HEIGHT = CARD_WIDTH / 1.586;

const CARD_TRANSACTIONS = [
  { id: '1', icon: 'build' as const, iconBg: '#eff6ff', iconColor: '#2563eb', title: 'Encanador Profissional', date: 'Ontem • 14:30', amount: 'R$ 180,00' },
  { id: '2', icon: 'brush' as const, iconBg: '#f5f3ff', iconColor: '#7c3aed', title: 'Limpeza Residencial', date: '12 Set 2023', amount: 'R$ 150,00' },
  { id: '3', icon: 'flash-on' as const, iconBg: '#eff6ff', iconColor: '#2563eb', title: 'Reparo Elétrico', date: '05 Set 2023', amount: 'R$ 120,00' },
];

const INFO_ROWS = [
  { label: 'Bandeira', icon: 'credit-card' as const },
  { label: 'Número', icon: 'dialpad' as const },
  { label: 'Validade', icon: 'event' as const },
  { label: 'Tipo', icon: 'category' as const },
];

export default function CardDetailScreen() {
  const { brand = 'Visa', last4 = '1234', expiry = '08/27' } = useLocalSearchParams<{
    brand: string;
    last4: string;
    expiry: string;
  }>();

  const [isDefault, setIsDefault] = useState(false);

  const infoValues = [
    brand as string,
    `•••• •••• •••• ${last4}`,
    expiry as string,
    'Crédito',
  ];

  const handleRemove = () => {
    Alert.alert(
      'Remover cartão',
      `Tem certeza que deseja remover o ${brand} final ${last4}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Detalhes do Cartão" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Card visual */}
        <LinearGradient
          colors={['#0054d6', '#003894']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cardVisual, { height: CARD_HEIGHT }]}
        >
          <View style={styles.decorTop} />
          <View style={styles.decorBottom} />

          {/* Top row: chip + brand */}
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
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>{brand}</Text>
            </View>
          </View>

          {/* Masked number */}
          <Text style={styles.cardNumber}>•••• •••• •••• {last4}</Text>

          {/* Bottom row */}
          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardFieldLabel}>TITULAR</Text>
              <Text style={styles.cardFieldValue}>TITULAR DO CARTÃO</Text>
            </View>
            <View style={styles.cardBottomRight}>
              <Text style={styles.cardFieldLabel}>VALIDADE</Text>
              <Text style={styles.cardFieldValue}>{expiry}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Card info rows */}
        <View style={styles.infoCard}>
          {INFO_ROWS.map((row, idx) => (
            <View
              key={row.label}
              style={[styles.infoRow, idx < INFO_ROWS.length - 1 && styles.infoRowBorder]}
            >
              <View style={styles.infoIconWrap}>
                <MaterialIcons name={row.icon} size={18} color={Colors.onSurfaceVariant} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{infoValues[idx]}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Default card toggle */}
        <View style={styles.preferenceCard}>
          <View style={styles.preferenceIconWrap}>
            <MaterialIcons name="star" size={20} color={Colors.primary} />
          </View>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceLabel}>Cartão padrão</Text>
            <Text style={styles.preferenceSub}>Usar automaticamente em novos pagamentos</Text>
          </View>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primary }}
            thumbColor="#ffffff"
            ios_backgroundColor={Colors.surfaceContainerHighest}
          />
        </View>

        {/* Recent usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uso Recente</Text>
          <View style={styles.transactionsCard}>
            {CARD_TRANSACTIONS.map((tx, idx) => (
              <View key={tx.id}>
                <Pressable
                  style={({ pressed }) => [
                    styles.txRow,
                    pressed && { backgroundColor: Colors.surfaceContainerLow },
                  ]}
                  onPress={() => router.push('/(account)/receipt' as any)}
                >
                  <View style={[styles.txIconWrap, { backgroundColor: tx.iconBg }]}>
                    <MaterialIcons name={tx.icon} size={18} color={tx.iconColor} />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>{tx.title}</Text>
                    <Text style={styles.txDate}>{tx.date}</Text>
                  </View>
                  <Text style={styles.txAmount}>{tx.amount}</Text>
                </Pressable>
                {idx < CARD_TRANSACTIONS.length - 1 && <View style={styles.txDivider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Remove card */}
        <View style={styles.dangerZone}>
          <Pressable
            style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.7 }]}
            onPress={handleRemove}
          >
            <MaterialIcons name="delete-outline" size={20} color={Colors.error} />
            <Text style={styles.removeBtnLabel}>Remover Cartão</Text>
          </Pressable>
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

  // Card visual
  cardVisual: {
    borderRadius: 20,
    padding: Spacing.xxl,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#0054d6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  decorTop: {
    position: 'absolute',
    top: -48,
    right: -48,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorBottom: {
    position: 'absolute',
    bottom: -32,
    left: -32,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(218,225,255,0.12)',
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
  chipRow: { flexDirection: 'row', flex: 1, gap: 3 },
  chipCell: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 1 },
  brandBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  brandBadgeText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: '#ffffff',
    letterSpacing: 0.5,
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
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 2,
    marginBottom: 2,
  },
  cardFieldValue: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: '#ffffff',
    letterSpacing: 0.5,
  },

  // Info card
  infoCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  infoRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.onSurface,
    letterSpacing: 0.2,
  },

  // Default toggle
  preferenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  preferenceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceInfo: { flex: 1, gap: 2 },
  preferenceLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  preferenceSub: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },

  // Recent usage
  section: { gap: Spacing.base },
  sectionTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 20,
    color: Colors.onSurface,
    letterSpacing: -0.4,
  },
  transactionsCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    padding: Spacing.base,
  },
  txIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: { flex: 1, gap: 2 },
  txTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  txDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  txAmount: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  txDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.surfaceContainerLow,
    marginHorizontal: Spacing.base,
  },

  // Danger zone
  dangerZone: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.surfaceContainerHigh,
    paddingTop: Spacing.xl,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.error + '33',
    borderRadius: Radius.md,
    backgroundColor: Colors.errorContainer + '15',
  },
  removeBtnLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 15,
    color: Colors.error,
  },
});

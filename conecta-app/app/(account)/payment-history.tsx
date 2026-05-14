import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

type Filter = 'mes' | 'trimestre' | 'ano';
type TxStatus = 'Concluído' | 'Pendente' | 'Cancelado';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'mes', label: 'Este Mês' },
  { key: 'trimestre', label: 'Últimos 3 Meses' },
  { key: 'ano', label: '2023' },
];

interface Transaction {
  id: string;
  icon: 'flash-on' | 'brush' | 'build' | 'ac-unit';
  iconBg: string;
  iconColor: string;
  title: string;
  date: string;
  amount: string;
  status: TxStatus;
}

const TRANSACTION_GROUPS: { month: string; transactions: Transaction[] }[] = [
  {
    month: 'Janeiro 2024',
    transactions: [
      {
        id: '1',
        icon: 'flash-on',
        iconBg: '#eff6ff',
        iconColor: '#2563eb',
        title: 'Reparo Elétrico — João Silva',
        date: '15 Jan, 14:30',
        amount: 'R$ 150,00',
        status: 'Concluído',
      },
      {
        id: '2',
        icon: 'brush',
        iconBg: '#f5f3ff',
        iconColor: '#7c3aed',
        title: 'Limpeza Residencial — Ana Clara',
        date: '12 Jan, 09:00',
        amount: 'R$ 220,00',
        status: 'Pendente',
      },
    ],
  },
  {
    month: 'Dezembro 2023',
    transactions: [
      {
        id: '3',
        icon: 'build',
        iconBg: '#fff1f2',
        iconColor: '#e11d48',
        title: 'Reparo Hidráulico — Marcos Lima',
        date: '28 Dez, 16:15',
        amount: 'R$ 380,00',
        status: 'Cancelado',
      },
      {
        id: '4',
        icon: 'ac-unit',
        iconBg: '#eff6ff',
        iconColor: '#2563eb',
        title: 'Manutenção Ar-Condicionado',
        date: '20 Dez, 10:30',
        amount: 'R$ 490,00',
        status: 'Concluído',
      },
    ],
  },
];

const STATUS_STYLE: Record<TxStatus, { bg: string; text: string }> = {
  'Concluído': { bg: '#f0fdf4', text: '#16a34a' },
  'Pendente': { bg: '#fffbeb', text: '#d97706' },
  'Cancelado': { bg: '#fff1f2', text: '#e11d48' },
};

export default function PaymentHistoryScreen() {
  const [filter, setFilter] = useState<Filter>('mes');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Histórico de Pagamentos" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryInner}>
            <Text style={styles.summaryLabel}>Total Gasto este mês</Text>
            <View style={styles.summaryAmountRow}>
              <Text style={styles.summaryAmount}>R$ 1.240,00</Text>
              <View style={styles.trendBadge}>
                <MaterialIcons name="trending-up" size={14} color="#16a34a" />
                <Text style={styles.trendText}>+5%</Text>
              </View>
            </View>
          </View>
          <View style={styles.summaryDecor} />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTERS.map(f => (
            <Pressable
              key={f.key}
              style={[styles.chip, filter === f.key && styles.chipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.chipLabel, filter === f.key && styles.chipLabelActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Transaction groups */}
        <View style={styles.groups}>
          {TRANSACTION_GROUPS.map(group => (
            <View key={group.month} style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupMonth}>{group.month}</Text>
                <View style={styles.groupDivider} />
              </View>
              <View style={styles.groupTransactions}>
                {group.transactions.map((tx, idx) => {
                  const s = STATUS_STYLE[tx.status];
                  return (
                    <View
                      key={tx.id}
                      style={[
                        styles.txItem,
                        idx < group.transactions.length - 1 && styles.txItemBorder,
                      ]}
                    >
                      <View style={[styles.txIconBox, { backgroundColor: tx.iconBg }]}>
                        <MaterialIcons name={tx.icon} size={22} color={tx.iconColor} />
                      </View>
                      <View style={styles.txInfo}>
                        <Text style={styles.txTitle}>{tx.title}</Text>
                        <Text style={styles.txDate}>{tx.date}</Text>
                      </View>
                      <View style={styles.txRight}>
                        <Text style={styles.txAmount}>{tx.amount}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                          <Text style={[styles.statusText, { color: s.text }]}>
                            {tx.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
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
  summaryCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 20,
    elevation: 1,
  },
  summaryInner: { gap: Spacing.sm },
  summaryLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  summaryAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  summaryAmount: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 32,
    color: Colors.onSurface,
    letterSpacing: -1,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  trendText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 11,
    color: '#16a34a',
  },
  summaryDecor: {
    position: 'absolute',
    right: -16,
    bottom: -16,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary + '0D',
  },
  filtersRow: {
    gap: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  chipActive: { backgroundColor: Colors.primary },
  chipLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  chipLabelActive: { color: '#ffffff' },
  groups: { gap: Spacing.xxxl },
  group: { gap: Spacing.base },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  groupMonth: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  groupDivider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 1,
  },
  groupTransactions: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    padding: Spacing.base,
  },
  txItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  txIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: { flex: 1, gap: 3 },
  txTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  txDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  txRight: { alignItems: 'flex-end', gap: Spacing.xs },
  txAmount: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  statusText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
});

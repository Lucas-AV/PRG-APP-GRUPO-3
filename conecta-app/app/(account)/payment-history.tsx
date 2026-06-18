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
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { transactionsApi, Transaction } from '@/services/api';

type Filter = 'mes' | 'trimestre' | 'ano';
type TxStatus = 'Concluído' | 'Pendente' | 'Cancelado';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'mes', label: 'Este Mês' },
  { key: 'trimestre', label: 'Últimos 3 Meses' },
  { key: 'ano', label: '2023' },
];

const STATUS_MAP: Record<string, TxStatus> = {
  concluido: 'Concluído',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
};

const STATUS_STYLE: Record<TxStatus, { bg: string; text: string }> = {
  'Concluído': { bg: '#f0fdf4', text: '#16a34a' },
  'Pendente': { bg: '#fffbeb', text: '#d97706' },
  'Cancelado': { bg: '#fff1f2', text: '#e11d48' },
};

export default function PaymentHistoryScreen() {
  const { user, token } = useAuth();
  const [filter, setFilter] = useState<Filter>('mes');
  const [groups, setGroups] = useState<{ month: string; transactions: Transaction[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) return;
    transactionsApi.list(user.id, token)
      .then(txs => {
        // Group by month
        const map = new Map<string, Transaction[]>();
        for (const tx of txs) {
          const d = new Date(tx.paid_at);
          const key = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
          const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
          if (!map.has(capitalized)) map.set(capitalized, []);
          map.get(capitalized)!.push(tx);
        }
        setGroups(Array.from(map.entries()).map(([month, transactions]) => ({ month, transactions })));
      })
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, [user, token]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={Colors.brand} />;

  const thisMonth = groups[0]?.transactions.reduce((sum, tx) => sum + tx.amount, 0) ?? 0;
  const totalLabel = `R$ ${thisMonth.toFixed(2).replace('.', ',')}`;

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
              <Text style={styles.summaryAmount}>{totalLabel}</Text>
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
          {groups.map(group => (
            <View key={group.month} style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupMonth}>{group.month}</Text>
                <View style={styles.groupDivider} />
              </View>
              <View style={styles.groupTransactions}>
                {group.transactions.map((tx, idx) => {
                  const status = STATUS_MAP[tx.status] ?? 'Concluído';
                  const s = STATUS_STYLE[status];
                  const title = tx.provider_name
                    ? `${tx.service_name} — ${tx.provider_name}`
                    : tx.service_name;
                  const amount = `R$ ${tx.amount.toFixed(2).replace('.', ',')}`;
                  const date = new Date(tx.paid_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <Pressable
                      key={tx.id}
                      style={({ pressed }) => [
                        styles.txItem,
                        idx < group.transactions.length - 1 && styles.txItemBorder,
                        pressed && { backgroundColor: Colors.brand+'08' },
                      ]}
                      onPress={() => router.push('/(account)/receipt' as any)}
                    >
                      <View style={[styles.txIconBox, { backgroundColor: '#eff6ff' }]}>
                        <MaterialIcons name="build" size={22} color="#2563eb" />
                      </View>
                      <View style={styles.txInfo}>
                        <Text style={styles.txTitle}>{title}</Text>
                        <Text style={styles.txDate}>{date}</Text>
                      </View>
                      <View style={styles.txRight}>
                        <Text style={styles.txAmount}>{amount}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                          <Text style={[styles.statusText, { color: s.text }]}>
                            {status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
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
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    overflow: 'hidden',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 20,
    elevation: 1,
  },
  summaryInner: { gap: Spacing.sm },
  summaryLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.inkMuted,
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
    color: Colors.ink,
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
    backgroundColor: Colors.brand+'08',
  },
  filtersRow: {
    gap: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.brand },
  chipLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.inkMuted,
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
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  groupDivider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
    borderRadius: 1,
  },
  groupTransactions: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: Colors.ink,
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
    borderBottomColor: Colors.border,
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
    color: Colors.ink,
  },
  txDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  txRight: { alignItems: 'flex-end', gap: Spacing.xs },
  txAmount: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 14,
    color: Colors.ink,
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

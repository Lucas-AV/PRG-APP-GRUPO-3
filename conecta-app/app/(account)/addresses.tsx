import { useState, useCallback } from 'react';
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
import { router, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usersApi, Address } from '@/services/api';

const TYPE_ICON: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  casa: 'home',
  trabalho: 'work',
  outro: 'more-horiz',
};

const TYPE_LABEL: Record<string, string> = {
  casa: 'Casa',
  trabalho: 'Trabalho',
  outro: 'Outro',
};

export default function AddressesScreen() {
  const { user, token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    usersApi.listAddresses(user.id, token)
      .then(setAddresses)
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar os endereços.'))
      .finally(() => setLoading(false));
  }, [user, token]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleDelete = (id: number) => {
    if (!user || !token) return;
    Alert.alert(
      'Remover endereço',
      'Tem certeza que deseja remover este endereço?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await usersApi.deleteAddress(user.id, id, token);
              setAddresses(prev => prev.filter(a => a.id !== id));
            } catch (e: any) {
              Alert.alert('Erro', e.message ?? 'Não foi possível remover.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (address: Address) => {
    router.push({
      pathname: '/(account)/add-address' as any,
      params: {
        id: String(address.id),
        type: address.type,
        zip_code: address.zip_code ?? '',
        street: address.street,
        number: address.number ?? '',
        complement: address.complement ?? '',
        neighborhood: address.neighborhood ?? '',
        city: address.city,
        state: address.state,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Endereços" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="location-off" size={48} color={Colors.outlineVariant} />
          <Text style={styles.emptyTitle}>Nenhum endereço cadastrado</Text>
          <Text style={styles.emptySubtitle}>Toque em "+" para adicionar um endereço.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {addresses.map(address => (
            <View key={address.id} style={styles.card}>
              <View style={styles.cardIcon}>
                <MaterialIcons
                  name={TYPE_ICON[address.type] ?? 'location-on'}
                  size={22}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardType}>{TYPE_LABEL[address.type] ?? address.type}</Text>
                <Text style={styles.cardStreet}>
                  {address.street}{address.number ? `, ${address.number}` : ''}
                </Text>
                {address.neighborhood ? (
                  <Text style={styles.cardDetail}>{address.neighborhood}</Text>
                ) : null}
                <Text style={styles.cardDetail}>{address.city} · {address.state}</Text>
              </View>
              <View style={styles.cardActions}>
                <Pressable onPress={() => handleEdit(address)} style={styles.actionBtn}>
                  <MaterialIcons name="edit" size={20} color={Colors.outline} />
                </Pressable>
                <Pressable onPress={() => handleDelete(address.id)} style={styles.actionBtn}>
                  <MaterialIcons name="delete-outline" size={20} color={Colors.error} />
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
        onPress={() => router.push('/(account)/add-address' as any)}
      >
        <MaterialIcons name="add" size={28} color={Colors.onPrimary} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xxxl,
  },
  list: {
    padding: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl * 3,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.base,
    gap: Spacing.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 2 },
  cardType: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardStreet: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  cardDetail: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  cardActions: { flexDirection: 'row', gap: Spacing.xs },
  actionBtn: { padding: Spacing.sm },
  emptyTitle: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: 16,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xxxl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

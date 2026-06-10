import { useState, useCallback, useMemo } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [defaultId, setDefaultId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await usersApi.listAddresses(user.id, token);
      setAddresses(list);

      const stored = await AsyncStorage.getItem(`@default_address_id_${user.id}`);
      if (stored) {
        setDefaultId(Number(stored));
      } else if (list.length > 0) {
        await AsyncStorage.setItem(`@default_address_id_${user.id}`, String(list[0].id));
        setDefaultId(list[0].id);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os endereços.');
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSetDefault = async (addressId: number) => {
    if (!user) return;
    try {
      await AsyncStorage.setItem(`@default_address_id_${user.id}`, String(addressId));
      setDefaultId(addressId);
    } catch {
      Alert.alert('Erro', 'Não foi possível definir o endereço padrão.');
    }
  };

  const sortedAddresses = useMemo(() => {
    if (!defaultId) return addresses;
    return [...addresses].sort((a, b) => {
      if (a.id === defaultId) return -1;
      if (b.id === defaultId) return 1;
      return 0;
    });
  }, [addresses, defaultId]);

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
              if (defaultId === id) {
                await AsyncStorage.removeItem(`@default_address_id_${user.id}`);
                setDefaultId(null);
              }
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
      ) : sortedAddresses.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIconBox}>
            <MaterialIcons name="location-off" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Nenhum endereço cadastrado</Text>
          <Text style={styles.emptySubtitle}>Adicione um endereço para poder contratar e gerenciar seus serviços com facilidade.</Text>
          <Pressable
            style={({ pressed }) => [styles.emptyBtn, pressed && { opacity: 0.9 }]}
            onPress={() => router.push('/(account)/add-address' as any)}
          >
            <Text style={styles.emptyBtnText}>Cadastrar Endereço</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {sortedAddresses.map(address => {
            const isDefault = address.id === defaultId;
            return (
              <Pressable
                key={address.id}
                style={[styles.card, isDefault && styles.cardDefaultActive]}
                onPress={() => handleSetDefault(address.id)}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.cardIcon, isDefault && styles.cardIconDefault]}>
                    <MaterialIcons
                      name={TYPE_ICON[address.type] ?? 'location-on'}
                      size={20}
                      color={isDefault ? Colors.primary : Colors.outline}
                    />
                  </View>
                  <Text style={[styles.cardType, isDefault && styles.cardTypeActive]}>
                    {TYPE_LABEL[address.type] ?? address.type}
                  </Text>
                  {isDefault && (
                    <View style={styles.defaultBadge}>
                      <MaterialIcons name="check" size={10} color={Colors.primary} style={{ marginRight: 2 }} />
                      <Text style={styles.defaultBadgeText}>Padrão</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardStreet}>
                    {address.street}{address.number ? `, ${address.number}` : ''}
                  </Text>
                  <Text style={styles.cardDetail}>
                    {address.neighborhood ? `${address.neighborhood} · ` : ''}{address.city} - {address.state}
                  </Text>
                  {address.complement ? (
                    <Text style={styles.cardComplement}>Compl: {address.complement}</Text>
                  ) : null}
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardFooter}>
                  <Pressable
                    onPress={() => handleEdit(address)}
                    style={styles.footerActionBtn}
                    hitSlop={8}
                  >
                    <MaterialIcons name="edit" size={16} color={Colors.primary} />
                    <Text style={styles.footerActionText}>Editar</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(address.id)}
                    style={styles.footerActionBtn}
                    hitSlop={8}
                  >
                    <MaterialIcons name="delete-outline" size={16} color={Colors.error} />
                    <Text style={[styles.footerActionText, { color: Colors.error }]}>Excluir</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
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
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '22',
  },
  cardDefaultActive: {
    borderColor: Colors.primary + '55',
    backgroundColor: Colors.surfaceContainerLowest,
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconDefault: {
    backgroundColor: Colors.primaryContainer + '40',
  },
  cardBody: {
    paddingLeft: 44,
    gap: 3,
  },
  cardType: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardTypeActive: {
    color: Colors.primary,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryContainer + '40',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginLeft: 'auto',
  },
  defaultBadgeText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.primary,
  },
  cardStreet: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 15,
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  cardDetail: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  cardComplement: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.outlineVariant + '22',
    marginVertical: Spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.xl,
  },
  footerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  footerActionText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.primary,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer + '33',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
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
  emptyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    marginTop: Spacing.xl,
  },
  emptyBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.onPrimary,
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

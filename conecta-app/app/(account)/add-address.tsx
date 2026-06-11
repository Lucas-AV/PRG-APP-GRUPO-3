import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/gradient-button';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { AddressFormFields, AddressValues } from '@/components/ui/address-form-fields';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usersApi } from '@/services/api';

type AddressType = 'casa' | 'trabalho' | 'outro';

const ADDRESS_CHIPS: { key: AddressType; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { key: 'casa', label: 'Casa', icon: 'home' },
  { key: 'trabalho', label: 'Trabalho', icon: 'work' },
  { key: 'outro', label: 'Outro', icon: 'more-horiz' },
];

export default function AddAddressScreen() {
  const { user, token } = useAuth();
  const params = useLocalSearchParams<{
    id?: string;
    type?: AddressType;
    zip_code?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  }>();

  const isEdit = !!params.id;

  const [addressType, setAddressType] = useState<AddressType>(params.type ?? 'casa');
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [values, setValues] = useState<AddressValues>({
    cep: params.zip_code ?? '',
    street: params.street ?? '',
    number: params.number ?? '',
    complement: params.complement ?? '',
    neighborhood: params.neighborhood ?? '',
    city: params.city ?? '',
    state: params.state ?? '',
  });

  const handleSave = async () => {
    if (!values.street || !values.city || !values.state) {
      return Alert.alert('Atenção', 'Rua, cidade e estado são obrigatórios.');
    }
    if (!user || !token) return;
    setLoading(true);
    try {
      const data = {
        type: addressType,
        zip_code: values.cep.trim() || undefined,
        street: values.street,
        number: values.number || '-',
        complement: values.complement || '-',
        neighborhood: values.neighborhood || undefined,
        city: values.city,
        state: values.state,
      };
      if (isEdit) {
        await usersApi.updateAddress(user.id, Number(params.id), data, token);
        Alert.alert('Endereço atualizado', 'As alterações foram salvas.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await usersApi.addAddress(user.id, data, token);
        Alert.alert('Endereço salvo', 'Seu endereço foi cadastrado com sucesso.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível salvar o endereço.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title={isEdit ? 'Editar Endereço' : 'Cadastrar Endereço'} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AddressFormFields
          values={values}
          onChange={patch => setValues(prev => ({ ...prev, ...patch }))}
          onCepLoading={setCepLoading}
          mapHeight={150}
        />

        {/* Tipo */}
        <View style={styles.chipsSection}>
          <Text style={styles.chipsLabel}>SALVAR COMO</Text>
          <View style={styles.chips}>
            {ADDRESS_CHIPS.map(chip => {
              const active = addressType === chip.key;
              return (
                <Pressable
                  key={chip.key}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setAddressType(chip.key)}
                >
                  <MaterialIcons
                    name={chip.icon}
                    size={18}
                    color={active ? Colors.primary : Colors.outline}
                  />
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <GradientButton
          label={loading ? 'Salvando…' : isEdit ? 'Salvar Alterações' : 'Salvar Endereço'}
          onPress={handleSave}
          disabled={loading || cepLoading}
        />
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
  chipsSection: { gap: Spacing.md },
  chipsLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.onSurface,
    letterSpacing: 1.2,
    marginLeft: 2,
  },
  chips: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '22',
  },
  chipActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primary + '33',
  },
  chipLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  chipLabelActive: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.primary,
  },
});

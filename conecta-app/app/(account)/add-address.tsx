import { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/gradient-button';
import { InputField } from '@/components/ui/input-field';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { MapPreview } from '@/components/ui/map-preview';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usersApi } from '@/services/api';

type AddressType = 'casa' | 'trabalho' | 'outro';

const ADDRESS_CHIPS: { key: AddressType; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { key: 'casa', label: 'Casa', icon: 'home' },
  { key: 'trabalho', label: 'Trabalho', icon: 'work' },
  { key: 'outro', label: 'Outro', icon: 'more-horiz' },
];

function formatCep(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

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

  const numberInputRef = useRef<TextInput>(null);
  const [autofilledFields, setAutofilledFields] = useState<Record<string, boolean>>({});

  const [addressType, setAddressType] = useState<AddressType>(params.type ?? 'casa');
  const [cep, setCep] = useState(params.zip_code ?? '');
  const [street, setStreet] = useState(params.street ?? '');
  const [number, setNumber] = useState(params.number ?? '');
  const [complement, setComplement] = useState(params.complement ?? '');
  const [neighborhood, setNeighborhood] = useState(params.neighborhood ?? '');
  const [city, setCity] = useState(params.city ?? '');
  const [state, setState] = useState(params.state ?? '');
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const handleCepChange = (text: string) => {
    const formatted = formatCep(text);
    setCep(formatted);
    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 8) {
      fetchViaCep(digits);
    } else {
      setAutofilledFields({});
    }
  };

  const fetchViaCep = async (digits: string) => {
    if (cepLoading) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        Alert.alert('CEP não encontrado', 'Verifique o CEP informado e preencha os campos manualmente.');
        return;
      }
      setStreet(data.logradouro ?? '');
      setNeighborhood(data.bairro ?? '');
      setCity(data.localidade ?? '');
      setState(data.uf ?? '');
      setAutofilledFields({
        street: !!data.logradouro,
        neighborhood: !!data.bairro,
        city: !!data.localidade,
        state: !!data.uf,
      });

      // Autofocus focus on the Number input automatically
      setTimeout(() => {
        numberInputRef.current?.focus();
      }, 150);
    } catch {
      Alert.alert('Erro', 'Não foi possível consultar o CEP. Preencha os campos manualmente.');
    } finally {
      setCepLoading(false);
    }
  };

  const handleSave = async () => {
    if (!street || !city || !state) {
      return Alert.alert('Atenção', 'Rua, cidade e estado são obrigatórios.');
    }
    if (!user || !token) return;
    setLoading(true);
    try {
      const data = {
        type: addressType,
        zip_code: cep.replace(/\D/g, '') || undefined,
        street,
        number: number || '-',
        complement: complement || '-',
        neighborhood: neighborhood || undefined,
        city,
        state,
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
        {/* Map preview — real OpenStreetMap via Leaflet */}
        <MapPreview
          street={street}
          number={number}
          neighborhood={neighborhood}
          city={city}
          state={state}
          zipCode={cep}
          height={150}
        />

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.cepRow}>
            <View style={{ flex: 1 }}>
              <InputField
                label="CEP"
                placeholder="00000-000"
                value={cep}
                onChangeText={handleCepChange}
                keyboardType="numeric"
                maxLength={9}
              />
            </View>
            {cepLoading && (
              <ActivityIndicator
                color={Colors.primary}
                style={styles.cepSpinner}
              />
            )}
          </View>

          <InputField
            label="Rua"
            placeholder="Nome da rua ou avenida"
            value={street}
            onChangeText={setStreet}
            autoCapitalize="words"
            rightAction={autofilledFields.street ? <MaterialIcons name="check-circle" size={18} color="#10b981" /> : null}
          />

          <View style={styles.row2col}>
            <View style={styles.col5}>
              <InputField
                ref={numberInputRef}
                label="Número"
                placeholder="123"
                value={number}
                onChangeText={setNumber}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.col7}>
              <InputField
                label="Complemento"
                placeholder="Apto, Bloco, etc"
                value={complement}
                onChangeText={setComplement}
              />
            </View>
          </View>

          <InputField
            label="Bairro"
            placeholder="Seu bairro"
            value={neighborhood}
            onChangeText={setNeighborhood}
            autoCapitalize="words"
            rightAction={autofilledFields.neighborhood ? <MaterialIcons name="check-circle" size={18} color="#10b981" /> : null}
          />

          <View style={styles.row2col}>
            <View style={styles.col8}>
              <InputField
                label="Cidade"
                placeholder="Sua cidade"
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
                rightAction={autofilledFields.city ? <MaterialIcons name="check-circle" size={18} color="#10b981" /> : null}
              />
            </View>
            <View style={styles.col4}>
              <InputField
                label="Estado"
                placeholder="UF"
                value={state}
                onChangeText={t => setState(t.toUpperCase())}
                autoCapitalize="characters"
                maxLength={2}
                rightAction={autofilledFields.state ? <MaterialIcons name="check-circle" size={18} color="#10b981" /> : null}
              />
            </View>
          </View>
        </View>

        {/* Chips */}
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
  form: { gap: Spacing.xxl },
  cepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cepSpinner: { marginTop: Spacing.xl },
  row2col: { flexDirection: 'row', gap: Spacing.md },
  col4: { flex: 4 },
  col5: { flex: 5 },
  col7: { flex: 7 },
  col8: { flex: 8 },
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
    borderWidth: 1,
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

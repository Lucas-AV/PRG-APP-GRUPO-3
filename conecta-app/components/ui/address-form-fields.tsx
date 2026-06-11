import { useState, useRef } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { InputField } from '@/components/ui/input-field';
import { MapPreview } from '@/components/ui/map-preview';
import { Colors, Spacing } from '@/constants/theme';

export interface AddressValues {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface AddressFormFieldsProps {
  values: AddressValues;
  onChange: (patch: Partial<AddressValues>) => void;
  onCepLoading?: (loading: boolean) => void;
  mapHeight?: number;
}

export function formatCep(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export function AddressFormFields({
  values,
  onChange,
  onCepLoading,
  mapHeight = 150,
}: AddressFormFieldsProps) {
  const [autofilledFields, setAutofilledFields] = useState<Record<string, boolean>>({});
  const [cepLoading, setCepLoading] = useState(false);
  const numberRef = useRef<TextInput>(null);

  const setLoading = (v: boolean) => {
    setCepLoading(v);
    onCepLoading?.(v);
  };

  const handleCepChange = (text: string) => {
    const formatted = formatCep(text);
    onChange({ cep: formatted });
    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 8) fetchViaCep(digits);
    else setAutofilledFields({});
  };

  const fetchViaCep = async (digits: string) => {
    if (cepLoading) return;
    setLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        Alert.alert('CEP não encontrado', 'Verifique o CEP e preencha os campos manualmente.');
        return;
      }
      onChange({
        street: data.logradouro ?? '',
        neighborhood: data.bairro ?? '',
        city: data.localidade ?? '',
        state: data.uf ?? '',
      });
      setAutofilledFields({
        street: !!data.logradouro,
        neighborhood: !!data.bairro,
        city: !!data.localidade,
        state: !!data.uf,
      });
      setTimeout(() => numberRef.current?.focus(), 150);
    } catch {
      Alert.alert('Erro', 'Não foi possível consultar o CEP. Preencha manualmente.');
    } finally {
      setLoading(false);
    }
  };

  const check = (field: string) =>
    autofilledFields[field]
      ? <MaterialIcons name="check-circle" size={18} color="#10b981" />
      : null;

  return (
    <View style={styles.container}>
      {/* Mapa */}
      <MapPreview
        street={values.street}
        number={values.number}
        neighborhood={values.neighborhood}
        city={values.city}
        state={values.state}
        zipCode={values.cep}
        height={mapHeight}
      />

      {/* CEP */}
      <View style={styles.cepRow}>
        <View style={styles.flex1}>
          <InputField
            label="CEP"
            placeholder="00000-000"
            value={values.cep}
            onChangeText={handleCepChange}
            keyboardType="numeric"
            maxLength={9}
          />
        </View>
        {cepLoading && (
          <ActivityIndicator color={Colors.primary} style={styles.cepSpinner} />
        )}
      </View>

      {/* Rua */}
      <InputField
        label="Endereço"
        placeholder="Rua, Avenida ou Praça"
        value={values.street}
        onChangeText={v => onChange({ street: v })}
        autoCapitalize="words"
        rightAction={check('street')}
      />

      {/* Número + Complemento */}
      <View style={styles.twoCol}>
        <View style={styles.flex5}>
          <InputField
            ref={numberRef}
            label="Número"
            placeholder="123"
            value={values.number}
            onChangeText={v => onChange({ number: v })}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.flex7}>
          <InputField
            label="Complemento"
            placeholder="Apto / Conjunto"
            value={values.complement}
            onChangeText={v => onChange({ complement: v })}
            autoCapitalize="words"
          />
        </View>
      </View>

      {/* Bairro */}
      <InputField
        label="Bairro"
        placeholder="Nome do bairro"
        value={values.neighborhood}
        onChangeText={v => onChange({ neighborhood: v })}
        autoCapitalize="words"
        rightAction={check('neighborhood')}
      />

      {/* Cidade + Estado */}
      <View style={styles.twoCol}>
        <View style={styles.flex8}>
          <InputField
            label="Cidade"
            placeholder="São Paulo"
            value={values.city}
            onChangeText={v => onChange({ city: v })}
            autoCapitalize="words"
            rightAction={check('city')}
          />
        </View>
        <View style={styles.flex4}>
          <InputField
            label="Estado"
            placeholder="UF"
            value={values.state}
            onChangeText={v => onChange({ state: v.toUpperCase() })}
            autoCapitalize="characters"
            maxLength={2}
            rightAction={check('state')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xxl },
  cepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cepSpinner: { marginTop: Spacing.xl },
  twoCol: { flexDirection: 'row', gap: Spacing.md },
  flex1: { flex: 1 },
  flex4: { flex: 4 },
  flex5: { flex: 5 },
  flex7: { flex: 7 },
  flex8: { flex: 8 },
});

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/gradient-button';
import { InputField } from '@/components/ui/input-field';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

type AddressType = 'casa' | 'trabalho' | 'outro';

const ADDRESS_CHIPS: { key: AddressType; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { key: 'casa', label: 'Casa', icon: 'home' },
  { key: 'trabalho', label: 'Trabalho', icon: 'work' },
  { key: 'outro', label: 'Outro', icon: 'more-horiz' },
];

export default function AddAddressScreen() {
  const [addressType, setAddressType] = useState<AddressType>('casa');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const handleSave = () =>
    Alert.alert('Endereço salvo', 'Seu endereço foi cadastrado com sucesso.', [{ text: 'OK' }]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Cadastrar Endereço" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Map placeholder */}
        <View style={styles.mapSection}>
          <View style={styles.mapBox}>
            <MaterialIcons name="location-on" size={40} color={Colors.primary} />
          </View>
          <View style={styles.mapNote}>
            <MaterialIcons name="my-location" size={14} color={Colors.outline} />
            <Text style={styles.mapNoteText}>Sua localização atual aproximada</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <InputField
            label="CEP"
            placeholder="00000-000"
            value={cep}
            onChangeText={setCep}
            keyboardType="numeric"
          />

          <InputField
            label="Rua"
            placeholder="Nome da rua ou avenida"
            value={street}
            onChangeText={setStreet}
            autoCapitalize="words"
          />

          <View style={styles.row2col}>
            <View style={styles.col5}>
              <InputField
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
          />

          <View style={styles.row2col}>
            <View style={styles.col8}>
              <InputField
                label="Cidade"
                placeholder="Sua cidade"
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.col4}>
              <InputField
                label="Estado"
                placeholder="UF"
                value={state}
                onChangeText={t => setState(t.toUpperCase())}
                autoCapitalize="characters"
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

        <GradientButton label="Salvar Endereço" onPress={handleSave} />
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
  mapSection: { gap: Spacing.md },
  mapBox: {
    width: '100%',
    height: 140,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapNote: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  mapNoteText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  form: { gap: Spacing.xxl },
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
    backgroundColor: Colors.surfaceContainerHighest,
  },
  chipActive: {
    backgroundColor: Colors.primaryContainer,
    borderWidth: 1,
    borderColor: Colors.primary + '1A',
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

import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useChronicleStore } from '@/store/chronicleStore';
import { Colors } from '@/constants/theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function CityForm() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const cities = useChronicleStore((s) => s.cities);
  const states = useChronicleStore((s) => s.states);
  const addCity = useChronicleStore((s) => s.addCity);
  const updateCity = useChronicleStore((s) => s.updateCity);

  const existing = isNew ? null : cities.find((c) => c.id === id);
  const [name, setName] = useState(existing?.name ?? '');
  const [stateId, setStateId] = useState(existing?.stateId ?? (states[0]?.id ?? ''));
  const [nameError, setNameError] = useState('');
  const [stateError, setStateError] = useState('');

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('O nome da cidade não pode ser vazio.');
      return;
    }
    if (!stateId) {
      setStateError('Selecione um estado.');
      return;
    }
    if (isNew) {
      addCity({ name: trimmed, stateId });
    } else {
      updateCity(id, { name: trimmed, stateId });
    }
    router.back();
  }

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
      <Input
        label="Nome da Cidade"
        placeholder="ex: Campinas"
        value={name}
        onChangeText={(v) => { setName(v); setNameError(''); }}
        error={nameError}
      />

      <Text
        style={{ fontFamily: 'WorkSans_700Bold', fontSize: 11, color: Colors.onSurfaceVariant, letterSpacing: 1, marginTop: 20, marginBottom: 12 }}
      >
        ESTADO (UF)
      </Text>
      <View style={{ gap: 8, marginBottom: 32 }}>
        {states.map((s) => {
          const active = stateId === s.id;
          return (
            <TouchableOpacity
              key={s.id}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: active ? Colors.primary : Colors.surfaceContainerLow,
                borderRadius: 16, padding: 14,
              }}
              onPress={() => { setStateId(s.id); setStateError(''); }}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={s.name}
            >
              <Text
                style={{
                  fontFamily: 'WorkSans_700Bold', fontSize: 13,
                  color: active ? Colors.onPrimary : Colors.onSurfaceVariant,
                  width: 32,
                }}
              >
                {s.acronym}
              </Text>
              <Text
                style={{
                  fontFamily: 'WorkSans_500Medium', fontSize: 15,
                  color: active ? Colors.onPrimary : Colors.primary,
                }}
              >
                {s.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {stateError !== '' && (
        <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 12, color: Colors.error, marginBottom: 8, marginTop: -4 }}>
          {stateError}
        </Text>
      )}

      <Button
        label={isNew ? 'Criar Cidade' : 'Salvar Alterações'}
        onPress={handleSave}
        variant="primary"
        fullWidth
      />
    </ScrollView>
  );
}

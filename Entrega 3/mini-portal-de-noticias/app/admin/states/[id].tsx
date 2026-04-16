import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useChronicleStore } from '@/store/chronicleStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function StateForm() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const states = useChronicleStore((s) => s.states);
  const addState = useChronicleStore((s) => s.addState);
  const updateState = useChronicleStore((s) => s.updateState);

  const existing = isNew ? null : states.find((s) => s.id === id);
  const [name, setName] = useState(existing?.name ?? '');
  const [acronym, setAcronym] = useState(existing?.acronym ?? '');
  const [nameError, setNameError] = useState('');
  const [acronymError, setAcronymError] = useState('');

  function handleSave() {
    const trimmedName = name.trim();
    const trimmedAcronym = acronym.trim().toUpperCase();
    let valid = true;

    if (!trimmedName) {
      setNameError('O nome do estado não pode ser vazio.');
      valid = false;
    }
    if (trimmedAcronym.length !== 2) {
      setAcronymError('A sigla deve ter exatamente 2 letras.');
      valid = false;
    }
    if (!valid) return;

    if (isNew) {
      addState({ name: trimmedName, acronym: trimmedAcronym });
    } else {
      updateState(id, { name: trimmedName, acronym: trimmedAcronym });
    }
    router.back();
  }

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
      <Input
        label="Nome do Estado"
        placeholder="ex: São Paulo"
        value={name}
        onChangeText={(v) => { setName(v); setNameError(''); }}
        error={nameError}
      />
      <View style={{ height: 12 }} />
      <Input
        label="Sigla (UF)"
        placeholder="ex: SP"
        value={acronym}
        onChangeText={(v) => { setAcronym(v.toUpperCase().slice(0, 2)); setAcronymError(''); }}
        error={acronymError}
        autoCapitalize="characters"
      />
      <View style={{ height: 32 }} />
      <Button
        label={isNew ? 'Criar UF' : 'Salvar Alterações'}
        onPress={handleSave}
        variant="primary"
        fullWidth
      />
    </ScrollView>
  );
}

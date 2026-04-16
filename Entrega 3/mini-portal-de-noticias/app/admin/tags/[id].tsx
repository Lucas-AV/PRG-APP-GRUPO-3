import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useChronicleStore } from '@/store/chronicleStore';
import { Colors } from '@/constants/theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const PRESET_COLORS = [
  '#dc2626', '#2563eb', '#16a34a', '#d97706',
  '#7c3aed', '#db2777', '#0891b2', '#171b22',
];

export default function TagForm() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const tags = useChronicleStore((s) => s.tags);
  const addTag = useChronicleStore((s) => s.addTag);
  const updateTag = useChronicleStore((s) => s.updateTag);

  const existing = isNew ? null : tags.find((t) => t.id === id);

  const [name, setName] = useState(existing?.name ?? '');
  const [colorHex, setColorHex] = useState(existing?.colorHex ?? PRESET_COLORS[0]);
  const [nameError, setNameError] = useState('');

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('O nome da tag não pode ser vazio.');
      return;
    }
    const duplicate = tags.find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase() && t.id !== id
    );
    if (duplicate) {
      setNameError('Esta tag já está cadastrada no sistema.');
      return;
    }
    if (isNew) {
      addTag({ name: trimmed, colorHex });
    } else {
      updateTag(id, { name: trimmed, colorHex });
    }
    router.back();
  }

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
      <Input
        label="Nome da Tag"
        placeholder="ex: Inteligência Artificial"
        value={name}
        onChangeText={(v) => { setName(v); setNameError(''); }}
        error={nameError}
      />

      <Text
        style={{ fontFamily: 'WorkSans_700Bold', fontSize: 11, color: Colors.onSurfaceVariant, letterSpacing: 1, marginTop: 20, marginBottom: 12 }}
      >
        COR
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
        {PRESET_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => setColorHex(color)}
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: color,
              borderWidth: colorHex === color ? 3 : 0,
              borderColor: Colors.primary,
              alignItems: 'center', justifyContent: 'center',
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected: colorHex === color }}
            accessibilityLabel={`Cor ${color}`}
          />
        ))}
      </View>

      {/* Preview */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colorHex, marginRight: 8 }} />
        <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 14, color: Colors.primary }}>
          {name.trim() || 'Nome da tag'}
        </Text>
      </View>

      <Button
        label={isNew ? 'Criar Tag' : 'Salvar Alterações'}
        onPress={handleSave}
        variant="primary"
        fullWidth
      />
    </ScrollView>
  );
}

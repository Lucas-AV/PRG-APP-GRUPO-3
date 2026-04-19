import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useChronicleStore } from '@/store/chronicleStore';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function EditProfile() {
  const { currentUser, updateUserProfile } = useChronicleStore();

  const [name, setName] = useState(currentUser?.name ?? '');
  const [bio, setBio] = useState(currentUser?.bio ?? '');
  const [saved, setSaved] = useState(false);

  if (!currentUser) {
    router.replace('/(auth)/sign-in');
    return null;
  }

  function handleSave() {
    if (!name.trim()) return;
    updateUserProfile(currentUser!.id, { name: name.trim(), bio: bio.trim() || undefined });
    setSaved(true);
    setTimeout(() => router.back(), 600);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ marginRight: Spacing.md }}>
            <Feather name="arrow-left" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 20, color: Colors.primary }}>Editar Perfil</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 120 }}>
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 32, color: Colors.primary }}>
                {name.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          </View>

          <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13, color: Colors.onSurface, marginBottom: 6 }}>Nome</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Seu nome completo"
            placeholderTextColor={Colors.onSurfaceVariant}
            autoCapitalize="words"
            style={{ backgroundColor: Colors.surfaceContainerHighest, borderRadius: Radius.md, paddingHorizontal: Spacing.base, paddingVertical: 14, fontFamily: 'WorkSans_400Regular', fontSize: 15, color: Colors.onSurface, marginBottom: Spacing.lg }}
          />

          <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13, color: Colors.onSurface, marginBottom: 6 }}>E-mail</Text>
          <View style={{ backgroundColor: Colors.surfaceContainerLow, borderRadius: Radius.md, paddingHorizontal: Spacing.base, paddingVertical: 14, marginBottom: Spacing.lg }}>
            <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 15, color: Colors.onSurfaceVariant }}>{currentUser.email}</Text>
          </View>

          <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13, color: Colors.onSurface, marginBottom: 6 }}>Biografia</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Uma breve descrição sobre você..."
            placeholderTextColor={Colors.onSurfaceVariant}
            multiline
            numberOfLines={4}
            style={{ backgroundColor: Colors.surfaceContainerHighest, borderRadius: Radius.md, paddingHorizontal: Spacing.base, paddingVertical: 14, fontFamily: 'WorkSans_400Regular', fontSize: 15, color: Colors.onSurface, minHeight: 100, textAlignVertical: 'top' }}
          />
        </ScrollView>

        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg, backgroundColor: Colors.surface }}>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!name.trim() || saved}
            style={{ backgroundColor: !name.trim() || saved ? Colors.surfaceContainerHigh : Colors.primary, borderRadius: 32, paddingVertical: Spacing.base, alignItems: 'center' }}
          >
            <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 15, color: !name.trim() || saved ? Colors.onSurfaceVariant : Colors.onPrimary }}>
              {saved ? 'Salvo!' : 'Salvar Alterações'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

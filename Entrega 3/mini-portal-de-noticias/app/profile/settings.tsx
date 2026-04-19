import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Modal, Pressable, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useChronicleStore } from '@/store/chronicleStore';
import { useUiStore } from '@/store/uiStore';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { ReadingFontSize } from '@/types/admin';

const FONT_SIZE_LABELS: Record<ReadingFontSize, string> = { sm: 'Pequeno', md: 'Médio', lg: 'Grande' };

export default function Settings() {
  const { currentUser, setCurrentUser, updateReadingPrefs } = useChronicleStore();
  const { darkMode, setDarkMode } = useUiStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!currentUser) {
    router.replace('/(auth)/sign-in');
    return null;
  }

  function handleDeleteAccount() {
    setCurrentUser(null);
    setShowDeleteModal(false);
    router.replace('/onboarding');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ marginRight: Spacing.md }}>
          <Feather name="arrow-left" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 20, color: Colors.primary }}>Configurações</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 60 }}>
        <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 12, color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.base }}>
          Aparência
        </Text>
        <View style={{ backgroundColor: Colors.surfaceContainerLow, borderRadius: Radius.DEFAULT, marginBottom: Spacing.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
              <Feather name="moon" size={18} color={Colors.primary} />
              <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 15, color: Colors.onSurface }}>Modo Escuro</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: Colors.surfaceContainerHigh, true: Colors.primary }}
              thumbColor={Colors.onPrimary}
            />
          </View>
        </View>

        <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 12, color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.base }}>
          Leitura
        </Text>
        <View style={{ backgroundColor: Colors.surfaceContainerLow, borderRadius: Radius.DEFAULT, padding: Spacing.base, marginBottom: Spacing.xl }}>
          <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 14, color: Colors.onSurface, marginBottom: Spacing.md }}>
            Tamanho da fonte
          </Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {(['sm', 'md', 'lg'] as ReadingFontSize[]).map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => updateReadingPrefs(currentUser.id, { readingFontSize: size })}
                style={{ flex: 1, paddingVertical: 10, borderRadius: Radius.DEFAULT, backgroundColor: currentUser.readingFontSize === size ? Colors.primary : Colors.surfaceContainerHighest, alignItems: 'center' }}
              >
                <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13, color: currentUser.readingFontSize === size ? Colors.onPrimary : Colors.onSurfaceVariant }}>
                  {FONT_SIZE_LABELS[size]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 12, color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.base }}>
          Conta
        </Text>
        <TouchableOpacity
          onPress={() => setShowDeleteModal(true)}
          style={{ backgroundColor: `${Colors.error}10`, borderRadius: Radius.DEFAULT, padding: Spacing.base, flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}
        >
          <Feather name="trash-2" size={18} color={Colors.error} />
          <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 15, color: Colors.error }}>Excluir minha conta</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: Spacing.xl }} onPress={() => setShowDeleteModal(false)}>
          <View style={{ backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.lg, padding: Spacing.xl, width: '100%' }}>
            <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 20, color: Colors.primary, marginBottom: Spacing.sm }}>
              Excluir conta?
            </Text>
            <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 14, lineHeight: 20, color: Colors.onSurfaceVariant, marginBottom: Spacing.xl }}>
              Esta ação é irreversível. Todos os seus dados serão apagados e você será desconectado permanentemente.
            </Text>
            <TouchableOpacity onPress={handleDeleteAccount} style={{ backgroundColor: Colors.error, borderRadius: Radius.DEFAULT, paddingVertical: 14, alignItems: 'center', marginBottom: Spacing.md }}>
              <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 15, color: '#fff' }}>Confirmar Exclusão</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowDeleteModal(false)} style={{ paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 15, color: Colors.onSurfaceVariant }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

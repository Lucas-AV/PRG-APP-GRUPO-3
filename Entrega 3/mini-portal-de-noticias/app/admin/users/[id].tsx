// app/admin/users/[id].tsx
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useChronicleStore } from '@/store/chronicleStore';
import { Colors } from '@/constants/theme';
import type { Role } from '@/types/admin';
import Button from '@/components/ui/Button';

const ROLES: { value: Role; label: string }[] = [
  { value: 'leitor', label: 'Leitor' },
  { value: 'autor', label: 'Autor' },
  { value: 'editor', label: 'Editor' },
  { value: 'superadmin', label: 'Superadmin' },
];

export default function EditUser() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const users = useChronicleStore((s) => s.users);
  const currentUser = useChronicleStore((s) => s.currentUser);
  const updateUserRole = useChronicleStore((s) => s.updateUserRole);

  const user = users.find((u) => u.id === id);
  const [selectedRole, setSelectedRole] = useState<Role>(user?.role ?? 'leitor');
  const isOwnAccount = currentUser?.id === id;

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface }}>
        <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 15, color: Colors.onSurfaceVariant }}>
          Usuário não encontrado.
        </Text>
      </View>
    );
  }

  function handleSave() {
    if (isOwnAccount) return;
    updateUserRole(id, selectedRole);
    router.back();
  }

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
      {/* Info read-only */}
      <View style={{ backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 16, marginBottom: 24 }}>
        <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 14, color: Colors.onSurfaceVariant, marginBottom: 2 }}>NOME</Text>
        <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 16, color: Colors.primary, marginBottom: 12 }}>{user.name}</Text>
        <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 14, color: Colors.onSurfaceVariant, marginBottom: 2 }}>E-MAIL</Text>
        <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 16, color: Colors.primary }}>{user.email}</Text>
      </View>

      {/* Seletor de role */}
      <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 11, color: Colors.onSurfaceVariant, letterSpacing: 1, marginBottom: 12 }}>
        NÍVEL DE ACESSO
      </Text>

      {isOwnAccount && (
        <View style={{ backgroundColor: '#fef3c7', borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 13, color: '#92400e' }}>
            Você não pode alterar o próprio nível de acesso.
          </Text>
        </View>
      )}

      <View style={{ gap: 10, marginBottom: 32 }}>
        {ROLES.map((r) => {
          const active = selectedRole === r.value;
          return (
            <TouchableOpacity
              key={r.value}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: active ? Colors.primary : Colors.surfaceContainerLow,
                borderRadius: 16,
                padding: 14,
                opacity: isOwnAccount ? 0.5 : 1,
              }}
              onPress={() => !isOwnAccount && setSelectedRole(r.value)}
              disabled={isOwnAccount}
              accessibilityRole="radio"
              accessibilityState={{ selected: active, disabled: isOwnAccount }}
              accessibilityLabel={r.label}
            >
              <View
                style={{
                  width: 20, height: 20, borderRadius: 10,
                  borderWidth: 2,
                  borderColor: active ? Colors.onPrimary : Colors.onSurfaceVariant,
                  backgroundColor: active ? Colors.onPrimary : 'transparent',
                  marginRight: 12,
                }}
              />
              <Text
                style={{
                  fontFamily: 'WorkSans_500Medium', fontSize: 15,
                  color: active ? Colors.onPrimary : Colors.primary,
                }}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Button
        label="Salvar Alterações"
        onPress={handleSave}
        variant="primary"
        fullWidth
        disabled={isOwnAccount || selectedRole === user.role}
      />
    </ScrollView>
  );
}

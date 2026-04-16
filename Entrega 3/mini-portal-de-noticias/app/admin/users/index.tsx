// app/admin/users/index.tsx
import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput as TextInputRaw } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useChronicleStore } from '@/store/chronicleStore';
import { Colors } from '@/constants/theme';
import type { User, Role } from '@/types/admin';

const ROLE_COLORS: Record<Role, { bg: string; text: string }> = {
  superadmin: { bg: Colors.primary, text: Colors.onPrimary },
  editor: { bg: '#dbeafe', text: '#1d4ed8' },
  autor: { bg: '#dcfce7', text: '#15803d' },
  leitor: { bg: Colors.surfaceContainerHigh, text: Colors.onSurfaceVariant },
};

const ROLE_LABELS: Record<Role, string> = {
  superadmin: 'Superadmin',
  editor: 'Editor',
  autor: 'Autor',
  leitor: 'Leitor',
};

export default function UsersIndex() {
  const users = useChronicleStore((s) => s.users);
  const [query, setQuery] = useState('');

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View className="flex-1 bg-surface">
      {/* Busca */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.surfaceContainerHighest,
            borderRadius: 24,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Feather name="search" size={16} color={Colors.onSurfaceVariant} style={{ marginRight: 8 }} />
          <TextInputRaw
            placeholder="Buscar por nome ou e-mail"
            placeholderTextColor={Colors.onSurfaceVariant}
            value={query}
            onChangeText={setQuery}
            style={{ flex: 1, fontFamily: 'WorkSans_400Regular', fontSize: 14, color: Colors.primary }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={16} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 64 }}>
            <Feather name="users" size={40} color={Colors.onSurfaceVariant} />
            <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 15, color: Colors.onSurfaceVariant, marginTop: 12 }}>
              Nenhum usuário encontrado
            </Text>
          </View>
        }
        renderItem={({ item }) => <UserCard user={item} />}
      />
    </View>
  );
}

function UserCard({ user }: { user: User }) {
  const roleStyle = ROLE_COLORS[user.role];
  const initials = user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: 16,
        padding: 14,
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: Colors.surfaceContainerHigh,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 15, color: Colors.primary }}>{initials}</Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 14, color: Colors.primary }}>{user.name}</Text>
        <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 12, color: Colors.onSurfaceVariant }}>{user.email}</Text>
        {/* Badge de role */}
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: roleStyle.bg,
            borderRadius: 9999,
            paddingHorizontal: 8,
            paddingVertical: 2,
            marginTop: 4,
          }}
        >
          <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 10, color: roleStyle.text }}>
            {ROLE_LABELS[user.role]}
          </Text>
        </View>
      </View>

      {/* Botão editar */}
      <TouchableOpacity
        onPress={() => router.push(`/admin/users/${user.id}`)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={`Editar ${user.name}`}
      >
        <Feather name="edit-2" size={18} color={Colors.onSurfaceVariant} />
      </TouchableOpacity>
    </View>
  );
}

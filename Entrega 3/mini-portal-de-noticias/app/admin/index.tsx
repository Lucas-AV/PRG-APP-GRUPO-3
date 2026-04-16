// app/admin/index.tsx
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useChronicleStore } from '@/store/chronicleStore';
import { Colors } from '@/constants/theme';

type FeatherName = React.ComponentProps<typeof Feather>['name'];

interface Module {
  icon: FeatherName;
  label: string;
  route: string | null;
}

const MODULES: Module[] = [
  { icon: 'users', label: 'Usuários', route: '/admin/users' },
  { icon: 'tag', label: 'Tags', route: '/admin/tags' },
  { icon: 'map-pin', label: 'Cidades', route: '/admin/cities' },
  { icon: 'map', label: 'UFs', route: '/admin/states' },
  { icon: 'file-text', label: 'Notícias', route: '/admin/news' },
  { icon: 'message-circle', label: 'Moderação', route: '/admin/moderation' },
  { icon: 'edit-2', label: 'Painel Autor', route: null },
  { icon: 'layers', label: 'Painel Editor', route: null },
];

export default function AdminDashboard() {
  const users = useChronicleStore((s) => s.users);
  const news = useChronicleStore((s) => s.news);
  const comments = useChronicleStore((s) => s.comments);
  const currentUser = useChronicleStore((s) => s.currentUser);

  const publishedCount = news.filter((n) => n.status === 'publicada').length;
  const pendingCount = comments.filter((c) => c.reportCount > 0 && c.status === 'active').length;

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
      {/* Saudação */}
      <Text
        style={{ fontFamily: 'WorkSans_400Regular', fontSize: 14, color: Colors.onSurfaceVariant, marginBottom: 4 }}
      >
        Olá, {currentUser?.name ?? 'Admin'}
      </Text>
      <Text
        style={{ fontFamily: 'Newsreader_700Bold', fontSize: 22, color: Colors.primary, marginBottom: 20 }}
      >
        Visão Geral
      </Text>

      {/* Cartões de métricas */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 28 }}>
        <MetricCard label="Usuários" value={users.length} icon="users" />
        <MetricCard label="Publicadas" value={publishedCount} icon="file-text" />
        <MetricCard label="Pendentes" value={pendingCount} icon="alert-circle" />
      </View>

      {/* Grid de módulos */}
      <Text
        style={{ fontFamily: 'WorkSans_700Bold', fontSize: 11, color: Colors.onSurfaceVariant, letterSpacing: 1, marginBottom: 12 }}
      >
        GERENCIAR
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {MODULES.map((mod) => (
          <ModuleCard key={mod.label} module={mod} />
        ))}
      </View>
    </ScrollView>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: number; icon: FeatherName }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: 16,
        padding: 14,
      }}
    >
      <Feather name={icon} size={16} color={Colors.onSurfaceVariant} style={{ marginBottom: 8 }} />
      <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 26, color: Colors.primary }}>
        {value}
      </Text>
      <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 11, color: Colors.onSurfaceVariant, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

function ModuleCard({ module }: { module: Module }) {
  const disabled = module.route === null;
  return (
    <TouchableOpacity
      style={{
        width: '47%',
        backgroundColor: Colors.surfaceContainerLow,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        opacity: disabled ? 0.4 : 1,
      }}
      onPress={() => !disabled && router.push(module.route as string)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={module.label}
      accessibilityState={{ disabled }}
    >
      <Feather name={module.icon} size={28} color={Colors.primary} style={{ marginBottom: 10 }} />
      <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13, color: Colors.primary, textAlign: 'center' }}>
        {module.label}
      </Text>
      {disabled && (
        <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 10, color: Colors.onSurfaceVariant, marginTop: 2 }}>
          em breve
        </Text>
      )}
    </TouchableOpacity>
  );
}

import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useChronicleStore } from '@/store/chronicleStore';
import { Colors } from '@/constants/theme';
import type { Comment } from '@/types/admin';

type Tab = 'todos' | 'reportados';

export default function Moderation() {
  const comments = useChronicleStore((s) => s.comments);
  const users = useChronicleStore((s) => s.users);
  const news = useChronicleStore((s) => s.news);
  const updateCommentStatus = useChronicleStore((s) => s.updateCommentStatus);
  const [activeTab, setActiveTab] = useState<Tab>('todos');

  const visible = comments.filter((c) => c.status !== 'deleted_by_moderator');
  const filtered = activeTab === 'reportados'
    ? visible.filter((c) => c.reportCount > 0)
    : visible;

  function getName(userId: string) {
    return users.find((u) => u.id === userId)?.name ?? 'Usuário desconhecido';
  }

  function getNewsTitle(newsId: string) {
    return news.find((n) => n.id === newsId)?.title ?? 'Notícia desconhecida';
  }

  function confirmDelete(comment: Comment) {
    Alert.alert(
      'Excluir Comentário',
      'Tem certeza? O comentário será removido permanentemente da moderação.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => updateCommentStatus(comment.id, 'deleted_by_moderator'),
        },
      ]
    );
  }

  const reportedCount = visible.filter((c) => c.reportCount > 0).length;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Tabs */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: Colors.surfaceContainerLow,
          margin: 16,
          borderRadius: 16,
          padding: 4,
        }}
      >
        {(['todos', 'reportados'] as Tab[]).map((tab) => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={{
                flex: 1,
                backgroundColor: active ? Colors.surfaceContainerLowest : 'transparent',
                borderRadius: 12,
                paddingVertical: 8,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
              }}
              onPress={() => setActiveTab(tab)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={{
                  fontFamily: 'WorkSans_700Bold',
                  fontSize: 13,
                  color: active ? Colors.primary : Colors.onSurfaceVariant,
                  fontWeight: active ? '700' : '400',
                }}
              >
                {tab === 'todos' ? 'Todos' : 'Reportados'}
              </Text>
              {tab === 'reportados' && reportedCount > 0 && (
                <View
                  style={{
                    backgroundColor: Colors.secondary,
                    borderRadius: 9999,
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                  }}
                >
                  <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 10, color: '#fff' }}>
                    {reportedCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 48 }}>
            <Feather name="check-circle" size={40} color={Colors.onSurfaceVariant} />
            <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 15, color: Colors.onSurfaceVariant, marginTop: 12 }}>
              Nenhum comentário para moderar
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isReported = item.reportCount > 0;
          return (
            <View
              style={{
                backgroundColor: Colors.surfaceContainerLowest,
                borderRadius: 16,
                padding: 14,
                borderLeftWidth: isReported ? 3 : 0,
                borderLeftColor: Colors.secondary,
              }}
            >
              {/* Cabeçalho */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 13, color: Colors.primary }}>
                  {getName(item.userId)}
                </Text>
                {isReported && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Feather name="flag" size={12} color={Colors.secondary} />
                    <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 11, color: Colors.secondary }}>
                      {item.reportCount} denúncia{item.reportCount > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>

              {/* Conteúdo */}
              <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 14, color: Colors.onSurface, lineHeight: 20, marginBottom: 6 }}>
                {item.content}
              </Text>

              {/* Referência à notícia */}
              <Text
                style={{ fontFamily: 'WorkSans_400Regular', fontSize: 11, color: Colors.onSurfaceVariant, marginBottom: 12 }}
                numberOfLines={1}
              >
                Em: {getNewsTitle(item.newsId)}
              </Text>

              {/* Ações */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={{
                    flex: 1, backgroundColor: '#dcfce7', borderRadius: 12,
                    paddingVertical: 8, alignItems: 'center',
                  }}
                  onPress={() => updateCommentStatus(item.id, 'active')}
                  accessibilityRole="button"
                  accessibilityLabel="Manter comentário"
                >
                  <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 12, color: '#15803d' }}>Manter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1, backgroundColor: '#fee2e2', borderRadius: 12,
                    paddingVertical: 8, alignItems: 'center',
                  }}
                  onPress={() => confirmDelete(item)}
                  accessibilityRole="button"
                  accessibilityLabel="Excluir comentário"
                >
                  <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 12, color: '#b91c1c' }}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

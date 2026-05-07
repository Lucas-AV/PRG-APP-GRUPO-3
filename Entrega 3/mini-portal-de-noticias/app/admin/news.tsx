import { View, Text, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useChronicleStore } from '@/store/chronicleStore';
import { Colors } from '@/constants/theme';
import type { News, NewsStatus } from '@/types/admin';

type BadgeConfig = { bg: string; text: string; label: string };

const STATUS_CONFIG: Record<NewsStatus, BadgeConfig> = {
  publicada: { bg: '#dcfce7', text: '#15803d', label: 'Publicada' },
  em_revisao: { bg: '#fef9c3', text: '#a16207', label: 'Em Revisão' },
  rascunho: { bg: Colors.surfaceContainerHigh, text: Colors.onSurfaceVariant, label: 'Rascunho' },
  lixeira: { bg: '#fee2e2', text: '#b91c1c', label: 'Lixeira' },
};

export default function NewsAdmin() {
  const news = useChronicleStore((s) => s.news);
  const users = useChronicleStore((s) => s.users);
  const updateNewsStatus = useChronicleStore((s) => s.updateNewsStatus);
  const rejectNews = useChronicleStore((s) => s.rejectNews);

  function getAuthorName(authorId: string) {
    return users.find((u) => u.id === authorId)?.name ?? 'Desconhecido';
  }

  function confirmPublish(item: News) {
    Alert.alert('Publicar Notícia', `Publicar "${item.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Publicar', onPress: () => updateNewsStatus(item.id, 'publicada') },
    ]);
  }

  function confirmReject(item: News) {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Rejeitar Notícia',
        `Motivo da rejeição para "${item.title}":`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Rejeitar',
            style: 'destructive',
            onPress: (reason: string | undefined) =>
              rejectNews(item.id, reason?.trim() || 'Não atende às diretrizes editoriais.'),
          },
        ],
        'plain-text'
      );
    } else {
      Alert.alert('Rejeitar Notícia', `Rejeitar "${item.title}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: () => rejectNews(item.id, 'Não atende às diretrizes editoriais.'),
        },
      ]);
    }
  }

  const sorted = [...news].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      style={{ backgroundColor: Colors.surface }}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', paddingTop: 64 }}>
          <Feather name="file-text" size={40} color={Colors.onSurfaceVariant} />
          <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 15, color: Colors.onSurfaceVariant, marginTop: 12 }}>
            Nenhuma notícia encontrada
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const badge = STATUS_CONFIG[item.status];
        return (
          <View
            style={{
              backgroundColor: Colors.surfaceContainerLowest,
              borderRadius: 16, padding: 14,
            }}
          >
            {/* Badge de status */}
            <View
              style={{
                alignSelf: 'flex-start', backgroundColor: badge.bg,
                borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 8,
              }}
            >
              <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 10, color: badge.text }}>
                {badge.label}
              </Text>
            </View>

            <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 15, color: Colors.primary, lineHeight: 20, marginBottom: 4 }}>
              {item.title}
            </Text>
            <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, marginBottom: 12 }}>
              {getAuthorName(item.authorId)} · {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
            </Text>

            {/* Ações */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {item.status !== 'publicada' && item.status !== 'lixeira' && (
                <TouchableOpacity
                  style={{
                    flex: 1, backgroundColor: '#dcfce7', borderRadius: 12,
                    paddingVertical: 8, alignItems: 'center',
                  }}
                  onPress={() => confirmPublish(item)}
                  accessibilityRole="button"
                  accessibilityLabel="Publicar notícia"
                >
                  <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 12, color: '#15803d' }}>Publicar</Text>
                </TouchableOpacity>
              )}
              {item.status !== 'lixeira' && (
                <TouchableOpacity
                  style={{
                    flex: 1, backgroundColor: '#fee2e2', borderRadius: 12,
                    paddingVertical: 8, alignItems: 'center',
                  }}
                  onPress={() => confirmReject(item)}
                  accessibilityRole="button"
                  accessibilityLabel="Mover para lixeira"
                >
                  <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 12, color: '#b91c1c' }}>Rejeitar</Text>
                </TouchableOpacity>
              )}
              {item.status === 'lixeira' && (
                <TouchableOpacity
                  style={{
                    flex: 1, backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12,
                    paddingVertical: 8, alignItems: 'center',
                  }}
                  onPress={() => updateNewsStatus(item.id, 'rascunho')}
                  accessibilityRole="button"
                  accessibilityLabel="Restaurar notícia"
                >
                  <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 12, color: Colors.primary }}>Restaurar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      }}
    />
  );
}

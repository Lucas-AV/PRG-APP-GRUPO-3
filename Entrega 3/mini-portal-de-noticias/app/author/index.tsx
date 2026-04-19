import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useChronicleStore } from '@/store/chronicleStore';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { News } from '@/types/admin';

type Tab = 'rascunho' | 'em_revisao' | 'publicada' | 'lixeira';

const TABS: { key: Tab; label: string }[] = [
  { key: 'rascunho', label: 'Rascunhos' },
  { key: 'em_revisao', label: 'Em Revisão' },
  { key: 'publicada', label: 'Publicadas' },
  { key: 'lixeira', label: 'Lixeira' },
];

export default function AuthorDashboard() {
  const { currentUser, news, tags, deleteNews, submitForReview } = useChronicleStore();
  const [activeTab, setActiveTab] = useState<Tab>('rascunho');

  const ownNews = news.filter((n) => n.authorId === currentUser?.id);
  const sorted = [...ownNews.filter((n) => n.status === activeTab)].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );

  const tabCounts = Object.fromEntries(
    TABS.map(({ key }) => [key, ownNews.filter((n) => n.status === key).length])
  ) as Record<Tab, number>;

  function getTagNames(tagIds: string[]) {
    return tagIds
      .map((id) => tags.find((t) => t.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  }

  function confirmDelete(item: News) {
    Alert.alert('Excluir Rascunho', `Excluir "${item.title}" permanentemente?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteNews(item.id) },
    ]);
  }

  function confirmSubmit(item: News) {
    Alert.alert('Enviar para Revisão', `Enviar "${item.title}" para análise editorial?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Enviar', onPress: () => submitForReview(item.id) },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 20, color: Colors.primary }}>
          Meus Artigos
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/author/compose')}
          accessibilityRole="button"
          accessibilityLabel="Novo artigo"
        >
          <Feather name="plus" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.base, gap: Spacing.sm, marginBottom: Spacing.base }}>
        {TABS.map(({ key, label }) => {
          const active = activeTab === key;
          const count = tabCounts[key];
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveTab(key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={{
                flex: 1,
                backgroundColor: active ? Colors.primary : Colors.surfaceContainerHigh,
                borderRadius: Radius.DEFAULT,
                paddingVertical: Spacing.sm,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 11, color: active ? Colors.onPrimary : Colors.onSurfaceVariant }}>
                {label}
              </Text>
              {count > 0 ? (
                <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 10, color: active ? 'rgba(255,255,255,0.7)' : Colors.onSurfaceVariant }}>
                  {count}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: Spacing.base, paddingBottom: 48 }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 64 }}>
            <Feather name="file-text" size={40} color={Colors.onSurfaceVariant} />
            <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 15, color: Colors.onSurfaceVariant, marginTop: 12 }}>
              {activeTab === 'rascunho'
                ? 'Nenhum rascunho'
                : `Nenhum artigo — ${TABS.find((t) => t.key === activeTab)?.label.toLowerCase()}`}
            </Text>
            {activeTab === 'rascunho' ? (
              <TouchableOpacity
                onPress={() => router.push('/author/compose')}
                style={{ marginTop: Spacing.base, backgroundColor: Colors.primary, borderRadius: Radius.DEFAULT, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md }}
              >
                <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 14, color: Colors.onPrimary }}>
                  Escrever agora
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.DEFAULT, padding: Spacing.base }}>
            <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 16, color: Colors.primary, lineHeight: 22, marginBottom: 6 }}>
              {item.title}
            </Text>
            {item.status === 'lixeira' && item.rejectionReason ? (
              <View style={{ backgroundColor: '#fee2e2', borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: 8 }}>
                <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 12, color: '#b91c1c', marginBottom: 2 }}>
                  Motivo da rejeição:
                </Text>
                <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 13, color: '#b91c1c' }}>
                  {item.rejectionReason}
                </Text>
              </View>
            ) : null}
            {item.tagIds.length > 0 ? (
              <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, marginBottom: 8 }}>
                {getTagNames(item.tagIds)}
              </Text>
            ) : null}
            <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 11, color: Colors.onSurfaceVariant, marginBottom: 12 }}>
              {new Date(item.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {item.status === 'rascunho' ? (
                <>
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: Colors.surfaceContainerHigh, borderRadius: Radius.sm, paddingVertical: Spacing.sm, alignItems: 'center' }}
                    onPress={() => router.push({ pathname: '/author/compose', params: { id: item.id } })}
                    accessibilityRole="button"
                  >
                    <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 12, color: Colors.primary }}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: '#dcfce7', borderRadius: Radius.sm, paddingVertical: Spacing.sm, alignItems: 'center' }}
                    onPress={() => confirmSubmit(item)}
                    accessibilityRole="button"
                  >
                    <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 12, color: '#15803d' }}>Enviar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: '#fee2e2', borderRadius: Radius.sm, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, alignItems: 'center' }}
                    onPress={() => confirmDelete(item)}
                    accessibilityRole="button"
                  >
                    <Feather name="trash-2" size={14} color="#b91c1c" />
                  </TouchableOpacity>
                </>
              ) : null}
              {item.status === 'lixeira' ? (
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: Colors.surfaceContainerHigh, borderRadius: Radius.sm, paddingVertical: Spacing.sm, alignItems: 'center' }}
                  onPress={() => router.push({ pathname: '/author/compose', params: { id: item.id } })}
                  accessibilityRole="button"
                >
                  <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 12, color: Colors.primary }}>Editar e Reenviar</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

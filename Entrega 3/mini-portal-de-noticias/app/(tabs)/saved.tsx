import { useCallback } from 'react';
import { View, Text, FlatList, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useChronicleStore } from '@/store/chronicleStore';
import NewsCard from '@/components/news/NewsCard';
import EmptyState from '@/components/ui/EmptyState';
import { Colors, Spacing } from '@/constants/theme';

export default function Saved() {
  const { news, tags, users, currentUser, toggleSaveNews } = useChronicleStore();

  const savedNews = news.filter((n) => currentUser?.savedNewsIds.includes(n.id));

  const getAuthorName = useCallback(
    (authorId: string) => users.find((u) => u.id === authorId)?.name ?? 'Autor',
    [users]
  );

  if (!currentUser) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <EmptyState
          icon="bookmark"
          title="Faça login para ver seus salvos"
          subtitle="Entre na sua conta para acessar as notícias que você guardou."
          ctaLabel="Entrar"
          onCta={() => router.push('/(auth)/sign-in')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={{ paddingHorizontal: 20, paddingTop: Spacing.md, paddingBottom: Spacing.sm }}>
        <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 24, color: Colors.primary }}>
          Salvos
        </Text>
      </View>
      {savedNews.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="Nenhuma notícia salva ainda"
          subtitle="Toque no ícone de bookmark para salvar notícias."
          ctaLabel="Explorar notícias"
          onCta={() => router.push('/(tabs)/explore')}
        />
      ) : (
        <FlatList
          data={savedNews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <NewsCard
              news={item}
              tags={tags}
              authorName={getAuthorName(item.authorId)}
              variant="compact"
              onPress={() => router.push({ pathname: '/news/[id]', params: { id: item.id } })}
              onBookmark={() => toggleSaveNews(item.id, currentUser.id)}
              isSaved
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

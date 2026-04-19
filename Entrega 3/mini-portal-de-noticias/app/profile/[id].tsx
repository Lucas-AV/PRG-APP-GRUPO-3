import { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useChronicleStore } from '@/store/chronicleStore';
import NewsCard from '@/components/news/NewsCard';
import EmptyState from '@/components/ui/EmptyState';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function AuthorProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { users, news, tags, currentUser, toggleFollowAuthor, toggleSaveNews } = useChronicleStore();

  const author = users.find((u) => u.id === id);
  const authorNews = news.filter((n) => n.authorId === id && n.status === 'publicada');
  const isFollowing = currentUser?.followedAuthorIds.includes(id) ?? false;

  const getAuthorName = useCallback(
    (authorId: string) => users.find((u) => u.id === authorId)?.name ?? 'Autor',
    [users]
  );

  function handleFollow() {
    if (!currentUser) { router.push('/(auth)/sign-in'); return; }
    toggleFollowAuthor(id, currentUser.id);
  }

  if (!author) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <EmptyState icon="user" title="Autor não encontrado" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <FlatList
        data={authorNews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <>
            <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm }}>
              <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="arrow-left" size={22} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md }}>
                <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 32, color: Colors.primary }}>
                  {author.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 22, color: Colors.primary, marginBottom: 6 }}>
                {author.name}
              </Text>
              {author.bio ? (
                <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 14, lineHeight: 20, color: Colors.onSurfaceVariant, textAlign: 'center', marginBottom: Spacing.md, maxWidth: 280 }}>
                  {author.bio}
                </Text>
              ) : null}
              <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 13, color: Colors.onSurfaceVariant, marginBottom: Spacing.base }}>
                {authorNews.length} {authorNews.length === 1 ? 'notícia publicada' : 'notícias publicadas'}
              </Text>
              <TouchableOpacity
                onPress={handleFollow}
                style={{ paddingHorizontal: 28, paddingVertical: 10, borderRadius: Radius.full, backgroundColor: isFollowing ? Colors.surfaceContainerHigh : Colors.primary }}
              >
                <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 14, color: isFollowing ? Colors.primary : Colors.onPrimary }}>
                  {isFollowing ? 'A seguir' : 'Seguir'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 1, backgroundColor: Colors.surfaceContainerHigh, marginBottom: Spacing.lg }} />
          </>
        }
        ListEmptyComponent={
          <EmptyState icon="edit" title="Nenhuma notícia publicada" subtitle="Este autor ainda não publicou nenhum artigo." />
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: Spacing.lg }}>
            <NewsCard
              news={item}
              tags={tags}
              authorName={getAuthorName(item.authorId)}
              variant="compact"
              onPress={() => router.push({ pathname: '/news/[id]', params: { id: item.id } })}
              onBookmark={() => { if (currentUser) toggleSaveNews(item.id, currentUser.id); }}
              isSaved={currentUser?.savedNewsIds.includes(item.id) ?? false}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

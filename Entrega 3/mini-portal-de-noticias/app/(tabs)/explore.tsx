import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, SafeAreaView, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useChronicleStore } from '@/store/chronicleStore';
import NewsCard from '@/components/news/NewsCard';
import EmptyState from '@/components/ui/EmptyState';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function Explore() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  const { news, tags, users, currentUser, toggleSaveNews } = useChronicleStore();

  const published = news.filter((n) => n.status === 'publicada');

  const results = published.filter((n) => {
    const matchesQuery = query.length < 2 || n.title.toLowerCase().includes(query.toLowerCase());
    const matchesTag = !selectedTagId || n.tagIds.includes(selectedTagId);
    return matchesQuery && matchesTag;
  });

  const getAuthorName = useCallback(
    (authorId: string) => users.find((u) => u.id === authorId)?.name ?? 'Autor',
    [users]
  );

  function handleBookmark(newsId: string) {
    if (!currentUser) { router.push('/(auth)/sign-in'); return; }
    toggleSaveNews(newsId, currentUser.id);
  }

  function startSearch() {
    setIsSearching(true);
  }

  function cancelSearch() {
    setIsSearching(false);
    setQuery('');
    setSelectedTagId(null);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: Spacing.md, paddingBottom: Spacing.sm }}>
        <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 24, color: Colors.primary, marginBottom: Spacing.md }}>
          Explorar
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceContainerHighest, borderRadius: Radius.md, paddingHorizontal: 14, height: 44 }}>
            <Feather name="search" size={16} color={Colors.onSurfaceVariant} style={{ marginRight: Spacing.sm }} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onFocus={startSearch}
              placeholder="Buscar notícias..."
              placeholderTextColor={Colors.onSurfaceVariant}
              style={{ flex: 1, fontFamily: 'WorkSans_400Regular', fontSize: 15, color: Colors.onSurface }}
              returnKeyType="search"
              accessibilityLabel="Buscar notícias"
            />
            {query.length > 0 ? (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={16} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            ) : null}
          </View>
          {isSearching ? (
            <TouchableOpacity onPress={cancelSearch}>
              <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 14, color: Colors.primary }}>Cancelar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Estado inicial: grid de categorias */}
      {!isSearching ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 12 }}>
          <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 13, color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.xs }}>
            Categorias
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                onPress={() => { setSelectedTagId(tag.id); setIsSearching(true); }}
                activeOpacity={0.85}
                style={{ width: '47%', height: 90, borderRadius: Radius.DEFAULT, overflow: 'hidden', backgroundColor: tag.colorHex, alignItems: 'center', justifyContent: 'center' }}
              >
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
                <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 18, color: '#fff', textAlign: 'center', paddingHorizontal: Spacing.sm }}>
                  {tag.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        /* Estado de busca */
        <View style={{ flex: 1 }}>
          {/* Chips de tags */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10, gap: Spacing.sm }}>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                onPress={() => setSelectedTagId((prev) => (prev === tag.id ? null : tag.id))}
                style={{
                  paddingHorizontal: Spacing.base,
                  paddingVertical: 7,
                  borderRadius: Radius.full,
                  backgroundColor: selectedTagId === tag.id ? tag.colorHex : Colors.surfaceContainerLow,
                  marginRight: Spacing.sm,
                }}
              >
                <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13, color: selectedTagId === tag.id ? '#fff' : Colors.onSurfaceVariant }}>
                  {tag.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {results.length === 0 ? (
            <EmptyState icon="search" title="Nenhuma notícia encontrada" subtitle="Tente outros termos ou remova os filtros." ctaLabel="Limpar filtros" onCta={() => { setQuery(''); setSelectedTagId(null); }} />
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
              renderItem={({ item }) => (
                <NewsCard
                  news={item}
                  tags={tags}
                  authorName={getAuthorName(item.authorId)}
                  variant="compact"
                  onPress={() => router.push({ pathname: '/news/[id]', params: { id: item.id } })}
                  onBookmark={() => handleBookmark(item.id)}
                  isSaved={currentUser?.savedNewsIds.includes(item.id) ?? false}
                />
              )}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useChronicleStore } from '@/store/chronicleStore';
import NewsCard from '@/components/news/NewsCard';
import CategoryChip from '@/components/news/CategoryChip';
import EmptyState from '@/components/ui/EmptyState';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { News } from '@/types/admin';

type HomeTab = 'geral' | 'para-voce';

export default function Home() {
  const [activeTab, setActiveTab] = useState<HomeTab>('geral');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);

  const {
    news, tags, states, cities, users, currentUser,
    toggleSaveNews,
  } = useChronicleStore();

  const published = news.filter((n) => n.status === 'publicada');

  const geralFeed = published.filter((n) => {
    if (selectedTagId && !n.tagIds.includes(selectedTagId)) return false;
    if (selectedStateId) {
      const cityIds = cities.filter((c) => c.stateId === selectedStateId).map((c) => c.id);
      if (!n.cityId || !cityIds.includes(n.cityId)) return false;
    }
    return true;
  });

  const paraVoceFeed = published.filter((n) => {
    if (!currentUser) return false;
    return (
      n.tagIds.some((t) => currentUser.followedTagIds.includes(t)) ||
      currentUser.followedAuthorIds.includes(n.authorId)
    );
  });

  const followedAuthors = users.filter((u) =>
    currentUser?.followedAuthorIds.includes(u.id)
  );

  const getAuthorName = useCallback(
    (authorId: string) => users.find((u) => u.id === authorId)?.name ?? 'Autor',
    [users]
  );

  function handleBookmark(newsItem: News) {
    if (!currentUser) {
      router.push('/(auth)/sign-in');
      return;
    }
    toggleSaveNews(newsItem.id, currentUser.id);
  }

  function toggleTag(tagId: string) {
    setSelectedTagId((prev) => (prev === tagId ? null : tagId));
  }

  function toggleState(stateId: string) {
    setSelectedStateId((prev) => (prev === stateId ? null : stateId));
  }

  const feed = activeTab === 'geral' ? geralFeed : paraVoceFeed;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Spacing.md, paddingBottom: Spacing.sm }}>
        <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 24, color: Colors.primary, letterSpacing: -0.5 }}>
          CHRONICLE
        </Text>
        {currentUser ? (
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 14, color: Colors.primary }}>
                {currentUser.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')} style={{ paddingHorizontal: 14, paddingVertical: Spacing.sm, backgroundColor: Colors.surfaceContainerHigh, borderRadius: Radius.full }}>
              <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13, color: Colors.primary }}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')} style={{ paddingHorizontal: 14, paddingVertical: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.full }}>
              <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13, color: Colors.onPrimary }}>Cadastrar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Sub-abas */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: Spacing.md }}>
        {(['geral', ...(currentUser ? ['para-voce'] : [])] as HomeTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{ marginRight: Spacing['2xl'], paddingBottom: Spacing.sm, borderBottomWidth: 2, borderBottomColor: activeTab === tab ? Colors.primary : 'transparent' }}
          >
            <Text style={{ fontFamily: activeTab === tab ? 'WorkSans_700Bold' : 'WorkSans_400Regular', fontSize: 15, color: activeTab === tab ? Colors.primary : Colors.onSurfaceVariant }}>
              {tab === 'geral' ? 'Geral' : 'Para Você'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Chips de filtro (só no Geral) */}
        {activeTab === 'geral' ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Spacing.base }}>
            {states.map((st) => (
              <CategoryChip
                key={`state-${st.id}`}
                label={st.acronym}
                colorHex={Colors.primary}
                selected={selectedStateId === st.id}
                onPress={() => toggleState(st.id)}
              />
            ))}
            {tags.map((tag) => (
              <CategoryChip
                key={`tag-${tag.id}`}
                label={tag.name}
                colorHex={tag.colorHex}
                selected={selectedTagId === tag.id}
                onPress={() => toggleTag(tag.id)}
              />
            ))}
          </ScrollView>
        ) : null}

        {/* Carrossel de autores seguidos (Para Você) */}
        {activeTab === 'para-voce' && followedAuthors.length > 0 ? (
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 13, color: Colors.onSurfaceVariant, paddingHorizontal: 20, marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Autores que você segue
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: Spacing.base }}>
              {followedAuthors.map((author) => (
                <TouchableOpacity key={author.id} onPress={() => router.push({ pathname: '/profile/[id]', params: { id: author.id } })} style={{ alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.primary }}>
                    <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 18, color: Colors.primary }}>
                      {author.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 11, color: Colors.onSurfaceVariant, maxWidth: 60, textAlign: 'center' }} numberOfLines={1}>
                    {author.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Feed */}
        <View style={{ paddingHorizontal: 20 }}>
          {activeTab === 'para-voce' && !currentUser ? (
            <EmptyState icon="user" title="Faça login para ver seu feed" subtitle="Entre na sua conta para acompanhar autores e categorias." ctaLabel="Entrar" onCta={() => router.push('/(auth)/sign-in')} />
          ) : feed.length === 0 ? (
            <EmptyState
              icon={activeTab === 'para-voce' ? 'rss' : 'inbox'}
              title={activeTab === 'para-voce' ? 'Seu feed está vazio' : 'Nenhuma notícia encontrada'}
              subtitle={activeTab === 'para-voce' ? 'Siga autores e categorias para personalizar seu feed.' : 'Tente remover os filtros selecionados.'}
              ctaLabel={activeTab === 'para-voce' ? 'Explorar categorias' : undefined}
              onCta={activeTab === 'para-voce' ? () => router.push('/(tabs)/explore') : undefined}
            />
          ) : (
            feed.map((item, index) => (
              <NewsCard
                key={item.id}
                news={item}
                tags={tags}
                authorName={getAuthorName(item.authorId)}
                variant={index === 0 && activeTab === 'geral' ? 'hero' : 'compact'}
                onPress={() => router.push({ pathname: '/news/[id]', params: { id: item.id } })}
                onBookmark={() => handleBookmark(item)}
                isSaved={currentUser?.savedNewsIds.includes(item.id) ?? false}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

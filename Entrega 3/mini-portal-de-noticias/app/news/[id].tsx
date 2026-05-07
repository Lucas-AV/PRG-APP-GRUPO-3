import { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal,
  Pressable, Share, NativeSyntheticEvent, NativeScrollEvent,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useChronicleStore } from '@/store/chronicleStore';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { ReadingBackground, ReadingFontSize } from '@/types/admin';

const BG_COLORS: Record<ReadingBackground, string> = {
  white: Colors.surface,
  sepia: '#f5f0e8',
  dark: '#1a1a1a',
};
const TEXT_COLORS: Record<ReadingBackground, string> = {
  white: Colors.primary,
  sepia: '#5c4a32',
  dark: '#e8e0d0',
};
const FONT_SIZES: Record<ReadingFontSize, number> = { sm: 14, md: 16, lg: 19 };

export default function NewsDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { news, tags, users, currentUser, toggleSaveNews, incrementViews, updateReadingPrefs } = useChronicleStore();

  const article = news.find((n) => n.id === id);
  const author = users.find((u) => u.id === article?.authorId);
  const articleTags = tags.filter((t) => article?.tagIds.includes(t.id));

  const [progress, setProgress] = useState(0);
  const [showZen, setShowZen] = useState(false);
  const [zenBg, setZenBg] = useState<ReadingBackground>(currentUser?.readingBackground ?? 'white');
  const [zenFontSize, setZenFontSize] = useState<ReadingFontSize>(currentUser?.readingFontSize ?? 'md');
  const [useSerif, setUseSerif] = useState(true);

  const viewedRef = useRef(false);

  useEffect(() => {
    if (article && !viewedRef.current) {
      viewedRef.current = true;
      incrementViews(article.id);
    }
  }, [article, incrementViews]);

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const scrollable = contentSize.height - layoutMeasurement.height;
    if (scrollable > 0) setProgress(contentOffset.y / scrollable);
  }

  function saveZenPrefs() {
    setShowZen(false);
    if (currentUser) {
      updateReadingPrefs(currentUser.id, { readingBackground: zenBg, readingFontSize: zenFontSize });
    }
  }

  async function handleShare() {
    if (!article) return;
    await Share.share({ message: `${article.title} — leia no CHRONICLE` });
  }

  const isSaved = currentUser?.savedNewsIds.includes(id) ?? false;

  function handleBookmark() {
    if (!currentUser) { router.push('/(auth)/sign-in'); return; }
    toggleSaveNews(id, currentUser.id);
  }

  if (!article) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 15, color: Colors.onSurfaceVariant }}>Notícia não encontrada.</Text>
      </SafeAreaView>
    );
  }

  const bgColor = BG_COLORS[zenBg];
  const textColor = TEXT_COLORS[zenBg];
  const bodyFontSize = FONT_SIZES[zenFontSize];
  const bodyFontFamily = useSerif ? 'Newsreader_400Regular' : 'WorkSans_400Regular';

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      {/* Barra de progresso */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, zIndex: 100, backgroundColor: Colors.surfaceContainerHigh }}>
        <View style={{ height: 2, width: `${progress * 100}%`, backgroundColor: Colors.secondary }} />
      </View>

      {/* Header sticky */}
      <SafeAreaView>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: 10 }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ marginRight: Spacing.md }}>
            <Feather name="arrow-left" size={22} color={textColor} />
          </TouchableOpacity>
          <Text style={{ flex: 1, fontFamily: 'Newsreader_700Bold', fontSize: 16, color: textColor, textAlign: 'center' }}>
            CHRONICLE
          </Text>
          <TouchableOpacity onPress={handleShare} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="share" size={20} color={textColor} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* Imagem de capa / placeholder */}
        <View style={{ height: 220, backgroundColor: articleTags[0]?.colorHex ?? Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="image" size={40} color="rgba(255,255,255,0.4)" />
        </View>

        <View style={{ padding: Spacing.lg }}>
          {/* Tags */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {articleTags.map((tag) => (
              <View key={tag.id} style={{ backgroundColor: tag.colorHex, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: Spacing.xs }}>
                <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 11, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {tag.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Título */}
          <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 28, lineHeight: 32, color: textColor, marginBottom: 14 }}>
            {article.title}
          </Text>

          {/* Metadados */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg }}>
            <TouchableOpacity onPress={() => router.push({ pathname: '/profile/[id]', params: { id: article.authorId } })} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 12, color: Colors.primary }}>
                  {(author?.name ?? 'A').charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13, color: Colors.secondary }}>
                {author?.name ?? 'Autor'}
              </Text>
            </TouchableOpacity>
            <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 12, color: Colors.onSurfaceVariant }}>
              {new Date(article.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </View>

          {/* Ações (Aa + Bookmark) */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.lg, marginBottom: Spacing.xl }}>
            <TouchableOpacity onPress={() => setShowZen(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 14, color: Colors.onSurfaceVariant }}>Aa</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleBookmark} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="bookmark" size={20} color={isSaved ? Colors.secondary : Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Corpo */}
          <Text style={{ fontFamily: bodyFontFamily, fontSize: bodyFontSize, lineHeight: bodyFontSize * 1.6, color: textColor, marginBottom: 32 }}>
            {article.contentBody}
          </Text>

          {/* Comentários preview */}
          <View style={{ backgroundColor: Colors.surfaceContainerLow, borderRadius: Radius.DEFAULT, padding: Spacing.base }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md }}>
              <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 14, color: Colors.primary }}>Comentários</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/news/comments', params: { newsId: id } })}>
                <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13, color: Colors.secondary }}>Ver toda a discussão</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (!currentUser) { router.push('/(auth)/sign-in'); return; }
                router.push({ pathname: '/news/comments', params: { newsId: id } });
              }}
              style={{ backgroundColor: Colors.surfaceContainerHighest, borderRadius: Radius.md, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md }}
            >
              <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 14, color: Colors.onSurfaceVariant }}>
                Deixe seu comentário...
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Zen Mode Bottom Sheet */}
      <Modal visible={showZen} transparent animationType="slide" onRequestClose={saveZenPrefs}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={saveZenPrefs}>
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.surfaceContainerLowest, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg, padding: Spacing.xl }}>
            <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 16, color: Colors.primary, marginBottom: Spacing.lg }}>Modo de Leitura</Text>

            {/* Seletores de fundo */}
            <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 12, color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.md }}>Fundo</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.base, marginBottom: Spacing.xl }}>
              {([['white', '#f8f9fa', 'Claro'], ['sepia', '#f5f0e8', 'Sépia'], ['dark', '#1a1a1a', 'Escuro']] as [ReadingBackground, string, string][]).map(([key, color, label]) => (
                <TouchableOpacity key={key} onPress={() => setZenBg(key)} style={{ alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: color, borderWidth: zenBg === key ? 2 : 1, borderColor: zenBg === key ? Colors.primary : Colors.surfaceContainerHigh }} />
                  <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 11, color: Colors.onSurfaceVariant }}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tamanho da fonte */}
            <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 12, color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.md }}>Tamanho do texto</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.base, marginBottom: Spacing.xl }}>
              {(['sm', 'md', 'lg'] as ReadingFontSize[]).map((size, i) => (
                <TouchableOpacity key={size} onPress={() => setZenFontSize(size)} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: zenFontSize === size ? Colors.primary : Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: [13, 16, 20][i], color: zenFontSize === size ? Colors.onPrimary : Colors.primary }}>A</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Toggle fonte */}
            <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 12, color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.md }}>Fonte</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.md }}>
              <TouchableOpacity onPress={() => setUseSerif(true)} style={{ flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.DEFAULT, backgroundColor: useSerif ? Colors.primary : Colors.surfaceContainerLow, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 15, color: useSerif ? Colors.onPrimary : Colors.primary }}>Serifada</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setUseSerif(false)} style={{ flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.DEFAULT, backgroundColor: !useSerif ? Colors.primary : Colors.surfaceContainerLow, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 15, color: !useSerif ? Colors.onPrimary : Colors.primary }}>Sans</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

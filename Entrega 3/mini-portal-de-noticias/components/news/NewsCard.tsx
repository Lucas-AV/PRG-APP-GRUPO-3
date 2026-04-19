import { memo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { News, Tag } from '@/types/admin';

interface NewsCardProps {
  news: News;
  tags: Tag[];
  authorName: string;
  variant: 'hero' | 'compact';
  onPress: () => void;
  onBookmark?: () => void;
  isSaved?: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const NewsCard = memo(function NewsCard({
  news,
  tags,
  authorName,
  variant,
  onPress,
  onBookmark,
  isSaved = false,
}: NewsCardProps) {
  const primaryTag = tags.find((t) => news.tagIds.includes(t.id));

  if (variant === 'hero') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        accessibilityRole="button"
        style={{ marginBottom: Spacing.xl, backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.DEFAULT }}
      >
        <View
          style={{
            height: 200,
            borderTopLeftRadius: Spacing['4xl'],
            borderTopRightRadius: Radius.DEFAULT,
            overflow: 'hidden',
            backgroundColor: primaryTag?.colorHex ?? Colors.surfaceContainerHigh,
          }}
        >
          {news.coverImageUrl ? (
            <Image source={{ uri: news.coverImageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="image" size={36} color="rgba(255,255,255,0.5)" />
            </View>
          )}
          {primaryTag ? (
            <View style={{ position: 'absolute', bottom: Spacing.md, left: Spacing.base, backgroundColor: primaryTag.colorHex, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: Spacing.xs }}>
              <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 11, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {primaryTag.name}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={{ padding: Spacing.base }}>
          <Text numberOfLines={3} style={{ fontFamily: 'Newsreader_700Bold', fontSize: 22, lineHeight: 26, color: Colors.primary, marginBottom: 10 }}>
            {news.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 13, color: Colors.onSurfaceVariant }}>
              {authorName} · {formatDate(news.createdAt)}
            </Text>
            {onBookmark ? (
              <TouchableOpacity onPress={onBookmark} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityRole="button" accessibilityLabel={isSaved ? 'Remover dos salvos' : 'Salvar notícia'}>
                <Feather name="bookmark" size={18} color={isSaved ? Colors.secondary : Colors.onSurfaceVariant} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      style={{ flexDirection: 'row', marginBottom: Spacing.lg, gap: Spacing.md }}
    >
      <View style={{ width: 80, height: 80, borderRadius: Radius.sm * 1.5, overflow: 'hidden', backgroundColor: primaryTag?.colorHex ?? Colors.surfaceContainerHigh, flexShrink: 0 }}>
        {news.coverImageUrl ? (
          <Image source={{ uri: news.coverImageUrl }} style={{ width: 80, height: 80 }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="image" size={20} color="rgba(255,255,255,0.5)" />
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        {primaryTag ? (
          <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 11, color: primaryTag.colorHex, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {primaryTag.name}
          </Text>
        ) : null}
        <Text numberOfLines={2} style={{ fontFamily: 'Newsreader_700Bold', fontSize: 15, lineHeight: 20, color: Colors.primary, marginBottom: 6 }}>
          {news.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 12, color: Colors.onSurfaceVariant }}>
            {authorName} · {formatDate(news.createdAt)}
          </Text>
          {onBookmark ? (
            <TouchableOpacity onPress={onBookmark} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityRole="button" accessibilityLabel={isSaved ? 'Remover dos salvos' : 'Salvar notícia'}>
              <Feather name="bookmark" size={14} color={isSaved ? Colors.secondary : Colors.onSurfaceVariant} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default NewsCard;

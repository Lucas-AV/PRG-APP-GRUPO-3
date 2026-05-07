import { useState, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useChronicleStore } from '@/store/chronicleStore';
import CommentItem from '@/components/comments/CommentItem';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Comment } from '@/types/admin';

export default function Comments() {
  const { newsId } = useLocalSearchParams<{ newsId: string }>();
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<{ commentId: string; authorName: string } | null>(null);
  const inputRef = useRef<TextInput>(null);

  const { comments, users, currentUser, addComment, likeComment, reportComment } = useChronicleStore();

  const newsComments = comments
    .filter((c) => c.newsId === newsId && c.status === 'active')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const topLevel = newsComments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => newsComments.filter((c) => c.parentId === parentId);

  const flatList: Array<{ comment: Comment; isReply: boolean }> = [];
  topLevel.forEach((c) => {
    flatList.push({ comment: c, isReply: false });
    getReplies(c.id).forEach((r) => flatList.push({ comment: r, isReply: true }));
  });

  function handleReply(commentId: string, authorName: string) {
    setReplyTo({ commentId, authorName });
    setText(`@${authorName} `);
    inputRef.current?.focus();
  }

  function handlePublish() {
    if (!currentUser || text.trim().length === 0) return;
    addComment({
      newsId,
      userId: currentUser.id,
      content: text.trim(),
      parentId: replyTo?.commentId,
    });
    setText('');
    setReplyTo(null);
  }

  const charCount = text.length;
  const overLimit = charCount > 500;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.base }}>
          <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 20, color: Colors.primary }}>
            Comentários ({newsComments.length})
          </Text>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="x" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Lista */}
        <FlatList
          data={flatList}
          keyExtractor={(item) => item.comment.id}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.base, paddingBottom: Spacing.sm }}
          ListEmptyComponent={
            <View style={{ paddingTop: 40, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 15, color: Colors.onSurfaceVariant }}>
                Seja o primeiro a comentar!
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <CommentItem
              comment={item.comment}
              author={users.find((u) => u.id === item.comment.userId)}
              currentUserId={currentUser?.id}
              isIndented={item.isReply}
              onLike={likeComment}
              onReport={(commentId, userId) => reportComment(commentId, userId)}
              onReply={handleReply}
            />
          )}
        />

        {/* Input */}
        <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surfaceContainerLowest }}>
          {replyTo ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
              <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 13, color: Colors.onSurfaceVariant }}>
                Respondendo a <Text style={{ fontFamily: 'WorkSans_700Bold' }}>{replyTo.authorName}</Text>
              </Text>
              <TouchableOpacity onPress={() => { setReplyTo(null); setText(''); }}>
                <Feather name="x" size={14} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          ) : null}
          {currentUser ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
              <TextInput
                ref={inputRef}
                value={text}
                onChangeText={setText}
                placeholder="Deixe seu comentário..."
                placeholderTextColor={Colors.onSurfaceVariant}
                multiline
                maxLength={510}
                style={{ flex: 1, fontFamily: 'WorkSans_400Regular', fontSize: 15, color: Colors.onSurface, backgroundColor: Colors.surfaceContainerHighest, borderRadius: Radius.md, paddingHorizontal: Spacing.base, paddingVertical: 10, maxHeight: 100 }}
              />
              <View style={{ alignItems: 'flex-end', gap: Spacing.xs }}>
                <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 11, color: overLimit ? Colors.error : Colors.onSurfaceVariant }}>
                  {charCount}/500
                </Text>
                <TouchableOpacity
                  onPress={handlePublish}
                  disabled={text.trim().length === 0 || overLimit}
                  style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: text.trim().length === 0 || overLimit ? Colors.surfaceContainerHigh : Colors.primary, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Feather name="send" size={16} color={text.trim().length === 0 || overLimit ? Colors.onSurfaceVariant : Colors.onPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')} style={{ backgroundColor: Colors.surfaceContainerHighest, borderRadius: Radius.md, paddingHorizontal: Spacing.base, paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 14, color: Colors.onSurfaceVariant }}>
                Entre para comentar
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

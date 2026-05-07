import { memo, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Comment, User } from '@/types/admin';

interface CommentItemProps {
  comment: Comment;
  author: User | undefined;
  currentUserId?: string;
  isIndented?: boolean;
  onLike: (commentId: string, userId: string) => void;
  onReport: (commentId: string, userId: string, reason: string) => void;
  onReply: (commentId: string, authorName: string) => void;
}

const REPORT_REASONS = ['Discurso de Ódio', 'Spam', 'Informação Falsa', 'Fora de Contexto'];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `há ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)}d`;
}

const CommentItem = memo(function CommentItem({
  comment,
  author,
  currentUserId,
  isIndented = false,
  onLike,
  onReport,
  onReply,
}: CommentItemProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const isLiked = currentUserId ? comment.likedByIds.includes(currentUserId) : false;
  const alreadyReported = currentUserId ? comment.reportedByIds.includes(currentUserId) : false;
  const initials = (author?.name ?? 'U').charAt(0).toUpperCase();

  return (
    <View style={{ marginLeft: isIndented ? Spacing.xl : 0, marginBottom: Spacing.base }}>
      {isIndented ? (
        <View style={{ position: 'absolute', left: -12, top: 0, bottom: 0, width: 2, backgroundColor: Colors.secondary, opacity: 0.3 }} />
      ) : null}

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 14, color: Colors.primary }}>{initials}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xs }}>
            <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 13, color: Colors.primary }}>
              {author?.name ?? 'Usuário'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 11, color: Colors.onSurfaceVariant }}>
                {timeAgo(comment.createdAt)}
              </Text>
              <TouchableOpacity onPress={() => setShowOptions(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="more-horizontal" size={16} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 14, lineHeight: 20, color: Colors.onSurface, marginBottom: Spacing.sm }}>
            {comment.content}
          </Text>

          <View style={{ flexDirection: 'row', gap: Spacing.base }}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}
              onPress={() => { if (currentUserId) onLike(comment.id, currentUserId); }}
            >
              <Feather name="heart" size={14} color={isLiked ? Colors.secondary : Colors.onSurfaceVariant} />
              <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 12, color: Colors.onSurfaceVariant }}>
                {comment.likeCount}
              </Text>
            </TouchableOpacity>
            {currentUserId ? (
              <TouchableOpacity onPress={() => onReply(comment.id, author?.name ?? 'Usuário')}>
                <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 12, color: Colors.onSurfaceVariant }}>
                  Responder
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      {/* Bottom sheet de opções */}
      <Modal visible={showOptions} transparent animationType="fade" onRequestClose={() => setShowOptions(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }} onPress={() => setShowOptions(false)}>
          <View style={{ backgroundColor: Colors.surfaceContainerLowest, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg, padding: Spacing.xl }}>
            <TouchableOpacity
              style={{ paddingVertical: 14 }}
              onPress={() => {
                setShowOptions(false);
                if (!alreadyReported) setShowReportModal(true);
              }}
            >
              <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 15, color: alreadyReported ? Colors.onSurfaceVariant : Colors.error }}>
                {alreadyReported ? 'Já denunciado — aguardando análise' : 'Denunciar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ paddingVertical: 14 }} onPress={() => setShowOptions(false)}>
              <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 15, color: Colors.onSurfaceVariant }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Modal de motivo de denúncia */}
      <Modal visible={showReportModal} transparent animationType="slide" onRequestClose={() => setShowReportModal(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }} onPress={() => setShowReportModal(false)}>
          <View style={{ backgroundColor: Colors.surfaceContainerLowest, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg, padding: Spacing.xl }}>
            <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 18, color: Colors.primary, marginBottom: Spacing.base }}>
              Motivo da denúncia
            </Text>
            {REPORT_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={{ paddingVertical: 14 }}
                onPress={() => {
                  setShowReportModal(false);
                  if (currentUserId) onReport(comment.id, currentUserId, reason);
                }}
              >
                <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 15, color: Colors.onSurface }}>{reason}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
});

export default CommentItem;

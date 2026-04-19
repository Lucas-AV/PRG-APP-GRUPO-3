import { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  SafeAreaView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useChronicleStore } from '@/store/chronicleStore';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function Compose() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const newsId = Array.isArray(id) ? id[0] : id;

  const { currentUser, news, tags, cities, addNews, updateNews, submitForReview } = useChronicleStore();

  const existing = newsId ? news.find((n) => n.id === newsId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [contentBody, setContentBody] = useState(existing?.contentBody ?? '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(existing?.tagIds ?? []);
  const [cityId, setCityId] = useState<string | undefined>(existing?.cityId);
  const [coverImageUrl, setCoverImageUrl] = useState(existing?.coverImageUrl ?? '');

  const isEditing = !!existing;
  const isDraft = !existing || existing.status === 'rascunho' || existing.status === 'lixeira';

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((tid) => tid !== tagId) : [...prev, tagId]
    );
  }

  function buildPayload() {
    return {
      title: title.trim(),
      contentBody: contentBody.trim(),
      tagIds: selectedTagIds,
      cityId: cityId || undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
    };
  }

  function validate(): boolean {
    if (!title.trim()) {
      Alert.alert('Título obrigatório', 'Adicione um título para continuar.');
      return false;
    }
    if (!contentBody.trim()) {
      Alert.alert('Conteúdo obrigatório', 'Escreva o corpo do artigo para continuar.');
      return false;
    }
    return true;
  }

  function handleSaveDraft() {
    if (!title.trim() && !contentBody.trim()) {
      router.back();
      return;
    }
    if (!title.trim()) {
      Alert.alert('Título obrigatório', 'Adicione um título para salvar o rascunho.');
      return;
    }
    const payload = buildPayload();
    if (isEditing && newsId) {
      updateNews(newsId, payload);
    } else {
      addNews(payload);
    }
    router.back();
  }

  function handleSubmit() {
    if (!validate()) return;
    const payload = buildPayload();
    Alert.alert('Enviar para Revisão', 'O artigo será enviado para análise editorial. Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Enviar',
        onPress: () => {
          if (isEditing && newsId) {
            updateNews(newsId, payload);
            submitForReview(newsId);
          } else {
            addNews(payload);
            setTimeout(() => {
              const { news: latestNews, submitForReview: submit } = useChronicleStore.getState();
              const created = latestNews
                .filter((n) => n.authorId === currentUser?.id && n.status === 'rascunho')
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
              if (created) submit(created.id);
            }, 0);
          }
          router.back();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="x" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Newsreader_700Bold', fontSize: 18, color: Colors.primary }}>
            {isEditing ? 'Editar Artigo' : 'Novo Artigo'}
          </Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: Spacing.base, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13, color: Colors.onSurfaceVariant, marginBottom: Spacing.xs }}>
            Título *
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Digite o título do artigo"
            placeholderTextColor={Colors.onSurfaceVariant}
            multiline
            style={{
              fontFamily: 'Newsreader_400Regular',
              fontSize: 20,
              color: Colors.primary,
              backgroundColor: Colors.surfaceContainerLowest,
              borderRadius: Radius.DEFAULT,
              padding: Spacing.base,
              marginBottom: Spacing.base,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
          />

          {/* Cover Image URL */}
          <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13, color: Colors.onSurfaceVariant, marginBottom: Spacing.xs }}>
            URL da Imagem de Capa
          </Text>
          <TextInput
            value={coverImageUrl}
            onChangeText={setCoverImageUrl}
            placeholder="https://..."
            placeholderTextColor={Colors.onSurfaceVariant}
            autoCapitalize="none"
            keyboardType="url"
            style={{
              fontFamily: 'WorkSans_400Regular',
              fontSize: 14,
              color: Colors.primary,
              backgroundColor: Colors.surfaceContainerLowest,
              borderRadius: Radius.DEFAULT,
              padding: Spacing.base,
              marginBottom: Spacing.base,
            }}
          />

          {/* Tags */}
          <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13, color: Colors.onSurfaceVariant, marginBottom: Spacing.sm }}>
            Categorias
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.base }}>
            {tags.map((tag) => {
              const selected = selectedTagIds.includes(tag.id);
              return (
                <TouchableOpacity
                  key={tag.id}
                  onPress={() => toggleTag(tag.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  style={{
                    backgroundColor: selected ? tag.colorHex : Colors.surfaceContainerHigh,
                    borderRadius: Radius.full,
                    paddingHorizontal: Spacing.base,
                    paddingVertical: Spacing.sm,
                  }}
                >
                  <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13, color: selected ? '#fff' : Colors.onSurfaceVariant }}>
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* City */}
          <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13, color: Colors.onSurfaceVariant, marginBottom: Spacing.sm }}>
            Cidade
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.base }}>
            <TouchableOpacity
              onPress={() => setCityId(undefined)}
              accessibilityRole="radio"
              accessibilityState={{ checked: !cityId }}
              style={{
                backgroundColor: !cityId ? Colors.primary : Colors.surfaceContainerHigh,
                borderRadius: Radius.full,
                paddingHorizontal: Spacing.base,
                paddingVertical: Spacing.sm,
              }}
            >
              <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13, color: !cityId ? Colors.onPrimary : Colors.onSurfaceVariant }}>
                Nacional
              </Text>
            </TouchableOpacity>
            {cities.map((city) => {
              const selected = cityId === city.id;
              return (
                <TouchableOpacity
                  key={city.id}
                  onPress={() => setCityId(city.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  style={{
                    backgroundColor: selected ? Colors.primary : Colors.surfaceContainerHigh,
                    borderRadius: Radius.full,
                    paddingHorizontal: Spacing.base,
                    paddingVertical: Spacing.sm,
                  }}
                >
                  <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13, color: selected ? Colors.onPrimary : Colors.onSurfaceVariant }}>
                    {city.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Content body */}
          <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13, color: Colors.onSurfaceVariant, marginBottom: Spacing.xs }}>
            Conteúdo *
          </Text>
          <TextInput
            value={contentBody}
            onChangeText={setContentBody}
            placeholder="Escreva o conteúdo do artigo aqui..."
            placeholderTextColor={Colors.onSurfaceVariant}
            multiline
            style={{
              fontFamily: 'WorkSans_400Regular',
              fontSize: 15,
              color: Colors.primary,
              backgroundColor: Colors.surfaceContainerLowest,
              borderRadius: Radius.DEFAULT,
              padding: Spacing.base,
              minHeight: 200,
              textAlignVertical: 'top',
              lineHeight: 24,
            }}
          />
        </ScrollView>

        {/* Bottom Actions */}
        <View
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            backgroundColor: Colors.surface,
            padding: Spacing.base, paddingBottom: 32,
            flexDirection: 'row', gap: Spacing.sm,
          }}
        >
          {isDraft ? (
            <>
              <TouchableOpacity
                onPress={handleSaveDraft}
                style={{ flex: 1, backgroundColor: Colors.surfaceContainerHigh, borderRadius: Radius.DEFAULT, paddingVertical: Spacing.base, alignItems: 'center' }}
                accessibilityRole="button"
              >
                <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 14, color: Colors.primary }}>
                  Salvar Rascunho
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                style={{ flex: 1, backgroundColor: Colors.primary, borderRadius: Radius.DEFAULT, paddingVertical: Spacing.base, alignItems: 'center' }}
                accessibilityRole="button"
              >
                <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 14, color: Colors.onPrimary }}>
                  Enviar para Revisão
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ flex: 1, backgroundColor: Colors.surfaceContainerHigh, borderRadius: Radius.DEFAULT, paddingVertical: Spacing.base, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 14, color: Colors.onSurfaceVariant }}>
                Artigo somente leitura
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { servicesApi, serviceImagesApi, ServiceImage } from '@/services/api';

const CATEGORIES = [
  'Bem-estar e Saúde',
  'Reformas e Manutenção',
  'Eventos e Festas',
  'Tecnologia e Design',
  'Limpeza',
  'Outros',
];

export default function EditServiceScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();

  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<'fixo' | 'a_partir_de'>('fixo');
  const [showCategory, setShowCategory] = useState(false);
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<ServiceImage[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    if (!token || !id) return;
    Promise.all([
      servicesApi.get(Number(id), token),
      serviceImagesApi.list(Number(id), token),
    ])
      .then(([s, imgs]) => {
        setName(s.name);
        setDescription(s.description ?? '');
        setPrice(s.price != null ? String(s.price) : '');
        setPriceType(s.price_type);
        setCategory(s.category ?? '');
        setImages(imgs);
      })
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar o serviço.'))
      .finally(() => setFetchLoading(false));
  }, [id, token]);

  const pickAndUploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });
    if (result.canceled) return;
    setImageUploading(true);
    try {
      const img = await serviceImagesApi.upload(Number(id), result.assets[0].uri, token!);
      setImages(prev => [...prev, img]);
    } catch (e: any) {
      Alert.alert('Erro ao enviar', e.message ?? 'Não foi possível enviar a imagem.');
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = async (imageId: number) => {
    try {
      await serviceImagesApi.remove(Number(id), imageId, token!);
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível remover a imagem.');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome do serviço.');
      return;
    }
    if (!token) return;
    setSaving(true);
    try {
      await servicesApi.update(Number(id), {
        name: name.trim(),
        category: category || undefined,
        price: price ? parseFloat(price.replace(',', '.')) : undefined,
        price_type: priceType,
        description: description.trim() || undefined,
      }, token);
      router.back();
    } catch (e: any) {
      Alert.alert('Erro ao salvar', e.message ?? 'Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Serviço',
      'Esta ação é permanente e não pode ser desfeita. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            try {
              await servicesApi.remove(Number(id), token);
              router.back();
            } catch (e: any) {
              Alert.alert('Erro ao excluir', e.message ?? 'Tente novamente.');
            }
          },
        },
      ]
    );
  };

  if (fetchLoading) {
    return (
      <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Editar Serviço</Text>
        <Pressable style={styles.saveTextBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveTextBtnLabel}>Salvar</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 100, 120) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Identidade do serviço */}
        <View style={styles.identityCard}>
          <Text style={styles.sectionLabel}>NOME DO SERVIÇO</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Nome do serviço"
            placeholderTextColor={Colors.border}
          />
        </View>

        {/* Categoria */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>CATEGORIA</Text>
          <Pressable
            style={styles.selector}
            onPress={() => setShowCategory((v) => !v)}
          >
            <Text style={[styles.selectorText, !category && styles.selectorPlaceholder]}>
              {category || 'Selecione uma categoria'}
            </Text>
            <MaterialIcons
              name={showCategory ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={20}
              color={Colors.inkMuted}
            />
          </Pressable>
          {showCategory && (
            <View style={styles.dropdown}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {CATEGORIES.map((c) => (
                  <Pressable
                    key={c}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCategory(c);
                      setShowCategory(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{c}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Preço e Duração */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preço e Duração</Text>

          <View style={styles.pricingCards}>
            {/* Price card */}
            <View style={styles.pricingCard}>
              <View>
                <Text style={styles.fieldLabel}>MODELO DE PREÇO</Text>
                <View style={styles.priceToggle}>
                  <Pressable
                    style={[styles.priceBtn, priceType === 'fixo' && styles.priceBtnActive]}
                    onPress={() => setPriceType('fixo')}
                  >
                    <Text style={[styles.priceBtnText, priceType === 'fixo' && styles.priceBtnTextActive]}>
                      Fixo
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.priceBtn, priceType === 'a_partir_de' && styles.priceBtnActive]}
                    onPress={() => setPriceType('a_partir_de')}
                  >
                    <Text style={[styles.priceBtnText, priceType === 'a_partir_de' && styles.priceBtnTextActive]}>
                      A partir de
                    </Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.priceInputWrap}>
                <Text style={styles.fieldLabel}>VALOR (R$)</Text>
                <TextInput
                  style={styles.priceInput}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0,00"
                  placeholderTextColor={Colors.inkMuted}
                  keyboardType="numeric"
                  textAlign="right"
                />
              </View>
            </View>

            {/* Duration card */}
            <View style={styles.pricingCard}>
              <View style={styles.flex1}>
                <Text style={styles.fieldLabel}>DURAÇÃO</Text>
                <Text style={styles.pricingCardSubtitle}>
                  Tempo médio de atendimento
                </Text>
              </View>
              <View style={styles.priceInputWrap}>
                <Text style={styles.fieldLabel}>MINUTOS</Text>
                <TextInput
                  style={styles.priceInput}
                  defaultValue="60"
                  keyboardType="numeric"
                  textAlign="right"
                  placeholderTextColor={Colors.inkMuted}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <View style={styles.sectionHeadRow}>
            <Text style={styles.sectionTitle}>Descrição do Serviço</Text>
            <Text style={styles.richTextHint}>Texto livre</Text>
          </View>
          <View style={styles.descriptionCard}>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Explique os benefícios, o processo e os materiais utilizados neste serviço..."
              placeholderTextColor={Colors.inkMuted + '88'}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Galeria de fotos */}
        <View style={styles.section}>
          <View style={styles.sectionHeadRow}>
            <Text style={styles.sectionTitle}>Galeria de Fotos</Text>
            <Pressable style={styles.addPhotoBtn} onPress={pickAndUploadImage} disabled={imageUploading}>
              <MaterialIcons name="add-a-photo" size={14} color={Colors.brand} />
              <Text style={styles.addPhotoBtnText}>Adicionar</Text>
            </Pressable>
          </View>

          <View style={styles.photoGrid}>
            {images.map((img) => (
              <Pressable key={img.id} style={styles.photoSlot} onPress={() => setPreviewUrl(img.url)}>
                <Image source={{ uri: img.url }} style={styles.photoThumb} />
                <Pressable style={styles.photoDeleteBtn} onPress={() => removeImage(img.id)}>
                  <MaterialIcons name="close" size={14} color="#fff" />
                </Pressable>
              </Pressable>
            ))}
            <Pressable style={styles.photoUpload} onPress={pickAndUploadImage} disabled={imageUploading}>
              {imageUploading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <MaterialIcons name="cloud-upload" size={22} color={Colors.inkMuted} />
                  <Text style={styles.photoUploadLabel}>UPLOAD</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {/* Exclusão */}
        <View style={styles.deleteSection}>
          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <MaterialIcons name="delete-forever" size={18} color={Colors.error} />
            <Text style={styles.deleteBtnText}>Excluir Serviço Permanentemente</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 8, Spacing.xl) }]}>
        <View style={styles.bottomActions}>
          <Pressable
            style={({ pressed }) => [styles.discardBtn, pressed && { opacity: 0.6 }]}
            onPress={() => router.back()}
          >
            <MaterialIcons name="close" size={18} color={Colors.inkMuted} />
            <Text style={styles.discardBtnText}>Descartar</Text>
          </Pressable>
          <GradientButton
            label={saving ? 'Salvando…' : 'Salvar Alterações'}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveBtn}
          />
        </View>
      </View>
      {/* Image preview modal */}
      <Modal visible={!!previewUrl} transparent animationType="fade" onRequestClose={() => setPreviewUrl(null)}>
        <Pressable style={styles.previewBackdrop} onPress={() => setPreviewUrl(null)}>
          <Image
            source={{ uri: previewUrl ?? '' }}
            style={{ width: screenWidth - 48, height: screenWidth - 48, borderRadius: 16 }}
            resizeMode="contain"
          />
          <Pressable style={styles.previewClose} onPress={() => setPreviewUrl(null)}>
            <MaterialIcons name="close" size={20} color="#fff" />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.base,
    backgroundColor: Colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    letterSpacing: -0.4,
    color: Colors.ink,
  },
  saveTextBtn: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  saveTextBtnLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 15,
    color: Colors.primary,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    gap: Spacing.xxl,
  },

  // Identity card
  identityCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    justifyContent: 'flex-end',
    minHeight: 110,
  },
  sectionLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 10,
    color: Colors.inkMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  nameInput: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 26,
    letterSpacing: -0.8,
    color: Colors.ink,
    padding: 0,
  },

  section: { gap: Spacing.base },
  sectionTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    letterSpacing: -0.4,
    color: Colors.ink,
  },
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  richTextHint: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 10,
    color: Colors.inkMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  fieldLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 10,
    color: Colors.inkMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  selectorText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.ink,
  },
  selectorPlaceholder: { color: Colors.inkMuted },
  dropdown: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 4,
  },
  dropdownScroll: { maxHeight: 160 },
  dropdownItem: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  dropdownItemText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.ink,
  },

  // Pricing
  pricingCards: { gap: Spacing.base },
  pricingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    gap: Spacing.base,
  },
  flex1: { flex: 1 },
  pricingCardSubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 4,
  },
  priceToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.border,
    borderRadius: Radius.sm,
    padding: 3,
    marginTop: Spacing.sm,
  },
  priceBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  priceBtnActive: {
    backgroundColor: Colors.brand + '15',
  },
  priceBtnText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  priceBtnTextActive: { color: Colors.brand },
  priceInputWrap: { alignItems: 'flex-end' },
  priceInput: {
    backgroundColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.ink,
    width: 96,
    textAlign: 'right',
  },

  // Description
  descriptionCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  descriptionInput: {
    padding: Spacing.xxl,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.ink,
    lineHeight: 22,
    minHeight: 130,
    textAlignVertical: 'top',
  },

  // Photo gallery
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.brand + '15',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  addPhotoBtnText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 12,
    color: Colors.brand,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.base,
  },
  photoSlot: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.card,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
  },
  photoDeleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoUpload: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoUploadLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 9,
    color: Colors.inkMuted,
    letterSpacing: 1,
  },

  // Delete
  deleteSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
  },
  deleteBtnText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: Colors.error,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewClose: {
    position: 'absolute',
    top: 48,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl + 4,
    backgroundColor: Colors.card,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: Spacing.base,
    alignItems: 'center',
  },
  discardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
  },
  discardBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  saveBtn: { flex: 1 },
});

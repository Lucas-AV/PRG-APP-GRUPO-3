import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

const CATEGORIES = [
  'Bem-estar e Saúde',
  'Reformas e Manutenção',
  'Eventos e Festas',
  'Tecnologia e Design',
  'Limpeza',
  'Outros',
];

const MOCK_SERVICES: Record<string, { title: string; category: string; price: string; priceType: 'fixo' | 'a_partir_de'; description: string }> = {
  '1': {
    title: 'Instalação de Tomadas',
    category: 'Reformas e Manutenção',
    price: '80,00',
    priceType: 'a_partir_de',
    description: 'Instalação profissional de tomadas e interruptores residenciais e comerciais. Inclui material básico, mão de obra e teste de funcionamento.',
  },
  '2': {
    title: 'Manutenção de AC',
    category: 'Reformas e Manutenção',
    price: '150,00',
    priceType: 'a_partir_de',
    description: 'Limpeza completa e manutenção preventiva de ar-condicionado. Inclui higienização dos filtros, verificação do gás e teste de operação.',
  },
  '3': {
    title: 'Pintura Residencial',
    category: 'Reformas e Manutenção',
    price: '',
    priceType: 'a_partir_de',
    description: '',
  },
};

export default function EditServiceScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mock = MOCK_SERVICES[id ?? '1'] ?? MOCK_SERVICES['1'];

  const [name, setName] = useState(mock.title);
  const [description, setDescription] = useState(mock.description);
  const [price, setPrice] = useState(mock.price);
  const [priceType, setPriceType] = useState<'fixo' | 'a_partir_de'>(mock.priceType);

  const [showCategory, setShowCategory] = useState(false);
  const [category, setCategory] = useState(mock.category);

  const handleDelete = () => {
    Alert.alert(
      'Excluir Serviço',
      'Esta ação é permanente e não pode ser desfeita. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Editar Serviço</Text>
        <Pressable style={styles.saveTextBtn} onPress={() => router.back()}>
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
            placeholderTextColor={Colors.outlineVariant}
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
              color={Colors.outline}
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
                  placeholderTextColor={Colors.outline}
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
                  placeholderTextColor={Colors.outline}
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
              placeholderTextColor={Colors.outline + '88'}
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
            <Pressable style={styles.addPhotoBtn}>
              <MaterialIcons name="add-a-photo" size={14} color={Colors.onPrimaryContainer} />
              <Text style={styles.addPhotoBtnText}>Adicionar</Text>
            </Pressable>
          </View>

          <View style={styles.photoGrid}>
            {[Colors.surfaceContainerHigh, Colors.surfaceContainerHighest, Colors.surfaceContainerHigh].map(
              (bg, i) => (
                <View key={i} style={[styles.photoSlot, { backgroundColor: bg }]}>
                  <MaterialIcons name="image" size={24} color={Colors.outlineVariant} />
                  <Pressable style={styles.photoDeleteBtn}>
                    <MaterialIcons name="close" size={14} color="#fff" />
                  </Pressable>
                </View>
              )
            )}
            <Pressable style={styles.photoUpload}>
              <MaterialIcons name="cloud-upload" size={22} color={Colors.outline} />
              <Text style={styles.photoUploadLabel}>UPLOAD</Text>
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
            <MaterialIcons name="close" size={18} color={Colors.onSurfaceVariant} />
            <Text style={styles.discardBtnText}>Descartar</Text>
          </Pressable>
          <GradientButton
            label="Salvar Alterações"
            onPress={() => router.back()}
            style={styles.saveBtn}
          />
        </View>
      </View>
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
    backgroundColor: Colors.surfaceContainerLowest,
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
    color: Colors.onSurface,
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
    backgroundColor: Colors.surfaceContainerLowest,
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
    color: Colors.outline,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  nameInput: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 26,
    letterSpacing: -0.8,
    color: Colors.onSurface,
    padding: 0,
  },

  section: { gap: Spacing.base },
  sectionTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    letterSpacing: -0.4,
    color: Colors.onSurface,
  },
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  richTextHint: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 10,
    color: Colors.outline,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  fieldLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  selectorText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurface,
  },
  selectorPlaceholder: { color: Colors.outline },
  dropdown: {
    backgroundColor: Colors.surfaceContainerLowest,
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
    color: Colors.onSurface,
  },

  // Pricing
  pricingCards: { gap: Spacing.base },
  pricingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLowest,
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
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  priceToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHighest,
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
    backgroundColor: Colors.primaryContainer,
  },
  priceBtnText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  priceBtnTextActive: { color: Colors.onPrimaryContainer },
  priceInputWrap: { alignItems: 'flex-end' },
  priceInput: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.onSurface,
    width: 96,
    textAlign: 'right',
  },

  // Description
  descriptionCard: {
    backgroundColor: Colors.surfaceContainerLowest,
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
    color: Colors.onSurface,
    lineHeight: 22,
    minHeight: 130,
    textAlignVertical: 'top',
  },

  // Photo gallery
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  addPhotoBtnText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 12,
    color: Colors.onPrimaryContainer,
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
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoUploadLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 9,
    color: Colors.outline,
    letterSpacing: 1,
  },

  // Delete
  deleteSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 2,
    borderTopColor: Colors.surfaceContainerHighest,
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

  // Bottom bar
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl + 4,
    backgroundColor: Colors.surfaceContainerLowest,
    shadowColor: Colors.onSurface,
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
    color: Colors.onSurfaceVariant,
  },
  saveBtn: { flex: 1 },
});

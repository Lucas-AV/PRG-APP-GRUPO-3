import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { servicesApi } from '@/services/api';

const CATEGORIES = [
  'Bem-estar e Saúde',
  'Reformas e Manutenção',
  'Eventos e Festas',
  'Tecnologia e Design',
  'Limpeza',
  'Outros',
];

const DURATIONS = ['1h', '2h', '3h', '4–6h', 'Diária', 'A combinar'];

export default function CreateServiceScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<'fixo' | 'a_partir_de'>('fixo');
  const [publishNow, setPublishNow] = useState(true);
  const [loading, setLoading] = useState(false);

  const [showCategory, setShowCategory] = useState(false);
  const [category, setCategory] = useState('');

  const [showDuration, setShowDuration] = useState(false);
  const [duration, setDuration] = useState('');

  const handleSave = async (asDraft: boolean) => {
    if (!name.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome do serviço.');
      return;
    }
    if (!token) return;
    setLoading(true);
    try {
      await servicesApi.create({
        name: name.trim(),
        category: category || undefined,
        price: price ? parseFloat(price.replace(',', '.')) : undefined,
        price_type: priceType,
        duration: duration || undefined,
        description: description.trim() || undefined,
        status: asDraft ? 'rascunho' : (publishNow ? 'ativo' : 'rascunho'),
      }, token);
      router.back();
    } catch (e: any) {
      Alert.alert('Erro ao salvar', e.message ?? 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Criar Serviço</Text>
        <View style={{ width: 40 }} />
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
        {/* Passo 01 */}
        <View style={styles.section}>
          <View style={styles.stepHead}>
            <Text style={styles.stepNumber}>Passo 01</Text>
            <Text style={styles.stepTitle}>Informações Básicas</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>NOME DO SERVIÇO</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Fotografia de Casamento Premium"
              placeholderTextColor={Colors.inkMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldGroup}>
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
        </View>

        {/* Passo 02 */}
        <View style={styles.section}>
          <View style={styles.stepHead}>
            <Text style={styles.stepNumber}>Passo 02</Text>
            <Text style={styles.stepTitle}>Preços e Duração</Text>
          </View>

          <View style={styles.twoCol}>
            <View style={styles.flex1}>
              <Text style={styles.fieldLabel}>VALOR DO SERVIÇO (R$)</Text>
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
              <TextInput
                style={styles.input}
                placeholder="0,00"
                placeholderTextColor={Colors.inkMuted}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.flex1}>
              <Text style={styles.fieldLabel}>DURAÇÃO</Text>
              <Pressable
                style={[styles.selector, { marginTop: 50 }]}
                onPress={() => setShowDuration((v) => !v)}
              >
                <Text style={[styles.selectorText, !duration && styles.selectorPlaceholder]}>
                  {duration || 'Selecione'}
                </Text>
                <MaterialIcons
                  name={showDuration ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={20}
                  color={Colors.inkMuted}
                />
              </Pressable>
              {showDuration && (
                <View style={styles.dropdown}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {DURATIONS.map((d) => (
                      <Pressable
                        key={d}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setDuration(d);
                          setShowDuration(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{d}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Passo 03 */}
        <View style={styles.section}>
          <View style={styles.stepHead}>
            <Text style={styles.stepNumber}>Passo 03</Text>
            <Text style={styles.stepTitle}>O que está incluso?</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Descreva detalhadamente o que o cliente receberá ao contratar este serviço..."
            placeholderTextColor={Colors.inkMuted + '99'}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Passo 04 */}
        <View style={styles.section}>
          <View style={styles.stepHead}>
            <Text style={styles.stepNumber}>Passo 04</Text>
            <Text style={styles.stepTitle}>Fotos do Serviço</Text>
          </View>
          <View style={styles.photoGrid}>
            <Pressable style={styles.photoUpload}>
              <MaterialIcons name="add-a-photo" size={28} color={Colors.inkMuted} />
              <Text style={styles.photoUploadLabel}>Adicionar</Text>
            </Pressable>
            <View style={styles.photoSlot}>
              <MaterialIcons name="image" size={28} color={Colors.border} />
            </View>
            <View style={[styles.photoSlot, { backgroundColor: Colors.border }]}>
              <MaterialIcons name="image" size={28} color={Colors.border} />
            </View>
          </View>
        </View>

        {/* Publicar agora */}
        <View style={styles.publishCard}>
          <View style={styles.publishText}>
            <Text style={styles.publishTitle}>Publicar agora</Text>
            <Text style={styles.publishSubtitle}>
              Seu serviço ficará visível imediatamente para clientes.
            </Text>
          </View>
          <Switch
            value={publishNow}
            onValueChange={setPublishNow}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor="#ffffff"
          />
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 8, Spacing.xl) }]}>
        <GradientButton
          label={loading ? 'Salvando…' : 'Salvar e Publicar'}
          onPress={() => handleSave(false)}
          disabled={loading}
        />
        <Pressable style={styles.draftBtn} onPress={() => handleSave(true)} disabled={loading}>
          <Text style={styles.draftBtnText}>Salvar como Rascunho</Text>
        </Pressable>
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

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    gap: Spacing.xxxl,
  },

  section: { gap: Spacing.base },
  stepHead: { gap: 2 },
  stepNumber: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 11,
    color: Colors.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  stepTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 22,
    letterSpacing: -0.6,
    color: Colors.ink,
  },

  fieldGroup: { gap: Spacing.sm },
  fieldLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 10,
    color: Colors.inkMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.ink,
  },
  textarea: {
    minHeight: 110,
    paddingTop: Spacing.base,
    textAlignVertical: 'top',
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
  selectorPlaceholder: {
    color: Colors.inkMuted,
  },
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

  twoCol: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  flex1: { flex: 1 },

  priceToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.border,
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: Spacing.sm,
  },
  priceBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  priceBtnActive: {
    backgroundColor: Colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  priceBtnText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  priceBtnTextActive: {
    color: Colors.primary,
  },

  photoGrid: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  photoUpload: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.card,
  },
  photoUploadLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 10,
    color: Colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  photoSlot: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Radius.xl,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  publishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
  },
  publishText: { gap: Spacing.xs, flex: 1, marginRight: Spacing.base },
  publishTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 15,
    color: Colors.ink,
  },
  publishSubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.inkMuted,
    lineHeight: 17,
  },

  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl + 4,
    gap: Spacing.xs,
    backgroundColor: Colors.card,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
  draftBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  draftBtnText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: Colors.inkMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

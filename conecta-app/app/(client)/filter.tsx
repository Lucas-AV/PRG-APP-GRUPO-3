import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, Spacing, Radius, GradientColors } from '@/constants/theme';

// ── Componente de Filtro ───────────────────────────────────────────────────────
export default function FilterScreen() {
  // Obter parâmetros passados para pré-seleção
  const params = useLocalSearchParams<{
    source?: string;
    q?: string;
    category?: string;
    sortBy?: string;
    distance?: string;
    rating?: string;
    priceRange?: string;
  }>();

  const source = params.source || 'feed';

  // Estados locais dos filtros
  const [sortBy, setSortBy] = useState<string>(params.sortBy || 'Relevância');
  const [distance, setDistance] = useState<string>(params.distance || '5');
  const [rating, setRating] = useState<string>(params.rating || 'Qualquer');
  const [priceRange, setPriceRange] = useState<string>(params.priceRange || 'R$$');
  const [category, setCategory] = useState<string>(params.category || 'Reformas');

  // Limpar todos os filtros (Valores Padrão do Template)
  const handleClear = () => {
    setSortBy('Relevância');
    setDistance('5');
    setRating('Qualquer');
    setPriceRange('R$$');
    setCategory('Reformas');
  };

  // Confirmar e aplicar filtros
  const handleShowResults = () => {
    const targetPath = source === 'search' ? '/(client)/search' : '/(tabs)/';
    
    router.navigate({
      pathname: targetPath as any,
      params: {
        q: params.q || '',
        category: category,
        sortBy: sortBy,
        distance: distance,
        rating: rating,
        priceRange: priceRange,
        applied: 'true',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── TopAppBar ──────────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
            onPress={() => router.back()}
          >
            <MaterialIcons name="close" size={24} color={Colors.ink} />
          </Pressable>
          <Text style={styles.topBarTitle}>Filtros</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.7 }]}
          onPress={handleClear}
        >
          <Text style={styles.clearBtnText}>Clear</Text>
        </Pressable>
      </View>

      {/* ── Conteúdo Central ───────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Seção: Ordenar por */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ordenar por</Text>
            <Text style={styles.sectionSubtitle}>Obrigatório</Text>
          </View>
          <View style={styles.optionsList}>
            {['Relevância', 'Distância', 'Avaliação', 'Preço'].map((opt) => {
              const active = sortBy === opt;
              return (
                <Pressable
                  key={opt}
                  style={[
                    styles.optionCard,
                    active ? styles.optionCardActive : styles.optionCardInactive,
                  ]}
                  onPress={() => setSortBy(opt)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      active ? styles.optionTextActive : styles.optionTextInactive,
                    ]}
                  >
                    {opt}
                  </Text>
                  <View
                    style={[
                      styles.radioCircle,
                      active ? styles.radioCircleActive : styles.radioCircleInactive,
                    ]}
                  >
                    {active && <View style={styles.radioDot} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Seção: Distância */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distância</Text>
          <View style={styles.distanceCard}>
            {/* Custom Distance Slider Bar */}
            <View style={styles.sliderTrackContainer}>
              <View style={styles.sliderTrack} />
              {/* Marcador de progresso */}
              <View
                style={[
                  styles.sliderProgress,
                  {
                    width:
                      distance === '1'
                        ? '0%'
                        : distance === '5'
                        ? '33.3%'
                        : distance === '10'
                        ? '66.6%'
                        : '100%',
                  },
                ]}
              />
              {/* Pontos fixos */}
              <View style={styles.sliderDotsRow}>
                {['1', '5', '10', 'Qualquer'].map((val) => (
                  <Pressable
                    key={val}
                    style={styles.sliderDotPressable}
                    onPress={() => setDistance(val)}
                  >
                    <View
                      style={[
                        styles.sliderDot,
                        distance === val && styles.sliderDotActive,
                      ]}
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Rótulos da distância */}
            <View style={styles.distanceLabelsRow}>
              <Text
                style={[
                  styles.distanceLabel,
                  distance === '1' && styles.distanceLabelActive,
                ]}
              >
                Até 1km
              </Text>
              <Text
                style={[
                  styles.distanceLabel,
                  distance === '5' && styles.distanceLabelActive,
                ]}
              >
                Até 5km
              </Text>
              <Text
                style={[
                  styles.distanceLabel,
                  distance === '10' && styles.distanceLabelActive,
                ]}
              >
                Até 10km
              </Text>
              <Text
                style={[
                  styles.distanceLabel,
                  distance === 'Qualquer' && styles.distanceLabelActive,
                ]}
              >
                Qualquer
              </Text>
            </View>
          </View>
        </View>

        {/* Seção: Avaliação */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avaliação</Text>
          <View style={styles.ratingRow}>
            {['4.5+', '4.0+', 'Qualquer'].map((val) => {
              const active = rating === val;
              return (
                <Pressable
                  key={val}
                  style={[
                    styles.ratingBtn,
                    active ? styles.ratingBtnActive : styles.ratingBtnInactive,
                  ]}
                  onPress={() => setRating(val)}
                >
                  {val !== 'Qualquer' && (
                    <MaterialIcons name="star" size={16} color="#f59e0b" style={{ marginRight: 4 }} />
                  )}
                  <Text
                    style={[
                      styles.ratingBtnText,
                      active ? styles.ratingBtnTextActive : styles.ratingBtnTextInactive,
                    ]}
                  >
                    {val}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Seção: Faixa de Preço */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Faixa de Preço</Text>
          <View style={styles.priceRow}>
            {['R$', 'R$$', 'R$$$', 'R$$$$'].map((val) => {
              const active = priceRange === val;
              return (
                <Pressable
                  key={val}
                  style={({ pressed }) => [
                    styles.priceBtn,
                    active ? styles.priceBtnActive : styles.priceBtnInactive,
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={() => setPriceRange(val)}
                >
                  <Text
                    style={[
                      styles.priceBtnText,
                      active ? styles.priceBtnTextActive : styles.priceBtnTextInactive,
                    ]}
                  >
                    {val}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Seção: Categorias */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categorias</Text>
            <Pressable>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </Pressable>
          </View>
          <View style={styles.categoriesWrap}>
            {[
              { label: 'Limpeza', icon: 'cleaning-services' as const },
              { label: 'Reformas', icon: 'construction' as const },
              { label: 'Aulas', icon: 'school' as const },
              { label: 'Tecnologia', icon: 'devices' as const },
            ].map((cat) => {
              const active = category === cat.label;
              return (
                <Pressable
                  key={cat.label}
                  style={[
                    styles.categoryChip,
                    active ? styles.categoryChipActive : styles.categoryChipInactive,
                  ]}
                  onPress={() => setCategory(cat.label)}
                >
                  <MaterialIcons
                    name={cat.icon}
                    size={18}
                    color={active ? Colors.brand : Colors.ink}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      active ? styles.categoryChipTextActive : styles.categoryChipTextInactive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Contextual Visual Hint */}
        <View style={styles.visualHintContainer}>
          <View style={styles.hintCard}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJseHimdm5vOxMt8Hgaj0p0G8VgXJr-Q54cueOgXehbfupO5j23wk_APJasUTXXWWWgC-Zi8L4BD9dz2ykUl7eo3aMqYhn-CfpKePcn_UhAVCrzH5nPvzzqFCVpjigSuhs53WoJxKwhzJfLhmV1-slbyRRNKyxpR2LNAAP2BRBbebkt3_XpQhn923wtU5wTMMYtgYpkHmAKtfMTkcTWT2ALkhKC3pqIXnLG7HHIceh4xDZfQUtxvJLoaY1c6pn5VR_7Lzc8XSo26E',
              }}
              style={styles.hintImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.hintGradient}
            >
              <Text style={styles.hintTitle}>Encontre os melhores profissionais</Text>
              <Text style={styles.hintSubtitle}>
                Mais de 5.000 prestadores verificados na sua região.
              </Text>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.showResultsBtn, pressed && { opacity: 0.95 }]}
          onPress={handleShowResults}
        >
          <LinearGradient
            colors={GradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBtn}
          >
            <MaterialIcons name="check-circle" size={20} color={Colors.onPrimary} style={{ marginRight: Spacing.sm }} />
            <Text style={styles.showResultsText}>Show results</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  topBarTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.ink,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPressed: {
    backgroundColor: Colors.card,
  },
  clearBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.sm,
  },
  clearBtnText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 16,
    color: Colors.primary,
  },
  scrollContent: {
    paddingBottom: 120, // Espaço para o rodapé fixo
  },
  section: {
    marginTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 22,
    color: Colors.ink,
    letterSpacing: -0.4,
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 10,
    color: Colors.inkMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.md + 4,
  },
  seeAllText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  optionsList: {
    gap: Spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  optionCardActive: {
    backgroundColor: Colors.card,
    borderColor: Colors.brand + '15',
  },
  optionCardInactive: {
    backgroundColor: Colors.card,
    borderColor: 'transparent',
  },
  optionText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
  },
  optionTextActive: {
    color: Colors.ink,
  },
  optionTextInactive: {
    color: Colors.inkMuted,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: Colors.primary,
  },
  radioCircleInactive: {
    borderColor: Colors.border,
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  distanceCard: {
    backgroundColor: Colors.card,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    gap: Spacing.xl,
  },
  sliderTrackContainer: {
    height: 30,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    width: '100%',
  },
  sliderProgress: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    position: 'absolute',
    left: 0,
  },
  sliderDotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
  },
  sliderDotPressable: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderDot: {
    width: 12,
    height: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  sliderDotActive: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    borderWidth: 4,
    borderColor: Colors.card,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
  },
  distanceLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distanceLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  distanceLabelActive: {
    color: Colors.primary,
    fontFamily: FontFamily.bodySemiBold,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  ratingBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  ratingBtnActive: {
    backgroundColor: Colors.brand + '15',
    borderColor: Colors.primary,
  },
  ratingBtnInactive: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
  },
  ratingBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
  },
  ratingBtnTextActive: {
    color: Colors.brand,
  },
  ratingBtnTextInactive: {
    color: Colors.ink,
  },
  priceRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  priceBtn: {
    flex: 1,
    paddingVertical: Spacing.base,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  priceBtnInactive: {
    backgroundColor: Colors.card,
  },
  priceBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 15,
  },
  priceBtnTextActive: {
    color: Colors.onPrimary,
  },
  priceBtnTextInactive: {
    color: Colors.inkMuted,
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md - 2,
    borderRadius: Radius.full,
  },
  categoryChipActive: {
    backgroundColor: Colors.brand + '15',
    borderWidth: 1,
    borderColor: Colors.primary + '33',
  },
  categoryChipInactive: {
    backgroundColor: Colors.border,
  },
  categoryChipText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
  },
  categoryChipTextActive: {
    color: Colors.brand,
    fontFamily: FontFamily.bodySemiBold,
  },
  categoryChipTextInactive: {
    color: Colors.ink,
  },
  visualHintContainer: {
    marginTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  hintCard: {
    height: 160,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  hintImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  hintGradient: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'flex-end',
    padding: Spacing.xl,
  },
  hintTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: '#ffffff',
  },
  hintSubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.04,
    shadowRadius: 32,
    elevation: 8,
  },
  showResultsBtn: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
  },
  showResultsText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.onPrimary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});

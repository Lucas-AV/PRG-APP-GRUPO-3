import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { InputField } from '@/components/ui/input-field';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { ProgressBar } from '@/components/ui/progress-bar';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

type LocationType = 'casa' | 'trabalho';

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export default function Step2Screen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const insets = useSafeAreaInsets();
  const isPrestador = role === 'prestador';
  const progress = isPrestador ? 2 / 4 : 2 / 3;
  const badge = isPrestador ? 'Passo 2 de 4' : 'Passo 2 de 3';

  const [locType, setLocType] = useState<LocationType>('casa');
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [showStatePicker, setShowStatePicker] = useState(false);

  const activeIdx = useSharedValue(0);
  const pillWidth = useSharedValue(0);

  const pillAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: activeIdx.value * pillWidth.value }],
  }));

  const handleLocTypeChange = (type: LocationType, idx: number) => {
    setLocType(type);
    activeIdx.value = withSpring(idx, { damping: 20, stiffness: 200 });
  };

  const handleContinue = () => {
    const next = isPrestador ? '/(onboarding)/step3' : '/(onboarding)/step4';
    router.push({ pathname: next as any, params: { role } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopAppBar title="SevGen" badge={badge} />

      <Animated.View entering={FadeIn.duration(300).delay(80)} style={styles.scroll}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress */}
        <ProgressBar
          progress={progress}
          percentageLabel={`${Math.round(progress * 100)}%`}
        />

        {/* Headline */}
        <View style={styles.headline}>
          <Text style={styles.title}>Onde você está{'\n'}localizado?</Text>
          <Text style={styles.subtitle}>
            Precisamos do seu endereço para encontrar serviços e profissionais próximos a você.
          </Text>
        </View>

        {/* Location type selector (pill segmented control) */}
        <View
          style={styles.segmentedTrack}
          onLayout={(e) => {
            pillWidth.value = e.nativeEvent.layout.width / 2;
          }}
        >
          <Animated.View style={[styles.segmentedPill, pillAnimStyle]} />
          {(['casa', 'trabalho'] as LocationType[]).map((t, idx) => {
            const isActive = locType === t;
            return (
              <Pressable
                key={t}
                onPress={() => handleLocTypeChange(t, idx)}
                style={styles.segmentedItem}
              >
                <MaterialIcons
                  name={t === 'casa' ? 'home' : 'work'}
                  size={18}
                  color={isActive ? Colors.primary : Colors.onSurfaceVariant}
                />
                <Text
                  style={[styles.segmentedLabel, isActive && styles.segmentedLabelActive]}
                >
                  {t === 'casa' ? 'Casa' : 'Trabalho'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* CEP field (full width) */}
        <InputField
          label="CEP"
          placeholder="00000-000"
          value={cep}
          onChangeText={setCep}
          keyboardType="numeric"
        />

        {/* Map preview (full width) */}
        <View style={styles.mapPreview}>
          <MaterialIcons
            name="location-on"
            size={36}
            color={Colors.primary}
          />
          <Text style={styles.mapLabel}>Mapa</Text>
        </View>

        {/* Address fields */}
        <InputField
          label="Endereço"
          placeholder="Rua, Avenida ou Praça"
          value={address}
          onChangeText={setAddress}
          autoCapitalize="words"
        />

        <View style={styles.twoCol}>
          <View style={styles.flex1}>
            <InputField
              label="Número"
              placeholder="123"
              value={number}
              onChangeText={setNumber}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.flex1}>
            <InputField
              label="Complemento"
              placeholder="Apto / Conjunto"
              value={complement}
              onChangeText={setComplement}
              autoCapitalize="words"
            />
          </View>
        </View>

        <InputField
          label="Bairro"
          placeholder="Nome do bairro"
          value={neighborhood}
          onChangeText={setNeighborhood}
          autoCapitalize="words"
        />

        <View style={styles.twoCol}>
          <View style={styles.flex1}>
            <InputField
              label="Cidade"
              placeholder="São Paulo"
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.flex1}>
            {/* State selector */}
            <Text style={styles.stateLabel}>ESTADO</Text>
            <Pressable
              style={styles.stateSelector}
              onPress={() => setShowStatePicker(!showStatePicker)}
            >
              <Text
                style={[
                  styles.stateSelectorText,
                  !state && styles.stateSelectorPlaceholder,
                ]}
              >
                {state || 'Selecione'}
              </Text>
              <MaterialIcons
                name={showStatePicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={20}
                color={Colors.outline}
              />
            </Pressable>
            {showStatePicker && (
              <View style={styles.stateDropdown}>
                <ScrollView style={styles.stateScroll} nestedScrollEnabled>
                  {STATES.map((s) => (
                    <Pressable
                      key={s}
                      style={styles.stateItem}
                      onPress={() => {
                        setState(s);
                        setShowStatePicker(false);
                      }}
                    >
                      <Text style={styles.stateItemText}>{s}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      </Animated.View>

      {/* Bottom nav */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom + 8, Spacing.xl) }]}>
        <Pressable
          style={({ pressed }) => [styles.draftBtn, pressed && { opacity: 0.6 }]}
        >
          <MaterialIcons name="save" size={18} color={Colors.onSurfaceVariant} />
          <Text style={styles.draftLabel}>Salvar</Text>
        </Pressable>
        <GradientButton label="Continuar →" onPress={handleContinue} style={styles.continueBtn} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xxl,
  },

  headline: { gap: Spacing.sm },
  title: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 30,
    letterSpacing: -0.8,
    color: Colors.onSurface,
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },

  // Segmented control
  segmentedTrack: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radius.full,
    padding: 6,
  },
  segmentedItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    zIndex: 1,
  },
  segmentedPill: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: 6,
    width: '50%',
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentedLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  segmentedLabelActive: {
    color: Colors.primary,
  },

  mapPreview: {
    height: 96,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  mapLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.outline,
    letterSpacing: 1,
  },

  // Two-column layout
  twoCol: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  flex1: { flex: 1 },

  // State selector
  stateLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.2,
    marginLeft: 2,
    marginBottom: Spacing.sm,
  },
  stateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  stateSelectorText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurface,
  },
  stateSelectorPlaceholder: {
    color: Colors.outline,
  },
  stateDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 4,
  },
  stateScroll: { maxHeight: 160 },
  stateItem: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  stateItemText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurface,
  },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl + 4,
    backgroundColor: Colors.surfaceContainerLowest,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
  draftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
  },
  draftLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  continueBtn: {
    flex: 1,
  },
});

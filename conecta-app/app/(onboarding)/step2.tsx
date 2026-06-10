import { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
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
import { MapPreview } from '@/components/ui/map-preview';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usersApi } from '@/services/api';

type LocationType = 'casa' | 'trabalho';

function formatCep(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

export default function Step2Screen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();
  const isPrestador = role === 'prestador';
  const progress = isPrestador ? 2 / 5 : 2 / 3;
  const badge = isPrestador ? 'Passo 2 de 5' : 'Passo 2 de 3';

  const [locType, setLocType] = useState<LocationType>('casa');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autofilledFields, setAutofilledFields] = useState<Record<string, boolean>>({});

  const numberInputRef = useRef<TextInput>(null);

  const activeIdx = useSharedValue(0);
  const pillWidth = useSharedValue(0);

  const pillAnimStyle = useAnimatedStyle(() => ({
    width: pillWidth.value,
    transform: [{ translateX: activeIdx.value * pillWidth.value }],
  }));

  const handleLocTypeChange = (type: LocationType, idx: number) => {
    setLocType(type);
    activeIdx.value = withSpring(idx, { damping: 30, stiffness: 180, mass: 0.8 });
  };

  const handleCepChange = (text: string) => {
    const formatted = formatCep(text);
    setCep(formatted);
    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 8) {
      fetchViaCep(digits);
    } else {
      setAutofilledFields({});
    }
  };

  const fetchViaCep = async (digits: string) => {
    if (cepLoading) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        Alert.alert('CEP não encontrado', 'Verifique o CEP e preencha os campos manualmente.');
        return;
      }
      setStreet(data.logradouro ?? '');
      setNeighborhood(data.bairro ?? '');
      setCity(data.localidade ?? '');
      setState(data.uf ?? '');
      setAutofilledFields({
        street: !!data.logradouro,
        neighborhood: !!data.bairro,
        city: !!data.localidade,
        state: !!data.uf,
      });
      // Auto-focus on number field
      setTimeout(() => numberInputRef.current?.focus(), 150);
    } catch {
      Alert.alert('Erro', 'Não foi possível consultar o CEP. Preencha manualmente.');
    } finally {
      setCepLoading(false);
    }
  };

  const saveAddressToApi = async (): Promise<void> => {
    if (!user || !token) return;
    if (!street || !city || !state) return;

    try {
      await usersApi.addAddress(
        user.id,
        {
          type: locType === 'casa' ? 'casa' : 'trabalho',
          zip_code: cep.replace(/\D/g, '') || undefined,
          street,
          number: number || '-',
          complement: complement || '-',
          neighborhood: neighborhood || undefined,
          city,
          state,
        },
        token,
      );
    } catch {
      Alert.alert(
        'Endereço não salvo',
        'Não foi possível salvar seu endereço agora. Você pode adicioná-lo depois em Perfil > Endereços.',
        [{ text: 'Continuar mesmo assim' }],
      );
    }
  };

  const handleContinue = async () => {
    setSaving(true);
    await saveAddressToApi();
    setSaving(false);

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
              pillWidth.value = (e.nativeEvent.layout.width - 12) / 2;
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

          {/* CEP field */}
          <View style={styles.cepRow}>
            <View style={{ flex: 1 }}>
              <InputField
                label="CEP"
                placeholder="00000-000"
                value={cep}
                onChangeText={handleCepChange}
                keyboardType="numeric"
                maxLength={9}
              />
            </View>
            {cepLoading && (
              <ActivityIndicator color={Colors.primary} style={styles.cepSpinner} />
            )}
          </View>

          {/* Map preview — real OpenStreetMap */}
          <MapPreview
            street={street}
            number={number}
            neighborhood={neighborhood}
            city={city}
            state={state}
            zipCode={cep}
            height={150}
          />

          {/* Address fields */}
          <InputField
            label="Endereço"
            placeholder="Rua, Avenida ou Praça"
            value={street}
            onChangeText={setStreet}
            autoCapitalize="words"
            rightAction={autofilledFields.street ? <MaterialIcons name="check-circle" size={18} color="#10b981" /> : null}
          />

          <View style={styles.twoCol}>
            <View style={styles.flex5}>
              <InputField
                ref={numberInputRef}
                label="Número"
                placeholder="123"
                value={number}
                onChangeText={setNumber}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flex7}>
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
            rightAction={autofilledFields.neighborhood ? <MaterialIcons name="check-circle" size={18} color="#10b981" /> : null}
          />

          <View style={styles.twoCol}>
            <View style={styles.flex8}>
              <InputField
                label="Cidade"
                placeholder="São Paulo"
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
                rightAction={autofilledFields.city ? <MaterialIcons name="check-circle" size={18} color="#10b981" /> : null}
              />
            </View>
            <View style={styles.flex4}>
              <InputField
                label="Estado"
                placeholder="UF"
                value={state}
                onChangeText={t => setState(t.toUpperCase())}
                autoCapitalize="characters"
                maxLength={2}
                rightAction={autofilledFields.state ? <MaterialIcons name="check-circle" size={18} color="#10b981" /> : null}
              />
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Bottom nav */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom + 8, Spacing.xl) }]}>
        <GradientButton
          label={saving ? 'Salvando…' : 'Continuar →'}
          onPress={handleContinue}
          disabled={saving || cepLoading}
          style={styles.continueBtn}
        />
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

  // CEP row with spinner
  cepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cepSpinner: {
    marginTop: Spacing.xl,
  },

  // Two-column layout
  twoCol: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  flex4: { flex: 4 },
  flex5: { flex: 5 },
  flex7: { flex: 7 },
  flex8: { flex: 8 },

  // Bottom nav
  bottomNav: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl + 4,
    backgroundColor: Colors.surfaceContainerLowest,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
  continueBtn: {
    // full width
  },
});

import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { ProgressBar } from '@/components/ui/progress-bar';
import { GradientButton } from '@/components/ui/gradient-button';
import { AddressFormFields, AddressValues } from '@/components/ui/address-form-fields';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usersApi } from '@/services/api';

type LocationType = 'casa' | 'trabalho';

export default function Step2Screen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();
  const isPrestador = role === 'prestador';
  const progress = isPrestador ? 2 / 5 : 2 / 3;
  const badge = isPrestador ? 'Passo 2 de 5' : 'Passo 2 de 3';

  const [locType, setLocType] = useState<LocationType>('casa');
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [values, setValues] = useState<AddressValues>({
    cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
  });

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

  const handleContinue = async () => {
    setSaving(true);
    if (user && token && values.street && values.city && values.state) {
      try {
        await usersApi.addAddress(user.id, {
          type: locType,
          zip_code: values.cep.trim() || undefined,
          street: values.street,
          number: values.number || '-',
          complement: values.complement || '-',
          neighborhood: values.neighborhood || undefined,
          city: values.city,
          state: values.state,
        }, token);
      } catch {
        Alert.alert(
          'Endereço não salvo',
          'Não foi possível salvar seu endereço agora. Você pode adicioná-lo depois em Perfil > Endereços.',
          [{ text: 'Continuar mesmo assim' }],
        );
      }
    }
    setSaving(false);
    const next = isPrestador ? '/(onboarding)/step3' : '/(onboarding)/step4';
    router.push({ pathname: next as any, params: { role } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopAppBar title="Configuração do Perfil" badge={badge} />

      <Animated.View entering={FadeIn.duration(300).delay(80)} style={styles.scroll}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ProgressBar
            progress={progress}
            percentageLabel={`${Math.round(progress * 100)}%`}
          />

          <View style={styles.headline}>
            <Text style={styles.title}>Onde você está{'\n'}localizado?</Text>
            <Text style={styles.subtitle}>
              Precisamos do seu endereço para encontrar serviços e profissionais próximos a você.
            </Text>
          </View>

          {/* Seletor Casa / Trabalho */}
          <View
            style={styles.segmentedTrack}
            onLayout={e => {
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
                  <Text style={[styles.segmentedLabel, isActive && styles.segmentedLabelActive]}>
                    {t === 'casa' ? 'Casa' : 'Trabalho'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <AddressFormFields
            values={values}
            onChange={patch => setValues(prev => ({ ...prev, ...patch }))}
            onCepLoading={setCepLoading}
            mapHeight={150}
          />
        </ScrollView>
      </Animated.View>

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
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
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
  segmentedLabelActive: { color: Colors.primary },
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
  continueBtn: {},
});

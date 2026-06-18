import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { InputField } from '@/components/ui/input-field';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { ProgressBar } from '@/components/ui/progress-bar';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usersApi } from '@/services/api';

export default function Step1Screen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const insets = useSafeAreaInsets();
  const { user, token, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [specialty, setSpecialty] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria nas configurações do app.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const isPrestador = role === 'prestador';
  const progress = isPrestador ? 1 / 5 : 1 / 3;
  const badge = isPrestador ? 'Passo 1 de 5' : 'Passo 1 de 3';

  const handleContinue = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Atenção', 'O campo Nome Completo é obrigatório.');
      return;
    }
    setSaving(true);
    try {
      if (user && token) {
        const updated = await usersApi.update(
          user.id,
          {
            name: trimmedName,
            role: role as any,
            ...(isPrestador && specialty.trim() ? { specialties: specialty.trim() } : {}),
          },
          token
        );
        await updateUser(updated);
      }
      router.push({ pathname: '/(onboarding)/step2', params: { role } });
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível salvar os dados. Tente novamente.');
    } finally {
      setSaving(false);
    }
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
        {/* Progress */}
        <ProgressBar
          progress={progress}
          label="Progresso do Cadastro"
          percentageLabel={`${Math.round(progress * 100)}%`}
        />

        {/* Headline */}
        <View style={styles.headline}>
          <Text style={styles.title}>Informações Pessoais</Text>
          <Text style={styles.subtitle}>
            Vamos começar pelo básico. Essas informações ajudam os clientes a conhecer
            a pessoa por trás do serviço.
          </Text>
        </View>

        {/* Profile photo */}
        <View style={styles.photoSection}>
          <Pressable style={styles.photoWrapper} onPress={handlePickPhoto}>
            <View style={styles.photoCircle}>
              {photoUri
                ? <Image source={{ uri: photoUri }} style={styles.photoImage} />
                : <MaterialIcons name="person" size={48} color={Colors.border} />}
            </View>
            <View style={styles.cameraBtn}>
              <MaterialIcons name="camera-alt" size={18} color={Colors.onPrimary} />
            </View>
          </Pressable>
          <Text style={styles.photoLabel}>
            {photoUri ? 'FOTO SELECIONADA' : 'CARREGAR FOTO DE PERFIL'}
          </Text>
        </View>

        {/* Form fields */}
        <View style={styles.form}>
          <InputField
            label="Nome Completo"
            placeholder="Digite seu nome completo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          {isPrestador && (
            <InputField
              label="Especialidade Principal"
              placeholder="ex: Encanador, Designer Gráfico..."
              value={specialty}
              onChangeText={setSpecialty}
              autoCapitalize="words"
              icon="work"
            />
          )}
        </View>

        {/* Tip card */}
        <View style={styles.tipCard}>
          <MaterialIcons name="lightbulb" size={22} color={Colors.brand} />
          <View style={styles.tipText}>
            <Text style={styles.tipTitle}>Dica Rápida</Text>
            <Text style={styles.tipBody}>
              Perfis com fotos profissionais recebem até 4x mais solicitações do que
              perfis sem foto.
            </Text>
          </View>
        </View>
      </ScrollView>
      </Animated.View>

      {/* Bottom nav */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom + 8, Spacing.xl) }]}>
        <Pressable
          style={({ pressed }) => [styles.draftBtn, pressed && { opacity: 0.6 }]}
        >
          <MaterialIcons name="save" size={18} color={Colors.inkMuted} />
          <Text style={styles.draftLabel}>Salvar</Text>
        </Pressable>
        <GradientButton
          label={saving ? 'Salvando…' : 'Continuar →'}
          onPress={handleContinue}
          disabled={saving}
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
    gap: Spacing.xxxl,
  },

  headline: {
    gap: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 30,
    letterSpacing: -0.8,
    color: Colors.ink,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.inkMuted,
    lineHeight: 20,
  },

  // Photo upload
  photoSection: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
  },
  photoWrapper: {
    position: 'relative',
  },
  photoCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.card,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  photoImage: {
    width: 112,
    height: 112,
    resizeMode: 'cover',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  photoLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.brand,
    letterSpacing: 1.5,
  },

  form: {
    gap: Spacing.xxl,
  },

  // Tip card
  tipCard: {
    flexDirection: 'row',
    gap: Spacing.base,
    backgroundColor: Colors.brand + '15',
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
  },
  tipText: {
    flex: 1,
    gap: Spacing.xs,
  },
  tipTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.ink,
  },
  tipBody: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.ink,
    lineHeight: 17,
    opacity: 0.85,
  },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl + 4,
    backgroundColor: Colors.card,
    shadowColor: Colors.ink,
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
    color: Colors.inkMuted,
  },
  continueBtn: {
    flex: 1,
  },
});

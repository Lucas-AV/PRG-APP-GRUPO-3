import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { ProgressBar } from '@/components/ui/progress-bar';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { documentsApi } from '@/services/api';

type UploadSlot = { uri: string | null; uploading: boolean; url: string | null };
const EMPTY_SLOT: UploadSlot = { uri: null, uploading: false, url: null };

export default function Step3bScreen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();

  const [idFront, setIdFront]   = useState<UploadSlot>(EMPTY_SLOT);
  const [idBack, setIdBack]     = useState<UploadSlot>(EMPTY_SLOT);
  const [address, setAddress]   = useState<UploadSlot>(EMPTY_SLOT);
  const [criminal, setCriminal] = useState<UploadSlot>(EMPTY_SLOT);

  const pickAndUpload = async (
    docType: string,
    setter: React.Dispatch<React.SetStateAction<UploadSlot>>,
  ) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setter({ uri, uploading: true, url: null });

    try {
      const { url } = await documentsApi.upload(docType, uri, token!);
      setter({ uri, uploading: false, url });
    } catch (e: any) {
      setter(EMPTY_SLOT);
      Alert.alert('Erro ao enviar', e.message ?? 'Não foi possível enviar o arquivo. Tente novamente.');
    }
  };

  const removeDoc = async (
    docType: string,
    setter: React.Dispatch<React.SetStateAction<UploadSlot>>,
  ) => {
    try {
      await documentsApi.remove(docType, token!);
    } catch (_) {}
    setter(EMPTY_SLOT);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopAppBar title="Verificação de Segurança" badge="Passo 4 de 5" />

      <Animated.View entering={FadeIn.duration(300).delay(80)} style={styles.scroll}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ProgressBar progress={4 / 5} percentageLabel="80%" />

          <View style={styles.headline}>
            <Text style={styles.title}>Verificação de{'\n'}Segurança</Text>
            <Text style={styles.subtitle}>
              Para garantir a confiança da nossa comunidade, solicitamos a validação
              dos seus documentos. Seus dados são criptografados e protegidos.
            </Text>
          </View>

          {/* Documento de Identidade */}
          <View style={styles.verifyCard}>
            <View style={styles.verifyCardLeft}>
              <View style={[styles.verifyIconBox, { backgroundColor: Colors.brand + '15' }]}>
                <MaterialIcons name="badge" size={22} color={Colors.brand} />
              </View>
              <View style={styles.verifyCardText}>
                <Text style={styles.verifyCardTitle}>Documento de Identidade</Text>
                <Text style={styles.verifyCardDesc}>
                  Envie uma foto nítida do seu RG ou CNH (Frente e Verso).
                </Text>
              </View>
            </View>
            <View style={styles.verifyBtnRow}>
              <UploadButton
                label="Frente"
                slot={idFront}
                onPress={() => pickAndUpload('identity_front', setIdFront)}
                onRemove={() => removeDoc('identity_front', setIdFront)}
              />
              <UploadButton
                label="Verso"
                slot={idBack}
                onPress={() => pickAndUpload('identity_back', setIdBack)}
                onRemove={() => removeDoc('identity_back', setIdBack)}
              />
            </View>
          </View>

          {/* Two-column cards */}
          <View style={styles.verifyTwoCol}>
            <View style={styles.verifyCardSmall}>
              <View style={[styles.verifyIconBox, { backgroundColor: Colors.tertiaryContainer }]}>
                <MaterialIcons name="place" size={22} color={Colors.tertiary} />
              </View>
              <Text style={styles.verifyCardTitle}>Comprovante de Residência</Text>
              <Text style={styles.verifyCardDesc}>
                Contas de luz, água ou internet dos últimos 90 dias.
              </Text>
              <DashedUploadButton
                label="Selecionar arquivo"
                icon="cloud-upload"
                slot={address}
                onPress={() => pickAndUpload('proof_of_address', setAddress)}
                onRemove={() => removeDoc('proof_of_address', setAddress)}
              />
            </View>

            <View style={styles.verifyCardSmall}>
              <View style={styles.recommendedRow}>
                <View style={[styles.verifyIconBox, { backgroundColor: Colors.brand + '12' }]}>
                  <MaterialIcons name="gavel" size={22} color={Colors.secondary} />
                </View>
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>RECOMENDADO</Text>
                </View>
              </View>
              <Text style={styles.verifyCardTitle}>Antecedentes Criminais</Text>
              <Text style={styles.verifyCardDesc}>
                Aumente sua taxa de aprovação em até 40% com este selo.
              </Text>
              <DashedUploadButton
                label="Adicionar Certidão"
                icon="verified-user"
                slot={criminal}
                onPress={() => pickAndUpload('criminal_record', setCriminal)}
                onRemove={() => removeDoc('criminal_record', setCriminal)}
              />
            </View>
          </View>

          {/* Trust note */}
          <View style={styles.trustNote}>
            <MaterialIcons name="info" size={14} color={Colors.inkMuted} />
            <Text style={styles.trustNoteText}>
              Ao prosseguir, você concorda com nossos termos de privacidade. Seus documentos
              serão analisados pela equipe de segurança em até 24 horas úteis.
            </Text>
          </View>
        </ScrollView>
      </Animated.View>

      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom + 8, Spacing.xl) }]}>
        <Pressable style={({ pressed }) => [styles.draftBtn, pressed && { opacity: 0.6 }]}>
          <MaterialIcons name="save" size={18} color={Colors.inkMuted} />
          <Text style={styles.draftLabel}>Salvar</Text>
        </Pressable>
        <GradientButton
          label="Continuar →"
          onPress={() => router.push({ pathname: '/(onboarding)/step4', params: { role } })}
          style={styles.continueBtn}
        />
      </View>
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function UploadButton({
  label, slot, onPress, onRemove,
}: {
  label: string;
  slot: UploadSlot;
  onPress: () => void;
  onRemove: () => void;
}) {
  if (slot.uploading) {
    return (
      <View style={[styles.uploadSmallBtn, styles.uploadSmallBtnDone]}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.uploadSmallLabel}>Enviando…</Text>
      </View>
    );
  }
  if (slot.url) {
    return (
      <View style={[styles.uploadSmallBtn, styles.uploadSmallBtnDone]}>
        <Image source={{ uri: slot.uri! }} style={styles.thumbSmall} />
        <MaterialIcons name="check-circle" size={14} color={Colors.success ?? Colors.primary} />
        <Pressable onPress={onRemove} hitSlop={8}>
          <MaterialIcons name="close" size={14} color={Colors.inkMuted} />
        </Pressable>
      </View>
    );
  }
  return (
    <Pressable style={({ pressed }) => [styles.uploadSmallBtn, pressed && { opacity: 0.7 }]} onPress={onPress}>
      <MaterialIcons name="upload" size={14} color={Colors.ink} />
      <Text style={styles.uploadSmallLabel}>{label}</Text>
    </Pressable>
  );
}

function DashedUploadButton({
  label, icon, slot, onPress, onRemove,
}: {
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  slot: UploadSlot;
  onPress: () => void;
  onRemove: () => void;
}) {
  if (slot.uploading) {
    return (
      <View style={styles.dashedUploadBtn}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.dashedUploadLabel}>Enviando…</Text>
      </View>
    );
  }
  if (slot.url) {
    return (
      <View style={[styles.dashedUploadBtn, styles.dashedUploadBtnDone]}>
        <Image source={{ uri: slot.uri! }} style={styles.thumbDashed} />
        <MaterialIcons name="check-circle" size={16} color={Colors.success ?? Colors.primary} />
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text style={styles.alterar}>Alterar</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <Pressable style={({ pressed }) => [styles.dashedUploadBtn, pressed && { opacity: 0.7 }]} onPress={onPress}>
      <MaterialIcons name={icon} size={22} color={Colors.inkMuted} />
      <Text style={styles.dashedUploadLabel}>{label}</Text>
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

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
    color: Colors.ink,
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.inkMuted,
    lineHeight: 20,
  },

  verifyCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.xxl,
    gap: Spacing.base,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  verifyCardLeft: {
    flexDirection: 'row',
    gap: Spacing.base,
    alignItems: 'flex-start',
  },
  verifyIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  verifyCardText: { flex: 1 },
  verifyCardTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.onBackground,
    marginBottom: 2,
  },
  verifyCardDesc: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.inkMuted,
    lineHeight: 17,
  },
  verifyBtnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  uploadSmallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.card,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  uploadSmallBtnDone: {
    borderColor: Colors.primary + '40',
    backgroundColor: Colors.primary + '08',
  },
  uploadSmallLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.ink,
  },
  thumbSmall: {
    width: 28,
    height: 28,
    borderRadius: 4,
  },

  verifyTwoCol: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  verifyCardSmall: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    gap: Spacing.sm,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  recommendedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recommendedBadge: {
    backgroundColor: Colors.brand + '15',
    borderRadius: 4,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  recommendedText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 8,
    color: Colors.ink,
    letterSpacing: 0.5,
  },

  dashedUploadBtn: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 'auto',
  },
  dashedUploadBtnDone: {
    borderStyle: 'solid',
    borderColor: Colors.primary + '40',
    backgroundColor: Colors.primary + '08',
  },
  dashedUploadLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
  thumbDashed: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
  },
  alterar: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.primary,
  },

  trustNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.base,
  },
  trustNoteText: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.inkMuted,
    lineHeight: 17,
    fontStyle: 'italic',
  },

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
  continueBtn: { flex: 1 },
});

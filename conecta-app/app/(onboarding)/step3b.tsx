import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { ProgressBar } from '@/components/ui/progress-bar';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

export default function Step3bScreen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const insets = useSafeAreaInsets();

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

          {/* Identity document card */}
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
              <Pressable style={styles.uploadSmallBtn}>
                <MaterialIcons name="upload" size={14} color={Colors.ink} />
                <Text style={styles.uploadSmallLabel}>Frente</Text>
              </Pressable>
              <Pressable style={styles.uploadSmallBtn}>
                <MaterialIcons name="upload" size={14} color={Colors.ink} />
                <Text style={styles.uploadSmallLabel}>Verso</Text>
              </Pressable>
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
              <Pressable style={styles.dashedUploadBtn}>
                <MaterialIcons name="cloud-upload" size={22} color={Colors.inkMuted} />
                <Text style={styles.dashedUploadLabel}>Clique para selecionar</Text>
              </Pressable>
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
              <Pressable style={styles.dashedUploadBtn}>
                <MaterialIcons name="verified-user" size={22} color={Colors.inkMuted} />
                <Text style={styles.dashedUploadLabel}>Adicionar Certidão</Text>
              </Pressable>
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
        <Pressable
          style={({ pressed }) => [styles.draftBtn, pressed && { opacity: 0.6 }]}
        >
          <MaterialIcons name="save" size={18} color={Colors.inkMuted} />
          <Text style={styles.draftLabel}>Salvar</Text>
        </Pressable>
        <GradientButton
          label="Continuar →"
          onPress={() =>
            router.push({ pathname: '/(onboarding)/step4', params: { role } })
          }
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
  },
  uploadSmallLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.ink,
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
  dashedUploadLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.inkMuted,
    textAlign: 'center',
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

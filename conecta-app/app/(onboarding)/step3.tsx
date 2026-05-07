/**
 * Tela exclusiva para prestadores de serviço.
 * Implementada com base em: step3 (se prestador).html
 * Seção de verificação incorporada do conteúdo presente em step0.html / step4.html.
 */
import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { ProgressBar } from '@/components/ui/progress-bar';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

const SERVICE_CHIPS = [
  { key: 'limpeza', label: 'Limpeza', icon: 'cleaning-services' as const },
  { key: 'encanamento', label: 'Encanamento', icon: 'plumbing' as const },
  { key: 'eletrica', label: 'Elétrica', icon: 'electrical-services' as const },
  { key: 'pintura', label: 'Pintura', icon: 'format-paint' as const },
  { key: 'marcenaria', label: 'Marcenaria', icon: 'carpenter' as const },
  { key: 'outros', label: 'Outros', icon: 'add' as const },
];

export default function Step3Screen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const insets = useSafeAreaInsets();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [bio, setBio] = useState('');

  const toggleService = (key: string) => {
    setSelectedServices((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopAppBar title="Perfil do Prestador" badge="Passo 3 de 4" />

      <Animated.View entering={FadeIn.duration(300).delay(80)} style={styles.scroll}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress */}
        <ProgressBar progress={3 / 4} percentageLabel="66%" />

        {/* ── SEÇÃO 1: Serviços ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Serviços</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Selecione as categorias que definem seu negócio principal.
          </Text>

          <View style={styles.chipsWrap}>
            {SERVICE_CHIPS.map((chip) => {
              const isSelected = selectedServices.includes(chip.key);
              return (
                <Pressable
                  key={chip.key}
                  onPress={() => toggleService(chip.key)}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                >
                  <MaterialIcons
                    name={chip.icon}
                    size={16}
                    color={isSelected ? Colors.onPrimaryContainer : Colors.onSurface}
                  />
                  <Text
                    style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}
                  >
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── SEÇÃO 2: Experiência Profissional ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Experiência Profissional</Text>
            <Pressable style={styles.addBtn}>
              <MaterialIcons name="add-circle" size={16} color={Colors.primary} />
              <Text style={styles.addBtnLabel}>ADICIONAR</Text>
            </Pressable>
          </View>

          {/* Experience card */}
          <View style={styles.expCard}>
            <View style={styles.expCardAccent} />
            <View style={styles.expCardContent}>
              <Text style={styles.fieldLabel}>CARGO / FUNÇÃO</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Ex: Eletricista Residencial Sênior"
                placeholderTextColor={Colors.outline}
                value={jobTitle}
                onChangeText={setJobTitle}
              />
              <Text style={[styles.fieldLabel, { marginTop: Spacing.base }]}>
                DESCRIÇÃO DO TRABALHO
              </Text>
              <TextInput
                style={[styles.fieldInput, styles.textarea]}
                placeholder="Descreva suas atividades e especializações..."
                placeholderTextColor={Colors.outline}
                value={jobDesc}
                onChangeText={setJobDesc}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Pressable style={styles.uploadCertBtn}>
                <MaterialIcons name="upload-file" size={18} color={Colors.onSecondaryContainer} />
                <Text style={styles.uploadCertLabel}>Enviar Certificado</Text>
                <Text style={styles.uploadHint}>Opcional: PDF, PNG até 5MB</Text>
              </Pressable>
            </View>
          </View>

          {/* Add more placeholder */}
          <Pressable style={styles.addMoreCard}>
            <View style={styles.addMoreIcon}>
              <MaterialIcons name="work-history" size={24} color={Colors.outline} />
            </View>
            <Text style={styles.addMoreLabel}>Toque para adicionar outra experiência</Text>
          </Pressable>
        </View>

        {/* ── SEÇÃO 3: Biografia ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sobre você</Text>
            <Text style={styles.bioCounter}>{bio.length}/500</Text>
          </View>
          <TextInput
            style={styles.bioInput}
            placeholder="Conte para os clientes sobre sua trajetória, ética de trabalho e o que torna seu serviço único..."
            placeholderTextColor={Colors.outline + '99'}
            value={bio}
            onChangeText={(t) => t.length <= 500 && setBio(t)}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <View style={styles.bioInfo}>
            <MaterialIcons name="info" size={14} color={Colors.outline} />
            <Text style={styles.bioInfoText}>
              Bios pessoais aumentam a taxa de reservas em até 40%.
            </Text>
          </View>
        </View>

        {/* ── SEÇÃO 4: Verificação de Segurança ── */}
        <View style={styles.section}>
          <Text style={styles.verifyTitle}>Verificação de Segurança</Text>
          <Text style={styles.verifySubtitle}>
            Para garantir a confiança da nossa comunidade, solicitamos a validação
            dos seus documentos. Seus dados são criptografados e protegidos.
          </Text>

          {/* Identity document card */}
          <View style={styles.verifyCard}>
            <View style={styles.verifyCardLeft}>
              <View style={[styles.verifyIconBox, { backgroundColor: Colors.primaryContainer }]}>
                <MaterialIcons name="badge" size={22} color={Colors.primary} />
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
                <MaterialIcons name="upload" size={14} color={Colors.onSurface} />
                <Text style={styles.uploadSmallLabel}>Frente</Text>
              </Pressable>
              <Pressable style={styles.uploadSmallBtn}>
                <MaterialIcons name="upload" size={14} color={Colors.onSurface} />
                <Text style={styles.uploadSmallLabel}>Verso</Text>
              </Pressable>
            </View>
          </View>

          {/* Two-column cards */}
          <View style={styles.verifyTwoCol}>
            {/* Proof of residence */}
            <View style={[styles.verifyCardSmall]}>
              <View style={[styles.verifyIconBox, { backgroundColor: Colors.tertiaryContainer }]}>
                <MaterialIcons name="place" size={22} color={Colors.tertiary} />
              </View>
              <Text style={styles.verifyCardTitle}>Comprovante de Residência</Text>
              <Text style={styles.verifyCardDesc}>
                Contas de luz, água ou internet dos últimos 90 dias.
              </Text>
              <Pressable style={styles.dashedUploadBtn}>
                <MaterialIcons name="cloud-upload" size={22} color={Colors.outline} />
                <Text style={styles.dashedUploadLabel}>Clique para selecionar</Text>
              </Pressable>
            </View>

            {/* Criminal background */}
            <View style={styles.verifyCardSmall}>
              <View style={styles.recommendedRow}>
                <View style={[styles.verifyIconBox, { backgroundColor: Colors.secondaryContainer }]}>
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
                <MaterialIcons name="verified-user" size={22} color={Colors.outline} />
                <Text style={styles.dashedUploadLabel}>Adicionar Certidão</Text>
              </Pressable>
            </View>
          </View>

          {/* Trust note */}
          <View style={styles.trustNote}>
            <MaterialIcons name="info" size={14} color={Colors.outline} />
            <Text style={styles.trustNoteText}>
              Ao prosseguir, você concorda com nossos termos de privacidade. Seus documentos
              serão analisados pela equipe de segurança em até 24 horas úteis.
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
          <MaterialIcons name="save" size={18} color={Colors.onSurfaceVariant} />
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
    gap: Spacing.xxxl,
  },

  section: { gap: Spacing.base },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.onBackground,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },

  // Service chips
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '4D',
  },
  chipSelected: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primary + '33',
  },
  chipLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.onSurface,
  },
  chipLabelSelected: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onPrimaryContainer,
  },

  // Add button
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addBtnLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.primary,
    letterSpacing: 1,
  },

  // Experience card
  expCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
    flexDirection: 'row',
  },
  expCardAccent: {
    width: 4,
    backgroundColor: Colors.primaryDim,
  },
  expCardContent: {
    flex: 1,
    padding: Spacing.xxl,
    gap: Spacing.xs,
  },

  fieldLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.5,
  },
  fieldInput: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.onSurface,
    marginTop: Spacing.xs,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  uploadCertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.secondaryContainer,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    marginTop: Spacing.base,
    flexWrap: 'wrap',
  },
  uploadCertLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.onSecondaryContainer,
  },
  uploadHint: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.outline,
    fontStyle: 'italic',
    flex: 1,
  },

  // Add more card
  addMoreCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: Spacing.xxxl,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '33',
    borderStyle: 'dashed',
  },
  addMoreIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },

  // Bio
  bioInput: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.onSurface,
    minHeight: 130,
  },
  bioCounter: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.outline,
    letterSpacing: 0.5,
  },
  bioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  bioInfoText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 17,
    flex: 1,
  },

  // Verification section
  verifyTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 26,
    letterSpacing: -0.8,
    color: Colors.onBackground,
  },
  verifySubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 19,
    maxWidth: 360,
  },
  verifyCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.xxl,
    gap: Spacing.base,
    shadowColor: '#000',
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
    color: Colors.onSurfaceVariant,
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
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.sm,
  },
  uploadSmallLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.onSurface,
  },

  verifyTwoCol: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  verifyCardSmall: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    gap: Spacing.sm,
    shadowColor: '#000',
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
    backgroundColor: Colors.primaryContainer,
    borderRadius: 4,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  recommendedText: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 8,
    color: Colors.onPrimaryContainer,
    letterSpacing: 0.5,
  },

  dashedUploadBtn: {
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant + '4D',
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
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },

  trustNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: Spacing.base,
  },
  trustNoteText: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    lineHeight: 17,
    fontStyle: 'italic',
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

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useComingSoonAlert } from '@/hooks/useComingSoonAlert';

// ── Componente de Cartão Expansível (Collapsible Card) ───────────────────────
interface ExpandableCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  summary: string;
  linkText?: string;
  onLinkPress?: () => void;
}

function ExpandableCard({ icon, title, summary, linkText, onLinkPress }: ExpandableCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.linkCard,
        pressed && styles.linkCardPressed,
        expanded && styles.linkCardExpanded,
      ]}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.linkCardHeader}>
        <View style={styles.linkCardLeft}>
          <View style={styles.linkIconCircle}>
            <MaterialIcons name={icon} size={20} color={Colors.onSurfaceVariant} />
          </View>
          <Text style={styles.linkTitle}>{title}</Text>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={Colors.outlineVariant}
          style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
        />
      </View>
      {expanded && (
        <View style={styles.linkCardContent}>
          <Text style={styles.linkCardSummary}>{summary}</Text>
          {linkText && onLinkPress && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation(); // Evita recolher o card ao clicar no link interno
                onLinkPress();
              }}
              style={styles.innerLinkBtn}
            >
              <Text style={styles.innerLinkBtnText}>{linkText}</Text>
              <MaterialIcons name="arrow-forward" size={14} color={Colors.primary} />
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}

// ── Tela Sobre ───────────────────────────────────────────────────────────────
export default function AboutScreen() {
  const comingSoon = useComingSoonAlert();
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── TopAppBar ──────────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
        <Text style={styles.topBarTitle}>About SevGen</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Hero Section ─────────────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          <View style={styles.logoBox}>
            <MaterialIcons name="diamond" size={48} color={Colors.primary} style={styles.logoIcon} />
            <View style={styles.logoShine} />
          </View>
          <View style={styles.heroTitles}>
            <Text style={styles.heroName}>SevGen</Text>
            <Text style={styles.heroVersion}>Versão {appVersion}</Text>
          </View>
        </View>

        {/* ── Mission ──────────────────────────────────────────────────────── */}
        <View style={styles.missionCard}>
          <Text style={styles.missionTitle}>A Nossa Missão</Text>
          <Text style={styles.missionText}>
            O SevGen é a plataforma definitiva para a curadoria de serviços de alta fidelidade.
            Rejeitamos a mediocridade do mercado de massa, focando implacavelmente na precisão, na
            estética minimalista e numa experiência de concierge digital superior. Não somos apenas um
            mercado; somos a galeria onde o talento excepcional encontra a procura exigente.
          </Text>
        </View>

        {/* ── Discover Links (Abas Expansíveis) ─────────────────────────────── */}
        <View style={styles.linksSection}>
          <Text style={styles.sectionHeader}>Descobrir</Text>
          
          <ExpandableCard
            icon="history"
            title="Nossa História"
            summary="Fundado com o objetivo de redefinir o mercado de contratação de serviços, o SevGen nasceu da fusão entre tecnologia avançada e curadoria humana. Desde o primeiro dia, nos dedicamos a selecionar os melhores profissionais, garantindo um padrão estético e técnico inigualável."
          />

          <ExpandableCard
            icon="work"
            title="Trabalhe Conosco"
            summary="Se você busca excelência técnica e compartilha da nossa paixão por design refinado e processos precisos, o SevGen é o seu lugar. Oferecemos um ambiente dinâmico, oportunidades de crescimento acelerado e a chance de moldar o futuro do concierge digital."
          />

          <ExpandableCard
            icon="public"
            title="Impacto Social"
            summary="Acreditamos na tecnologia como motor de inclusão. Por isso, apoiamos a capacitação de novos profissionais técnicos e investimos em projetos sociais que promovem a transição ecológica e a energia renovável nas comunidades onde atuam nossos prestadores."
          />
        </View>

        {/* ── Legal Links (Abas Expansíveis) ────────────────────────────────── */}
        <View style={styles.linksSection}>
          <Text style={styles.sectionHeader}>Legal</Text>

          <ExpandableCard
            icon="description"
            title="Termos de Uso"
            summary="Estes termos regulam o uso da plataforma SevGen. Ao acessar a plataforma, você concorda com nossas regras de conduta, segurança e uso aceitável dos serviços."
            linkText="Ler Termo Completo"
            onLinkPress={() => router.push('/(account)/use-terms')}
          />

          <ExpandableCard
            icon="verified-user"
            title="Política de Privacidade"
            summary="Sua privacidade é nossa prioridade. Coletamos e processamos seus dados pessoais com total transparência e segurança, exclusivamente para garantir o funcionamento do app e o agendamento de seus serviços."
            linkText="Ler Política Completa"
            onLinkPress={() => router.push('/(account)/privacy-security')}
          />
        </View>

        {/* ── Social Footer ─────────────────────────────────────────────────── */}
        <View style={styles.socialSection}>
          <Pressable
            style={({ pressed }) => [styles.socialCircle, pressed && styles.socialCirclePressed]}
            onPress={comingSoon}
          >
            <MaterialIcons name="photo-camera" size={24} color={Colors.onSurfaceVariant} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.socialCircle, pressed && styles.socialCirclePressed]}
            onPress={comingSoon}
          >
            <MaterialIcons name="work-outline" size={24} color={Colors.onSurfaceVariant} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.socialCircle, pressed && styles.socialCirclePressed]}
            onPress={comingSoon}
          >
            <MaterialIcons name="alternate-email" size={24} color={Colors.onSurfaceVariant} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceBright,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant + '33',
  },
  topBarTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 16,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPressed: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.xxxl,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    gap: Spacing.base,
  },
  logoBox: {
    width: 96,
    height: 96,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoIcon: {
    opacity: 0.8,
  },
  logoShine: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroTitles: {
    alignItems: 'center',
    gap: 4,
  },
  heroName: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 36,
    color: Colors.onSurface,
    letterSpacing: -0.8,
  },
  heroVersion: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.outline,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  missionCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.xxl,
    borderRadius: Radius.lg,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  missionTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 20,
    color: Colors.onSurface,
    letterSpacing: -0.4,
  },
  missionText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
    textAlign: 'justify',
  },
  linksSection: {
    gap: Spacing.md,
  },
  sectionHeader: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingLeft: Spacing.xs,
  },
  linkCard: {
    padding: Spacing.base,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  linkCardPressed: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  linkCardExpanded: {
    backgroundColor: Colors.surfaceContainerLowest,
  },
  linkCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  linkCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  linkIconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkTitle: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: 16,
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  linkCardContent: {
    marginTop: Spacing.sm,
    paddingLeft: 56, // Alinha o início do texto com o título (40px do círculo + 16px de gap)
    gap: Spacing.sm,
  },
  linkCardSummary: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  innerLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
    alignSelf: 'flex-start',
  },
  innerLinkBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.primary,
  },
  socialSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceVariant + '80',
    width: '100%',
    maxWidth: 280,
    alignSelf: 'center',
  },
  socialCircle: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  socialCirclePressed: {
    backgroundColor: Colors.primaryContainer,
    transform: [{ scale: 0.9 }],
  },
});

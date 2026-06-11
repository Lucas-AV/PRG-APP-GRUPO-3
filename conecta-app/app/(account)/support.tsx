import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/gradient-button';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

// ── Dados ─────────────────────────────────────────────────────────────────────

const FAQ_ITEMS: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  content: string;
}[] = [
  {
    icon: 'payment',
    label: 'Pagamentos e Reembolsos',
    content:
      'Os pagamentos são processados de forma segura no momento do agendamento. Aceitamos cartões de crédito, débito e Pix. Em caso de cancelamento pelo prestador ou falha na execução do serviço, o reembolso é processado automaticamente em até 5 dias úteis para o mesmo método de pagamento utilizado. Cancelamentos feitos pelo cliente com menos de 24h de antecedência podem estar sujeitos à cobrança de taxa conforme política do prestador.',
  },
  {
    icon: 'calendar-today',
    label: 'Agendamentos e Cancelamentos',
    content:
      'Para agendar um serviço, acesse o perfil do prestador, escolha a data e horário disponíveis e confirme o pagamento. Você pode cancelar ou reagendar diretamente na tela de Agendamentos até 24h antes do horário marcado sem custos adicionais. Cancelamentos com menos de 24h podem gerar cobrança de taxa de conveniência. O prestador também pode propor novos horários caso precise reagendar.',
  },
  {
    icon: 'verified-user',
    label: 'Segurança e Privacidade',
    content:
      'Todos os prestadores cadastrados passam por verificação de identidade e validação de documentos antes de aparecerem na plataforma. Seus dados pessoais e financeiros são criptografados e nunca são compartilhados com terceiros sem sua autorização. Você pode solicitar a exclusão da sua conta e de todos os seus dados a qualquer momento nas configurações de privacidade.',
  },
  {
    icon: 'help',
    label: 'Como usar o Conecta',
    content:
      'Ao entrar no app, explore os serviços disponíveis na tela inicial ou use a busca para encontrar um prestador específico. Toque em um serviço para ver detalhes, avaliações e disponibilidade. Clique em "Agendar agora" para iniciar o fluxo de reserva. Após a conclusão do serviço, você será convidado a deixar uma avaliação — isso ajuda a manter a qualidade da plataforma.',
  },
];

const CONTACTS: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  action: () => void;
}[] = [
  {
    icon: 'chat',
    label: 'WhatsApp',
    action: () =>
      Linking.openURL('https://wa.me/5511999999999').catch(() =>
        Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.')
      ),
  },
  {
    icon: 'mail',
    label: 'E-mail',
    action: () =>
      Linking.openURL('mailto:suporte@conectaapp.com.br').catch(() =>
        Alert.alert('Erro', 'Não foi possível abrir o e-mail.')
      ),
  },
  {
    icon: 'call',
    label: 'Ligar',
    action: () =>
      Linking.openURL('tel:+5511999999999').catch(() =>
        Alert.alert('Erro', 'Não foi possível iniciar a ligação.')
      ),
  },
];

// ── Expansion Panel ───────────────────────────────────────────────────────────

interface FaqPanelProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  content: string;
  expanded: boolean;
  onToggle: () => void;
}

function FaqPanel({ icon, label, content, expanded, onToggle }: FaqPanelProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.panel,
        pressed && !expanded && styles.panelPressed,
        expanded && styles.panelExpanded,
      ]}
      onPress={onToggle}
    >
      <View style={styles.panelHeader}>
        <View style={styles.panelLeft}>
          <View style={styles.panelIconWrap}>
            <MaterialIcons name={icon} size={20} color={Colors.onSurfaceVariant} />
          </View>
          <Text style={styles.panelLabel}>{label}</Text>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={Colors.outlineVariant}
          style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
        />
      </View>
      {expanded && (
        <View style={styles.panelBody}>
          <Text style={styles.panelContent}>{content}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ── Tela ──────────────────────────────────────────────────────────────────────

export default function SupportScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [allExpanded, setAllExpanded] = useState(false);

  const handleToggle = (idx: number) => {
    if (allExpanded) {
      setAllExpanded(false);
      setExpandedIndex(expandedIndex === idx ? null : idx);
    } else {
      setExpandedIndex(expandedIndex === idx ? null : idx);
    }
  };

  const handleToggleAll = () => {
    setAllExpanded(prev => !prev);
    setExpandedIndex(null);
  };

  const isPanelExpanded = (idx: number) => allExpanded || expandedIndex === idx;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Suporte e Ajuda" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Status card */}
        <View style={styles.statusCard}>
          <View style={styles.statusTop}>
            <View style={styles.statusInfo}>
              <View style={styles.statusDotRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusTitle}>Suporte Online</Text>
              </View>
              <Text style={styles.statusSub}>Estamos prontos para te ajudar agora.</Text>
            </View>
            <View style={styles.statusAvatar}>
              <MaterialIcons name="support-agent" size={32} color={Colors.primary} />
            </View>
          </View>
          <GradientButton
            label="Iniciar Chat"
            onPress={CONTACTS[0].action}
            style={{ marginTop: Spacing.xl }}
          />
        </View>

        {/* Fale conosco */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fale Conosco</Text>
          <View style={styles.contactGrid}>
            {CONTACTS.map(c => (
              <Pressable
                key={c.label}
                style={({ pressed }) => [styles.contactCard, pressed && { opacity: 0.85 }]}
                onPress={c.action}
              >
                <View style={styles.contactIconWrap}>
                  <MaterialIcons name={c.icon} size={24} color={Colors.primary} />
                </View>
                <Text style={styles.contactLabel}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <View style={styles.faqHeader}>
            <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
            <Pressable onPress={handleToggleAll} hitSlop={8}>
              <Text style={styles.seeAll}>{allExpanded ? 'RECOLHER' : 'VER TUDO'}</Text>
            </Pressable>
          </View>
          <View style={styles.panelList}>
            {FAQ_ITEMS.map((item, idx) => (
              <FaqPanel
                key={item.label}
                icon={item.icon}
                label={item.label}
                content={item.content}
                expanded={isPanelExpanded(idx)}
                onToggle={() => handleToggle(idx)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.xxxl,
  },

  // Status card
  statusCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  statusTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  statusInfo: { flex: 1, gap: Spacing.xs },
  statusDotRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
  },
  statusTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 17,
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  statusSub: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  statusAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section
  section: { gap: Spacing.base },
  sectionTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 20,
    color: Colors.onSurface,
    letterSpacing: -0.4,
  },

  // Contacts
  contactGrid: { flexDirection: 'row', gap: Spacing.md },
  contactCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  contactIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.onSurface,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // FAQ header
  faqHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  seeAll: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 1.5,
  },

  // Expansion panels
  panelList: { gap: Spacing.sm },
  panel: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  panelPressed: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  panelExpanded: {
    backgroundColor: Colors.surfaceContainerLowest,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    flex: 1,
  },
  panelIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelLabel: {
    flex: 1,
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: 15,
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  panelBody: {
    marginTop: Spacing.sm,
    paddingLeft: 56, // alinha com o título (40px ícone + 16px gap)
  },
  panelContent: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },
});

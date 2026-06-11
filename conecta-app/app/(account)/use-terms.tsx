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
import { GradientButton } from '@/components/ui/gradient-button';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

const ARTICLES = [
  {
    number: '1',
    title: 'Introdução',
    body: [
      'Bem-vindo ao Conecta. Ao acessar ou utilizar nossa plataforma, você concorda em cumprir e estar vinculado aos seguintes Termos de Uso. Este documento rege o relacionamento entre o Conecta e os usuários de nossos serviços.',
      'O Conecta é um marketplace que conecta prestadores de serviços independentes a clientes em potencial. Não somos empregadores, agentes ou representantes de nenhum dos prestadores listados.',
    ],
  },
  {
    number: '2',
    title: 'Elegibilidade e Cadastro',
    body: [
      'Para utilizar o Conecta, você deve ter pelo menos 18 anos de idade e capacidade legal para celebrar contratos. Ao criar uma conta, você se compromete a fornecer informações precisas, completas e atualizadas.',
    ],
    callout: 'A segurança da sua senha é de sua inteira responsabilidade. Notifique-nos imediatamente sobre qualquer uso não autorizado de sua conta.',
  },
  {
    number: '3',
    title: 'Responsabilidades do Usuário',
    body: ['Os usuários concordam em utilizar a plataforma de forma ética e legal. É estritamente proibido:'],
    bullets: [
      'Publicar conteúdo falso, enganoso ou difamatório.',
      'Tentar burlar os sistemas de pagamento da plataforma.',
      'Assediar ou prejudicar outros usuários ou prestadores.',
    ],
  },
  {
    number: '4',
    title: 'Pagamentos e Cancelamentos',
    body: [
      'Todos os pagamentos são processados através de parceiros seguros. O Conecta retém uma taxa de serviço sobre as transações concluídas para manutenção da plataforma.',
      'Cancelamentos seguem a política específica de cada prestador, respeitando o Código de Defesa do Consumidor.',
    ],
  },
  {
    number: '5',
    title: 'Propriedade Intelectual',
    body: [
      'A marca Conecta, logotipos, designs e código-fonte são de propriedade exclusiva da Conecta Marketplace S.A. O uso não autorizado é passível de sanções legais.',
    ],
  },
  {
    number: '6',
    title: 'Limitação de Responsabilidade',
    body: [
      'O Conecta não se responsabiliza pela qualidade técnica dos serviços prestados, sendo esta de responsabilidade integral do profissional contratado. Atuamos apenas como facilitadores da conexão e transação financeira.',
    ],
  },
];

export default function UseTermsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Termos de Uso" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.docHeader}>
          <View style={styles.legalBadge}>
            <Text style={styles.legalBadgeText}>DOCUMENTAÇÃO LEGAL</Text>
          </View>
          <Text style={styles.docTitle}>Termos de Uso</Text>
          <Text style={styles.docDate}>Última atualização: Janeiro 2024</Text>
        </View>

        {/* Articles */}
        <View style={styles.articles}>
          {ARTICLES.map((article, idx) => (
            <View key={article.number}>
              {idx === 3 && <DarkCtaCard />}
              <Article article={article} />
            </View>
          ))}
        </View>

        {/* Footer note */}
        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            Ao continuar navegando em nossa plataforma, você confirma que leu e compreendeu estes termos.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Article({ article }: { article: typeof ARTICLES[0] }) {
  return (
    <View style={article_s.wrap}>
      <View style={article_s.titleRow}>
        <View style={article_s.accentBar} />
        <Text style={article_s.title}>{article.number}. {article.title}</Text>
      </View>
      <View style={article_s.body}>
        {article.body.map((p, i) => (
          <Text key={i} style={article_s.paragraph}>{p}</Text>
        ))}
        {article.callout && (
          <View style={article_s.callout}>
            <Text style={article_s.calloutText}>{article.callout}</Text>
          </View>
        )}
        {article.bullets && (
          <View style={article_s.bullets}>
            {article.bullets.map((b, i) => (
              <View key={i} style={article_s.bulletRow}>
                <MaterialIcons name="check-circle" size={14} color={Colors.primary} style={{ marginTop: 2 }} />
                <Text style={article_s.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const article_s = StyleSheet.create({
  wrap: { gap: Spacing.base },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  accentBar: { width: 5, height: 22, borderRadius: 3, backgroundColor: Colors.primary },
  title: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  body: { gap: Spacing.md },
  paragraph: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },
  callout: {
    padding: Spacing.base,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary + '4D',
  },
  calloutText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.onSurface,
    lineHeight: 20,
  },
  bullets: { gap: Spacing.sm, marginLeft: Spacing.xs },
  bulletRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  bulletText: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },
});

function DarkCtaCard() {
  return (
    <View style={cta.card}>
      <View style={cta.content}>
        <Text style={cta.title}>Dúvidas sobre os termos?</Text>
        <Text style={cta.sub}>
          Nossa equipe de suporte está disponível para esclarecer qualquer ponto desta documentação.
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => [cta.btn, pressed && { opacity: 0.85 }]}
        onPress={() => router.push('/(account)/support')}
      >
        <Text style={cta.btnLabel}>Falar com Suporte</Text>
      </Pressable>
    </View>
  );
}

const cta = StyleSheet.create({
  card: {
    backgroundColor: Colors.inverseSurface,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    marginVertical: Spacing.xxl,
    gap: Spacing.xl,
    overflow: 'hidden',
  },
  content: { gap: Spacing.sm },
  title: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 20,
    color: '#ffffff',
    letterSpacing: -0.4,
  },
  sub: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.outlineVariant + 'CC',
    lineHeight: 20,
  },
  btn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    alignSelf: 'flex-start',
  },
  btnLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: '#ffffff',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.xxxl,
  },
  docHeader: { gap: Spacing.md },
  legalBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
  },
  legalBadgeText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 1.5,
  },
  docTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 32,
    color: Colors.onSurface,
    letterSpacing: -1,
    lineHeight: 38,
  },
  docDate: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  articles: { gap: Spacing.xxxl },
  footerNote: {
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
    paddingTop: Spacing.xxl,
  },
  footerNoteText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
  },
});

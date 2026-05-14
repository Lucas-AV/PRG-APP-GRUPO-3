import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/gradient-button';
import { InputField } from '@/components/ui/input-field';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function DeleteAccountScreen() {
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    if (!password) return Alert.alert('Atenção', 'Digite sua senha para confirmar a exclusão.');
    Alert.alert(
      'Confirmar exclusão',
      'Esta ação é irreversível. Todos os seus dados serão permanentemente apagados. Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await new Promise(r => setTimeout(r, 1200));
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Excluir Conta" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Warning section */}
        <View style={styles.warnSection}>
          <View style={styles.warnTop}>
            <View style={styles.warnIconWrap}>
              <MaterialIcons name="warning" size={28} color={Colors.error} />
            </View>
            <Text style={styles.warnTag}>Atenção</Text>
          </View>

          <Text style={styles.warnTitle}>Ação Irreversível</Text>
          <Text style={styles.warnText}>
            Ao excluir sua conta, você perderá permanentemente o acesso a todos os seus dados, histórico de serviços e saldo disponível na plataforma.
          </Text>

          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <MaterialIcons name="history" size={22} color={Colors.outline} />
              <Text style={styles.infoCardLabel}>Histórico</Text>
            </View>
            <View style={styles.infoCard}>
              <MaterialIcons name="account-balance-wallet" size={22} color={Colors.outline} />
              <Text style={styles.infoCardLabel}>Saldo</Text>
            </View>
          </View>
        </View>

        {/* Confirmation */}
        <InputField
          label="Digite sua senha para confirmar"
          placeholder="Sua senha atual"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          icon="lock"
        />

        {/* Actions */}
        <View style={styles.actions}>
          <GradientButton label="Manter minha conta" onPress={() => router.back()} />
          <Pressable
            style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
            onPress={handleDelete}
            disabled={loading}
          >
            <MaterialIcons name="delete" size={20} color={Colors.error} />
            <Text style={styles.deleteBtnLabel}>
              {loading ? 'Excluindo…' : 'Sim, excluir minha conta'}
            </Text>
          </Pressable>
        </View>

        {/* Support note */}
        <Text style={styles.supportNote}>
          Lamentamos ver você partir. Se houver algo que possamos fazer para melhorar sua experiência, entre em contato com o{' '}
          <Text style={styles.supportLink}>suporte</Text>.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.xxxl,
  },
  warnSection: { gap: Spacing.base },
  warnTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  warnIconWrap: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.errorContainer + '33',
  },
  warnTag: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.outline,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  warnTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 28,
    color: Colors.onSurface,
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  warnText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },
  infoCards: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  infoCardLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.onSurface,
  },
  actions: { gap: Spacing.md },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
  },
  deleteBtnLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 15,
    color: Colors.error,
  },
  supportNote: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.xl,
  },
  supportLink: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.primary,
  },
});

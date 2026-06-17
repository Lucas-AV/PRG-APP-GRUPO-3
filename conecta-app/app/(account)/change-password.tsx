import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/gradient-button';
import { InputField } from '@/components/ui/input-field';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usersApi } from '@/services/api';

export default function ChangePasswordScreen() {
  const { user, token } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const has8Chars = next.length >= 8;
  const hasUppercase = /[A-Z]/.test(next);
  const hasNumber = /[0-9]/.test(next);

  const handleSave = async () => {
    if (!current) return Alert.alert('Atenção', 'Digite sua senha atual.');
    if (!has8Chars || !hasUppercase || !hasNumber)
      return Alert.alert('Senha fraca', 'A nova senha não atende aos requisitos mínimos.');
    if (next !== confirm)
      return Alert.alert('Atenção', 'As senhas não coincidem.');

    if (!user || !token) return;
    setLoading(true);
    try {
      await usersApi.changePassword(user.id, { current_password: current, new_password: next }, token);
      Alert.alert('Senha atualizada', 'Sua senha foi alterada com sucesso.', [{ text: 'OK' }]);
      setCurrent(''); setNext(''); setConfirm('');
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível alterar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Alteração de senha" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Intro */}
        <View style={styles.intro}>
          <View style={styles.accentBar} />
          <Text style={styles.introText}>
            Para garantir a segurança da sua conta, escolha uma senha forte que você não utilize em outros sites.
          </Text>
        </View>

        {/* Fields */}
        <View style={styles.fields}>
          <InputField
            label="Senha atual"
            placeholder="Digite sua senha atual"
            value={current}
            onChangeText={setCurrent}
            secureTextEntry
            icon="lock"
          />
          <InputField
            label="Nova senha"
            placeholder="Crie uma nova senha"
            value={next}
            onChangeText={setNext}
            secureTextEntry
            icon="lock"
          />
          <InputField
            label="Confirmar nova senha"
            placeholder="Repita a nova senha"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            icon="lock"
          />
        </View>

        {/* Requirements */}
        <View style={styles.reqCard}>
          <Text style={styles.reqTitle}>Requisitos da senha</Text>
          <View style={styles.reqList}>
            <RequirementItem met={has8Chars} label="Mínimo de 8 caracteres" />
            <RequirementItem met={hasUppercase} label="Pelo menos uma letra maiúscula" />
            <RequirementItem met={hasNumber} label="Pelo menos um número" />
          </View>
        </View>

        <GradientButton
          label={loading ? 'Atualizando…' : 'Atualizar Senha'}
          onPress={handleSave}
          disabled={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <View style={req.row}>
      <MaterialIcons
        name={met ? 'check-circle' : 'radio-button-unchecked'}
        size={18}
        color={met ? Colors.brand : Colors.inkMuted}
      />
      <Text style={[req.label, !met && req.labelMuted]}>{label}</Text>
    </View>
  );
}

const req = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  label: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.ink,
  },
  labelMuted: { color: Colors.inkMuted },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.xxxl,
  },
  intro: { flexDirection: 'row', gap: Spacing.base, alignItems: 'flex-start' },
  accentBar: {
    width: 4,
    height: 48,
    borderRadius: 2,
    backgroundColor: Colors.brand,
    marginTop: 2,
  },
  introText: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.inkMuted,
    lineHeight: 22,
  },
  fields: { gap: Spacing.xxl },
  reqCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reqTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.ink,
  },
  reqList: { gap: Spacing.md },
});

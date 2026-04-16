import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Colors } from '@/constants/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ScreenState = 'form' | 'success';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<ScreenState>('form');
  const [loading, setLoading] = useState(false);

  // Clerk/backend será plugado aqui na fase posterior.
  // UC10/E1: não revelar se e-mail existe ou não.
  async function handleSend() {
    if (!EMAIL_REGEX.test(email)) return;
    setLoading(true);
    // Simula latência de rede até Clerk ser integrado
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setState('success');
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-14 pb-12">
          {/* Botão voltar */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-2 mb-10"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Feather name="arrow-left" size={20} color={Colors.primary} />
            <Text
              className="text-primary"
              style={{ fontFamily: 'WorkSans_500Medium', fontSize: 15 }}
            >
              Voltar
            </Text>
          </TouchableOpacity>

          {state === 'form' ? (
            <>
              <Text
                className="text-primary mb-2"
                style={{
                  fontFamily: 'Newsreader_700Bold',
                  fontSize: 28,
                  lineHeight: 34,
                }}
              >
                Recuperar Senha
              </Text>
              <Text
                className="text-on-surface-variant mb-8"
                style={{
                  fontFamily: 'WorkSans_400Regular',
                  fontSize: 15,
                  lineHeight: 24,
                }}
              >
                Digite o e-mail cadastrado e enviaremos instruções para
                redefinir sua senha.
              </Text>

              <Input
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                icon="mail"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="done"
                onSubmitEditing={handleSend}
              />

              <View className="h-6" />
              <Button
                label="Enviar Link de Recuperação"
                onPress={handleSend}
                variant="primary"
                fullWidth
                loading={loading}
                disabled={!EMAIL_REGEX.test(email)}
              />
            </>
          ) : (
            /* Estado de sucesso — UC10/E1: mensagem genérica */
            <View className="flex-1 items-center justify-center px-4">
              <View className="w-16 h-16 rounded-full bg-surface-container-low items-center justify-center mb-6">
                <Feather name="mail" size={28} color={Colors.primary} />
              </View>
              <Text
                className="text-primary text-center mb-3"
                style={{
                  fontFamily: 'Newsreader_700Bold',
                  fontSize: 24,
                  lineHeight: 30,
                }}
              >
                Verifique seu e-mail
              </Text>
              <Text
                className="text-on-surface-variant text-center mb-8"
                style={{
                  fontFamily: 'WorkSans_400Regular',
                  fontSize: 15,
                  lineHeight: 24,
                }}
              >
                Se o e-mail existir na nossa base, enviaremos as instruções
                para redefinir sua senha em instantes.
              </Text>
              <Button
                label="Voltar ao Login"
                onPress={() => router.replace('/(auth)/sign-in')}
                variant="secondary"
                fullWidth
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

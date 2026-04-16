import { useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/theme';

const ONBOARDING_KEY = 'chronicle_onboarding_complete';

interface OnboardingStep {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  subtitle: string;
}

const STEPS: OnboardingStep[] = [
  {
    icon: 'rss',
    title: 'Mantenha-se informado',
    subtitle:
      'Acompanhe as notícias que importam para você, em tempo real e de fontes confiáveis.',
  },
  {
    icon: 'bookmark',
    title: 'Salve para ler depois',
    subtitle:
      'Guarde artigos e leia quando e onde quiser, mesmo sem conexão à internet.',
  },
  {
    icon: 'message-circle',
    title: 'Interaja com a comunidade',
    subtitle:
      'Comente, responda e siga os autores que você admira no CHRONICLE.',
  },
];

async function finishOnboarding() {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {
    // Se falhar ao salvar, navega mesmo assim — o onboarding
    // será exibido novamente na próxima abertura do app.
  }
  router.replace('/(auth)/sign-in');
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  async function handleNext() {
    if (isLastStep) {
      await finishOnboarding();
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Conteúdo principal */}
      <View className="flex-1 items-center justify-center px-8">
        <View
          className="w-24 h-24 rounded-full bg-surface-container-low items-center justify-center mb-10"
        >
          <Feather name={current.icon} size={40} color={Colors.primary} />
        </View>

        <Text
          className="text-primary text-center mb-4"
          style={{
            fontFamily: 'Newsreader_700Bold',
            fontSize: 28,
            lineHeight: 34,
          }}
        >
          {current.title}
        </Text>

        <Text
          className="text-on-surface-variant text-center"
          style={{
            fontFamily: 'WorkSans_400Regular',
            fontSize: 16,
            lineHeight: 26,
          }}
        >
          {current.subtitle}
        </Text>
      </View>

      {/* Rodapé */}
      <View className="px-6 pb-12">
        {/* Indicadores de etapa */}
        <View className="flex-row justify-center items-center mb-8 gap-2">
          {STEPS.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${
                i === step
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-surface-container-high'
              }`}
            />
          ))}
        </View>

        {/* Botões */}
        {isLastStep ? (
          <Button
            label="Começar"
            onPress={handleNext}
            variant="primary"
            fullWidth
          />
        ) : (
          <View className="flex-row items-center justify-between">
            <Button
              label="Pular"
              onPress={() => finishOnboarding()}
              variant="tertiary"
            />
            <Button
              label="Próximo"
              onPress={handleNext}
              variant="primary"
            />
          </View>
        )}
      </View>
    </View>
  );
}

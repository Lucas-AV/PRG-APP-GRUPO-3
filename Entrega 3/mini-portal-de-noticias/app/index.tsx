import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';

const ONBOARDING_KEY = 'chronicle_onboarding_complete';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (seen === 'true') {
          router.replace('/(auth)/sign-in');
        } else {
          router.replace('/onboarding');
        }
      } catch {
        router.replace('/onboarding');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-surface items-center justify-center">
      <Text
        className="text-primary"
        style={{
          fontFamily: 'Newsreader_700Bold',
          fontSize: 42,
          letterSpacing: -1,
        }}
      >
        CHRONICLE
      </Text>
      <ActivityIndicator
        color={Colors.primary}
        size="small"
        style={{ position: 'absolute', bottom: 64 }}
      />
    </View>
  );
}

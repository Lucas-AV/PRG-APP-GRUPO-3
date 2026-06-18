import { useEffect, useState } from 'react';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { View, Pressable, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontFamily } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import i18n, { initI18n } from '@/services/i18n';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { user, token, isLoading } = useAuth();
  const pathname = usePathname();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = pathname === '/' || pathname === '/login' || pathname === '/sign-up';
    const isOnboardingRoute = pathname.startsWith('/step');

    if (!user || !token) {
      if (!isPublicRoute) {
        router.replace('/(auth)/login');
      }
    } else if (!user.onboarding_completed) {
      if (!isOnboardingRoute && !isPublicRoute) {
        router.replace('/(onboarding)/step0');
      }
    }
  }, [user, token, isLoading, pathname]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f5ff' }}>
        <ActivityIndicator size="large" color="#0054d6" />
      </View>
    );
  }

  const CLIENT_ROUTES = ['/search', '/filter', '/provider-profile', '/service-detail', '/provider-reviews'];
  const SCHEDULE_ROUTES = ['/schedule', '/appointment-detail', '/book', '/provider-availability'];
  const SERVICES_ROUTES = ['/services', '/create', '/edit', '/view'];
  const ACCOUNT_ROUTES = ['/profile', '/edit-profile', '/payments', '/addresses', '/about', '/add-address', '/add-balance', '/card-detail', '/change-password', '/delete-account', '/new-card', '/notifications', '/payment-history', '/plans', '/privacy-security', '/receipt', '/support', '/use-terms'];

  const showTabBar =
    !!user &&
    !!token &&
    !!user.onboarding_completed &&
    pathname !== '/login' &&
    pathname !== '/sign-up' &&
    !pathname.startsWith('/step');

  let activeTab = '';
  if (pathname === '/' || CLIENT_ROUTES.some(r => pathname.includes(r))) {
    activeTab = 'index';
  } else if (SCHEDULE_ROUTES.some(r => pathname.includes(r))) {
    activeTab = 'schedule';
  } else if (SERVICES_ROUTES.some(r => pathname.includes(r))) {
    activeTab = 'services';
  } else if (pathname.includes('/messages')) {
    activeTab = 'messages';
  } else if (ACCOUNT_ROUTES.some(r => pathname.includes(r))) {
    activeTab = 'profile';
  }

  const isClient = user?.role === 'cliente';

  return (
    <View style={styles.container}>
      <View style={styles.flex1}>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(services)" />
          <Stack.Screen name="(client)" />
        </Stack>
      </View>

      {showTabBar && (
        <View style={[styles.tabBar, { height: 68 + insets.bottom, paddingBottom: insets.bottom }]}>
          {/* Inicio */}
          <Pressable style={styles.tabItem} onPress={() => router.replace('/(tabs)')}>
            <MaterialIcons
              name="home"
              size={24}
              color={activeTab === 'index' ? Colors.primary : Colors.inkMuted}
            />
            <Text style={[styles.tabLabel, { color: activeTab === 'index' ? Colors.primary : Colors.inkMuted }]}>
              {t('tabs.home')}
            </Text>
          </Pressable>

          {/* Agenda */}
          <Pressable style={styles.tabItem} onPress={() => router.replace('/(tabs)/schedule')}>
            <MaterialIcons
              name="calendar-today"
              size={24}
              color={activeTab === 'schedule' ? Colors.primary : Colors.inkMuted}
            />
            <Text style={[styles.tabLabel, { color: activeTab === 'schedule' ? Colors.primary : Colors.inkMuted }]}>
              {isClient ? t('tabs.bookings') : 'Agenda'}
            </Text>
          </Pressable>

          {/* Servicos */}
          {!isClient && (
            <Pressable style={styles.tabItem} onPress={() => router.replace('/(tabs)/services')}>
              <MaterialIcons
                name="handyman"
                size={24}
                color={activeTab === 'services' ? Colors.primary : Colors.inkMuted}
              />
              <Text style={[styles.tabLabel, { color: activeTab === 'services' ? Colors.primary : Colors.inkMuted }]}>
                Serviços
              </Text>
            </Pressable>
          )}

          {/* Mensagens */}
          {isClient && (
            <Pressable style={styles.tabItem} onPress={() => router.replace('/(tabs)/messages')}>
              <MaterialIcons
                name="chat-bubble-outline"
                size={24}
                color={activeTab === 'messages' ? Colors.primary : Colors.inkMuted}
              />
              <Text style={[styles.tabLabel, { color: activeTab === 'messages' ? Colors.primary : Colors.inkMuted }]}>
                {t('tabs.messages')}
              </Text>
            </Pressable>
          )}

          {/* Conta */}
          <Pressable style={styles.tabItem} onPress={() => router.replace('/(tabs)/profile')}>
            <MaterialIcons
              name="person-outline"
              size={24}
              color={activeTab === 'profile' ? Colors.primary : Colors.inkMuted}
            />
            <Text style={[styles.tabLabel, { color: activeTab === 'profile' ? Colors.primary : Colors.inkMuted }]}>
              {t('tabs.account')}
            </Text>
          </Pressable>
        </View>
      )}
      <StatusBar style="dark" backgroundColor="transparent" translucent />
    </View>
  );
}

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Manrope-SemiBold': Manrope_600SemiBold,
    'Manrope-Bold': Manrope_700Bold,
    'Manrope-ExtraBold': Manrope_800ExtraBold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && i18nReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, i18nReady]);

  if ((!fontsLoaded && !fontError) || !i18nReady) return null;

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex1: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    elevation: 8,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    flex: 1,
  },
  tabLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.4,
    marginTop: 4,
  },
});

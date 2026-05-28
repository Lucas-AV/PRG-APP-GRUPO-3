import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

export default function ProviderProfileScreen() {
  const { name } = useLocalSearchParams<{ id?: string; name?: string }>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title={name ?? 'Perfil do Prestador'} />
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="person" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Perfil do Prestador</Text>
        <Text style={styles.subtitle}>
          Em breve você poderá ver o perfil completo, serviços e avaliações.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
    paddingHorizontal: Spacing.xxxl,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 20,
    color: Colors.onSurface,
    letterSpacing: -0.4,
    marginTop: Spacing.base,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});

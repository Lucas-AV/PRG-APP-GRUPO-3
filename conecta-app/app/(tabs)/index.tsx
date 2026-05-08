import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

// Placeholder da Home — próximas telas serão adicionadas aqui
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>Conecta</Text>
        <View style={styles.iconWrap}>
          <MaterialIcons name="home" size={56} color={Colors.primaryContainer} />
        </View>
        <Text style={styles.title}>Home em construção</Text>
        <Text style={styles.subtitle}>
          As próximas telas do aplicativo serão implementadas aqui.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    gap: Spacing.base,
  },
  logo: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 32,
    letterSpacing: -1,
    color: Colors.primary,
    marginBottom: Spacing.xl,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 22,
    color: Colors.onSurface,
    letterSpacing: -0.5,
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

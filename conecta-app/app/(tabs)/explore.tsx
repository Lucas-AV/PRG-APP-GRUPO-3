import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontFamily } from '@/constants/theme';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Explore Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
});

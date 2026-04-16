import { View, Text } from 'react-native';

export default function Home() {
  return (
    <View className="flex-1 bg-surface items-center justify-center px-8">
      <Text
        className="text-primary text-center mb-3"
        style={{ fontFamily: 'Newsreader_700Bold', fontSize: 28 }}
      >
        CHRONICLE
      </Text>
      <Text
        className="text-on-surface-variant text-center"
        style={{ fontFamily: 'WorkSans_400Regular', fontSize: 15 }}
      >
        Home — implementação na próxima fase
      </Text>
    </View>
  );
}

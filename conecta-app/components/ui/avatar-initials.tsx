import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontFamily, Radius } from '@/constants/theme';

const SIZE_MAP = { sm: 36, md: 48, lg: 72 };
const FONT_MAP = { sm: 13, md: 18, lg: 28 };

interface AvatarInitialsProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  imageUri?: string;
  showEditBadge?: boolean;
  onPress?: () => void;
}

export function AvatarInitials({
  initials,
  size = 'md',
  imageUri,
  showEditBadge = false,
  onPress,
}: AvatarInitialsProps) {
  const dim = SIZE_MAP[size];
  const fontSize = FONT_MAP[size];
  const badgeSize = Math.round(dim * 0.36);

  const inner = imageUri ? (
    <Image source={{ uri: imageUri }} style={[styles.image, { width: dim, height: dim, borderRadius: dim / 2 }]} />
  ) : (
    <View style={[styles.circle, { width: dim, height: dim, borderRadius: dim / 2 }]}>
      <Text style={[styles.initials, { fontSize }]}>{initials.slice(0, 2).toUpperCase()}</Text>
    </View>
  );

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.wrapper}>
      {inner}
      {showEditBadge && (
        <View style={[styles.badge, { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 }]}>
          <MaterialIcons name="camera-alt" size={badgeSize * 0.55} color={Colors.onPrimary} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative', alignSelf: 'flex-start' },
  circle: {
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: FontFamily.headlineExtraBold,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  image: {
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceContainerLowest,
  },
});

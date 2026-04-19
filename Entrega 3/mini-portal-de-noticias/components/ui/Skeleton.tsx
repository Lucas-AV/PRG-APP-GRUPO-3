import { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Colors } from '@/constants/theme';

interface SkeletonBoxProps {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
}

function SkeletonBox({ width, height, borderRadius = 16 }: SkeletonBoxProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ width, height, borderRadius, backgroundColor: Colors.surfaceContainerHigh, opacity }}
    />
  );
}

interface SkeletonProps {
  variant: 'card' | 'compact';
}

export default function Skeleton({ variant }: SkeletonProps) {
  if (variant === 'card') {
    return (
      <View style={{ marginBottom: 24 }}>
        <SkeletonBox width="100%" height={200} borderRadius={16} />
        <View style={{ marginTop: 12, gap: 8 }}>
          <SkeletonBox width="30%" height={20} />
          <SkeletonBox width="90%" height={24} />
          <SkeletonBox width="60%" height={16} />
        </View>
      </View>
    );
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 }}>
      <SkeletonBox width={80} height={80} borderRadius={12} />
      <View style={{ flex: 1, gap: 8 }}>
        <SkeletonBox width="80%" height={18} />
        <SkeletonBox width="50%" height={14} />
        <SkeletonBox width="40%" height={12} />
      </View>
    </View>
  );
}

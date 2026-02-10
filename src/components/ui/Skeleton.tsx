import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({ width, height = 20, borderRadius = 8, className = '' }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 800 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: '#E0E0E0',
        },
        animatedStyle,
      ]}
      className={className}
    />
  );
}

export function CatererCardSkeleton() {
  return (
    <View className="bg-white rounded-card p-3 mb-3">
      <Skeleton width="100%" height={160} borderRadius={12} />
      <View className="mt-3">
        <Skeleton width="70%" height={18} />
        <View className="flex-row mt-2">
          <Skeleton width={60} height={14} />
          <View className="mx-2" />
          <Skeleton width={80} height={14} />
        </View>
        <View className="flex-row mt-2">
          <Skeleton width={50} height={24} borderRadius={20} />
          <View className="mx-1" />
          <Skeleton width={70} height={24} borderRadius={20} />
        </View>
      </View>
    </View>
  );
}

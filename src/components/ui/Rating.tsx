import { View, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { Text } from './Text';
import { COLORS } from '../../utils/constants';

interface RatingDisplayProps {
  rating: number;
  count?: number;
  size?: number;
  className?: string;
}

export function RatingDisplay({ rating, count, size = 14, className = '' }: RatingDisplayProps) {
  return (
    <View className={`flex-row items-center ${className}`}>
      <Star size={size} fill="#F59E0B" color="#F59E0B" />
      <Text variant="body-sm" weight="semibold" className="ml-1">
        {rating.toFixed(1)}
      </Text>
      {count !== undefined && (
        <Text variant="caption" className="ml-1 text-neutral-500">
          ({count})
        </Text>
      )}
    </View>
  );
}

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
}

export function RatingInput({ value, onChange, size = 32 }: RatingInputProps) {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onChange(star)}
          className="mr-1"
        >
          <Star
            size={size}
            fill={star <= value ? '#F59E0B' : 'transparent'}
            color={star <= value ? '#F59E0B' : COLORS.neutral300}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

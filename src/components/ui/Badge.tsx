import { View } from 'react-native';
import { Text } from './Text';

interface BadgeProps {
  label: string;
  variant?: 'veg' | 'nonveg' | 'pureveg' | 'verified' | 'status' | 'default';
  className?: string;
}

const variantStyles: Record<string, { bg: string; text: string; dot?: string }> = {
  veg: { bg: 'bg-green-50 border border-veg', text: 'text-veg', dot: 'bg-veg' },
  nonveg: { bg: 'bg-red-50 border border-nonveg', text: 'text-nonveg', dot: 'bg-nonveg' },
  pureveg: { bg: 'bg-green-50', text: 'text-veg' },
  verified: { bg: 'bg-blue-50', text: 'text-blue-700' },
  status: { bg: 'bg-primary-light', text: 'text-primary' },
  default: { bg: 'bg-neutral-100', text: 'text-neutral-700' },
};

export function Badge({ label, variant = 'default', className = '' }: BadgeProps) {
  const style = variantStyles[variant];
  return (
    <View className={`flex-row items-center px-2 py-1 rounded-chip ${style.bg} ${className}`}>
      {style.dot && <View className={`w-2 h-2 rounded-full ${style.dot} mr-1`} />}
      <Text variant="caption" weight="medium" className={style.text}>
        {label}
      </Text>
    </View>
  );
}

export function VegIndicator({ isVeg }: { isVeg: boolean }) {
  return (
    <View className={`w-4 h-4 border rounded-sm items-center justify-center ${isVeg ? 'border-veg' : 'border-nonveg'}`}>
      <View className={`w-2 h-2 rounded-full ${isVeg ? 'bg-veg' : 'bg-nonveg'}`} />
    </View>
  );
}

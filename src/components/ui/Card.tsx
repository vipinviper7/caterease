import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
}

const variantStyles: Record<string, string> = {
  elevated: 'bg-white rounded-card shadow-sm shadow-black/10',
  outlined: 'bg-white rounded-card border border-neutral-200',
  filled: 'bg-neutral-50 rounded-card',
};

export function Card({ variant = 'elevated', className = '', ...props }: CardProps) {
  return (
    <View className={`${variantStyles[variant]} ${className}`} {...props} />
  );
}

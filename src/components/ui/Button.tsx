import { TouchableOpacity, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-primary',
  secondary: 'bg-neutral-100',
  outline: 'border border-primary bg-transparent',
  ghost: 'bg-transparent',
};

const textVariantStyles: Record<string, string> = {
  primary: 'text-white',
  secondary: 'text-neutral-800',
  outline: 'text-primary',
  ghost: 'text-primary',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-4 py-2',
  md: 'px-6 py-3',
  lg: 'px-8 py-4',
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  onPress,
  className = '',
  ...props
}: ButtonProps) {
  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center rounded-button ${variantStyles[variant]} ${sizeStyles[size]} ${disabled || loading ? 'opacity-50' : ''} ${className}`}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#E86A50'} size="small" />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            weight="semibold"
            variant={size === 'sm' ? 'body-sm' : 'body'}
            className={`${textVariantStyles[variant]} ${icon ? 'ml-2' : ''}`}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

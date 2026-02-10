import { Text as RNText, TextProps } from 'react-native';

interface AppTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'body-sm' | 'caption' | 'label';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

const variantStyles: Record<string, string> = {
  h1: 'text-2xl',
  h2: 'text-xl',
  h3: 'text-lg',
  body: 'text-base',
  'body-sm': 'text-sm',
  caption: 'text-xs',
  label: 'text-sm',
};

const weightStyles: Record<string, string> = {
  regular: 'font-jakarta',
  medium: 'font-jakarta-medium',
  semibold: 'font-jakarta-semibold',
  bold: 'font-jakarta-bold',
};

export function Text({
  variant = 'body',
  weight = 'regular',
  className = '',
  ...props
}: AppTextProps) {
  const baseStyle = `${variantStyles[variant]} ${weightStyles[weight]} text-neutral-900`;
  return <RNText className={`${baseStyle} ${className}`} {...props} />;
}

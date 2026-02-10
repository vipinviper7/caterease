import { View, TextInput, TextInputProps } from 'react-native';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: InputProps) {
  return (
    <View className={className}>
      {label && (
        <Text variant="body-sm" weight="medium" className="mb-1.5 text-neutral-700">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center rounded-input border px-3 py-3 ${
          error ? 'border-nonveg bg-red-50' : 'border-neutral-300 bg-white'
        }`}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className="flex-1 font-jakarta text-base text-neutral-900"
          placeholderTextColor="#9E9E9E"
          {...props}
        />
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error && (
        <Text variant="caption" className="mt-1 text-nonveg">
          {error}
        </Text>
      )}
    </View>
  );
}

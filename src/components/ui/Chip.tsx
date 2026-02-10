import { TouchableOpacity } from 'react-native';
import { Text } from './Text';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function Chip({ label, selected = false, onPress, icon, className = '' }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center px-4 py-2 rounded-chip mr-2 ${
        selected ? 'bg-primary' : 'bg-neutral-100'
      } ${className}`}
    >
      {icon && <>{icon}</>}
      <Text
        variant="body-sm"
        weight={selected ? 'semibold' : 'medium'}
        className={`${selected ? 'text-white' : 'text-neutral-700'} ${icon ? 'ml-1.5' : ''}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

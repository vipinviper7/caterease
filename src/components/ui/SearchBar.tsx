import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { COLORS } from '../../utils/constants';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  onFilterPress?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  editable?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onPress,
  onFilterPress,
  placeholder = 'Search caterers, cuisines...',
  autoFocus = false,
  editable = true,
}: SearchBarProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center bg-neutral-100 rounded-card px-4 py-3"
    >
      <Search size={20} color={COLORS.neutral500} />
      <TextInput
        className="flex-1 mx-3 font-jakarta text-base text-neutral-900"
        placeholder={placeholder}
        placeholderTextColor={COLORS.neutral400}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        editable={editable}
        pointerEvents={onPress ? 'none' : 'auto'}
      />
      {onFilterPress && (
        <TouchableOpacity onPress={onFilterPress}>
          <SlidersHorizontal size={20} color={COLORS.neutral700} />
        </TouchableOpacity>
      )}
    </Container>
  );
}

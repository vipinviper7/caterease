import { View } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      {icon && <View className="mb-4">{icon}</View>}
      <Text variant="h3" weight="semibold" className="text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text variant="body-sm" className="text-center text-neutral-500 mb-6">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} size="sm" />
      )}
    </View>
  );
}

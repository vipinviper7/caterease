import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Text, Button } from '@/src/components/ui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <Text variant="h2" weight="bold" className="mb-4">Page Not Found</Text>
        <Text variant="body" className="text-neutral-500 text-center mb-6">
          The page you're looking for doesn't exist.
        </Text>
        <Link href="/" asChild>
          <Button title="Go Home" />
        </Link>
      </View>
    </>
  );
}

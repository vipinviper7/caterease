import { Stack } from 'expo-router';
import { COLORS } from '@/src/utils/constants';

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: COLORS.neutral900,
        headerTitleStyle: { fontFamily: 'PlusJakartaSans_600SemiBold' },
        headerShadowVisible: false,
        headerBackTitle: '',
      }}
    >
      <Stack.Screen name="search" options={{ headerShown: false }} />
      <Stack.Screen name="caterer/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="booking/new" options={{ title: 'New Booking' }} />
      <Stack.Screen name="booking/menu-select" options={{ title: 'Select Menu' }} />
      <Stack.Screen name="booking/summary" options={{ title: 'Order Summary' }} />
      <Stack.Screen name="booking/confirmation" options={{ headerShown: false }} />
      <Stack.Screen name="booking/[id]/track" options={{ title: 'Track Booking' }} />
      <Stack.Screen name="booking/[id]/review" options={{ title: 'Write Review' }} />
      <Stack.Screen name="booking/[id]/chat" options={{ title: 'Chat' }} />
      <Stack.Screen name="portion-planner" options={{ title: 'Portion Planner' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="addresses" options={{ title: 'Saved Addresses' }} />
      <Stack.Screen name="referral" options={{ title: 'Refer & Earn' }} />
    </Stack>
  );
}

import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle } from 'lucide-react-native';
import { Text, Button, Card } from '@/src/components/ui';
import { useBooking } from '@/src/hooks/useBookings';
import { formatCurrency } from '@/src/utils/formatters';
import { COLORS } from '@/src/utils/constants';

export default function BookingConfirmationScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const { data: booking } = useBooking(bookingId);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-green-50 items-center justify-center mb-4">
            <CheckCircle size={48} color={COLORS.success} />
          </View>
          <Text variant="h2" weight="bold" className="text-center mb-2">Booking Confirmed!</Text>
          <Text variant="body" className="text-center text-neutral-500">
            Your booking has been submitted successfully.
          </Text>
        </View>

        {booking && (
          <Card className="w-full p-4 mb-6">
            <View className="flex-row justify-between mb-2">
              <Text variant="body-sm" className="text-neutral-600">Booking ID</Text>
              <Text variant="body-sm" weight="medium">{booking.id.slice(0, 12)}...</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text variant="body-sm" className="text-neutral-600">Event Date</Text>
              <Text variant="body-sm" weight="medium">{booking.event_date}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text variant="body-sm" className="text-neutral-600">Guests</Text>
              <Text variant="body-sm" weight="medium">{booking.guest_count}</Text>
            </View>
            <View className="border-t border-neutral-100 my-2" />
            <View className="flex-row justify-between mb-2">
              <Text variant="body-sm" className="text-neutral-600">Grand Total</Text>
              <Text variant="body" weight="bold" className="text-primary">{formatCurrency(booking.grand_total)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text variant="body-sm" className="text-neutral-600">Advance Due</Text>
              <Text variant="body-sm" weight="semibold">{formatCurrency(booking.advance_amount)}</Text>
            </View>
          </Card>
        )}

        <View className="w-full gap-3">
          <Button
            title="View Booking"
            onPress={() => router.replace({ pathname: '/(stack)/booking/[id]/track', params: { id: bookingId } })}
            size="lg"
          />
          <Button
            title="Message Caterer"
            variant="outline"
            onPress={() => {
              if (booking) {
                router.push({ pathname: '/(stack)/booking/[id]/chat', params: { id: bookingId, catererId: booking.caterer_id } });
              }
            }}
            size="lg"
          />
          <Button title="Back to Home" variant="ghost" onPress={() => router.replace('/(tabs)')} size="lg" />
        </View>
      </View>
    </SafeAreaView>
  );
}

import { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckSquare, Square, Lock } from 'lucide-react-native';
import { Text, Button, Card } from '@/src/components/ui';
import { VegIndicator } from '@/src/components/ui/Badge';
import { useBookingStore } from '@/src/stores/bookingStore';
import { useCaterer } from '@/src/hooks/useCaterers';
import { useCreateBooking } from '@/src/hooks/useBookings';
import { formatCurrency } from '@/src/utils/formatters';
import { GST_RATE, ADVANCE_PERCENTAGE, COLORS } from '@/src/utils/constants';

export default function BookingSummaryScreen() {
  const router = useRouter();
  const store = useBookingStore();
  const { data: caterer } = useCaterer(store.draft.caterer_id);
  const createBooking = useCreateBooking();
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  if (!caterer) return null;

  const foodTotal = store.getPricePerPlate() * store.draft.guest_count;
  const staffCharge = caterer.staff_charge_per_plate * store.draft.guest_count;
  const setupCharge = caterer.setup_charge;
  const deliveryCharge = caterer.delivery_charge;
  const subtotal = foodTotal + staffCharge + setupCharge + deliveryCharge;
  const gst = Math.round(subtotal * GST_RATE);
  const grandTotal = subtotal + gst;
  const advance = Math.round(grandTotal * ADVANCE_PERCENTAGE);
  const balance = grandTotal - advance;

  const handleConfirm = async () => {
    if (!agreementAccepted) return;
    try {
      const booking = await createBooking.mutateAsync();
      router.replace({ pathname: '/(stack)/booking/confirmation', params: { bookingId: booking.id } });
    } catch (err) {
      console.error('Booking error:', err);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Card className="p-4 mb-4">
        <Text variant="body" weight="bold">{caterer.name}</Text>
        <Text variant="body-sm" className="text-neutral-500 mt-1">{caterer.city}</Text>
      </Card>

      <Card variant="outlined" className="p-4 mb-4">
        <Text variant="body" weight="semibold" className="mb-2">Event Details</Text>
        {[
          ['Type', store.draft.event_type],
          ['Date', store.draft.event_date],
          ['Time', store.draft.event_time],
          ['Guests', String(store.draft.guest_count)],
        ].map(([label, value]) => (
          <View key={label} className="flex-row justify-between mb-1">
            <Text variant="body-sm" className="text-neutral-600">{label}</Text>
            <Text variant="body-sm" weight="medium">{value}</Text>
          </View>
        ))}
        <View className="flex-row justify-between">
          <Text variant="body-sm" className="text-neutral-600">Venue</Text>
          <Text variant="body-sm" weight="medium" className="flex-1 text-right ml-4" numberOfLines={2}>{store.draft.venue_address}</Text>
        </View>
      </Card>

      <Card variant="outlined" className="p-4 mb-4">
        <View className="flex-row items-center mb-3">
          <Lock size={14} color={COLORS.neutral500} />
          <Text variant="body" weight="semibold" className="ml-1">Locked Menu</Text>
        </View>
        {store.draft.selected_items.map((item) => (
          <View key={item.id} className="flex-row items-center py-2 border-b border-neutral-50">
            <VegIndicator isVeg={item.is_veg} />
            <Text variant="body-sm" className="flex-1 ml-2">{item.name}</Text>
            <Text variant="body-sm" weight="medium">{formatCurrency(item.price)}</Text>
          </View>
        ))}
      </Card>

      <Card variant="outlined" className="p-4 mb-4">
        <Text variant="body" weight="semibold" className="mb-3">Price Breakdown</Text>
        {[
          [`Food (${formatCurrency(store.getPricePerPlate())} x ${store.draft.guest_count})`, formatCurrency(foodTotal)],
          ['Staff charge', formatCurrency(staffCharge)],
          ['Setup charge', formatCurrency(setupCharge)],
          ['Delivery charge', formatCurrency(deliveryCharge)],
        ].map(([label, value]) => (
          <View key={label} className="flex-row justify-between mb-2">
            <Text variant="body-sm" className="text-neutral-600">{label}</Text>
            <Text variant="body-sm" weight="medium">{value}</Text>
          </View>
        ))}
        <View className="border-t border-neutral-200 my-2" />
        <View className="flex-row justify-between mb-2">
          <Text variant="body-sm" className="text-neutral-600">Subtotal</Text>
          <Text variant="body-sm" weight="medium">{formatCurrency(subtotal)}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text variant="body-sm" className="text-neutral-600">GST (5%)</Text>
          <Text variant="body-sm" weight="medium">{formatCurrency(gst)}</Text>
        </View>
        <View className="border-t border-neutral-200 my-2" />
        <View className="flex-row justify-between">
          <Text variant="body" weight="bold">Grand Total</Text>
          <Text variant="body" weight="bold" className="text-primary">{formatCurrency(grandTotal)}</Text>
        </View>
      </Card>

      <Card variant="outlined" className="p-4 mb-4">
        <Text variant="body" weight="semibold" className="mb-3">Payment Schedule</Text>
        <View className="flex-row justify-between mb-2">
          <Text variant="body-sm" className="text-neutral-600">Advance (30%) — Due now</Text>
          <Text variant="body-sm" weight="bold" className="text-primary">{formatCurrency(advance)}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text variant="body-sm" className="text-neutral-600">Balance (70%) — Due 2 days before</Text>
          <Text variant="body-sm" weight="medium">{formatCurrency(balance)}</Text>
        </View>
      </Card>

      <TouchableOpacity onPress={() => setAgreementAccepted(!agreementAccepted)} className="flex-row items-start mb-6">
        {agreementAccepted ? (
          <CheckSquare size={22} color={COLORS.primary} />
        ) : (
          <Square size={22} color={COLORS.neutral400} />
        )}
        <Text variant="body-sm" className="text-neutral-600 ml-3 flex-1">
          I agree to the booking terms and conditions. The menu selection is locked and the price breakdown is final. Cancellation charges may apply.
        </Text>
      </TouchableOpacity>

      <Button
        title="Confirm Booking"
        onPress={handleConfirm}
        loading={createBooking.isPending}
        disabled={!agreementAccepted}
        size="lg"
        className="mb-8"
      />
    </ScrollView>
  );
}

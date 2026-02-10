import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, Circle, MessageCircle, FileText } from 'lucide-react-native';
import { Text, Button, Card, Badge } from '@/src/components/ui';
import { useBooking } from '@/src/hooks/useBookings';
import { formatCurrency, formatDate, formatDateTime } from '@/src/utils/formatters';
import { BOOKING_TIMELINE_STAGES, BOOKING_STATUS_LABELS, COLORS } from '@/src/utils/constants';
import { BookingStatus } from '@/src/types/database';

const STATUS_ORDER: BookingStatus[] = [
  'pending_confirmation', 'confirmed', 'menu_locked', 'advance_paid',
  'in_preparation', 'event_day', 'completed',
];

export default function TrackBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: booking } = useBooking(id);

  if (!booking) return null;

  const currentStatusIndex = STATUS_ORDER.indexOf(booking.status);

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      {/* Booking Header */}
      <Card className="p-4 mb-6">
        <View className="flex-row items-center justify-between mb-2">
          <Text variant="body" weight="bold">{booking.caterer?.name || 'Caterer'}</Text>
          <Badge label={BOOKING_STATUS_LABELS[booking.status] || booking.status} variant="status" />
        </View>
        <Text variant="body-sm" className="text-neutral-500">
          {booking.event_type.charAt(0).toUpperCase() + booking.event_type.slice(1)} • {booking.event_date} • {booking.guest_count} guests
        </Text>
        <View className="border-t border-neutral-100 mt-3 pt-3 flex-row justify-between">
          <Text variant="body-sm" className="text-neutral-600">Total</Text>
          <Text variant="body" weight="bold" className="text-primary">{formatCurrency(booking.grand_total)}</Text>
        </View>
      </Card>

      {/* Timeline */}
      <Text variant="body" weight="bold" className="mb-4">Booking Timeline</Text>
      <View className="ml-2 mb-6">
        {BOOKING_TIMELINE_STAGES.map((stage, index) => {
          const stageStatusIndex = STATUS_ORDER.indexOf(stage.stage as BookingStatus);
          const isDone = stageStatusIndex >= 0 && stageStatusIndex <= currentStatusIndex;
          const isCurrent = stage.stage === booking.status || (booking.status === 'pending_confirmation' && index === 0);
          const timelineEntry = booking.timeline?.find(t => t.stage === stage.stage);

          return (
            <View key={stage.stage} className="flex-row mb-0">
              {/* Line + Dot */}
              <View className="items-center mr-4" style={{ width: 24 }}>
                {isDone ? (
                  <CheckCircle size={24} color={COLORS.primary} fill={COLORS.primary} />
                ) : isCurrent ? (
                  <View className="w-6 h-6 rounded-full border-2 border-primary bg-primary-light items-center justify-center">
                    <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                  </View>
                ) : (
                  <Circle size={24} color={COLORS.neutral300} />
                )}
                {index < BOOKING_TIMELINE_STAGES.length - 1 && (
                  <View className={`w-0.5 flex-1 min-h-[40px] ${isDone ? 'bg-primary' : 'bg-neutral-200'}`} />
                )}
              </View>

              {/* Content */}
              <View className="flex-1 pb-6">
                <Text
                  variant="body-sm"
                  weight={isDone || isCurrent ? 'semibold' : 'regular'}
                  className={isDone || isCurrent ? 'text-neutral-900' : 'text-neutral-400'}
                >
                  {stage.label}
                </Text>
                {timelineEntry?.timestamp && (
                  <Text variant="caption" className="text-neutral-400 mt-0.5">
                    {formatDateTime(timelineEntry.timestamp)}
                  </Text>
                )}
                {timelineEntry?.note && (
                  <Text variant="caption" className="text-neutral-500 mt-0.5">
                    {timelineEntry.note}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Actions */}
      <View className="gap-3 mb-8">
        <Button
          title="Message Caterer"
          variant="outline"
          icon={<MessageCircle size={16} color={COLORS.primary} />}
          onPress={() => router.push({
            pathname: '/(stack)/booking/[id]/chat',
            params: { id, catererId: booking.caterer_id }
          })}
        />
        <Button
          title="View Menu"
          variant="ghost"
          icon={<FileText size={16} color={COLORS.primary} />}
          onPress={() => router.push({
            pathname: '/(stack)/caterer/[id]',
            params: { id: booking.caterer_id }
          })}
        />
      </View>
    </ScrollView>
  );
}

import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarCheck, Clock, XCircle } from 'lucide-react-native';
import { Text, Card, Badge, EmptyState } from '@/src/components/ui';
import { useBookings } from '@/src/hooks/useBookings';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import { BOOKING_STATUS_LABELS, COLORS } from '@/src/utils/constants';

const SEGMENTS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
] as const;

export default function BookingsScreen() {
  const [segment, setSegment] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const router = useRouter();
  const { data: bookings, isLoading, refetch } = useBookings(segment);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-4 pt-4 pb-2">
        <Text variant="h2" weight="bold">My Bookings</Text>
      </View>

      {/* Segments */}
      <View className="flex-row mx-4 bg-neutral-100 rounded-card p-1 mb-4">
        {SEGMENTS.map((seg) => (
          <TouchableOpacity
            key={seg.key}
            onPress={() => setSegment(seg.key)}
            className={`flex-1 py-2 rounded-button items-center ${
              segment === seg.key ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text
              variant="body-sm"
              weight={segment === seg.key ? 'semibold' : 'regular'}
              className={segment === seg.key ? 'text-primary' : 'text-neutral-500'}
            >
              {seg.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={COLORS.primary} />}
      >
        {!bookings || bookings.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck size={48} color={COLORS.neutral300} />}
            title={`No ${segment} bookings`}
            description={segment === 'upcoming' ? 'Book a caterer to get started!' : `You don't have any ${segment} bookings yet.`}
            actionLabel={segment === 'upcoming' ? 'Find Caterers' : undefined}
            onAction={segment === 'upcoming' ? () => router.push('/(tabs)') : undefined}
          />
        ) : (
          bookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              onPress={() => {
                if (segment === 'completed') {
                  router.push({ pathname: '/(stack)/booking/[id]/review', params: { id: booking.id, catererId: booking.caterer_id } });
                } else {
                  router.push({ pathname: '/(stack)/booking/[id]/track', params: { id: booking.id } });
                }
              }}
              activeOpacity={0.9}
            >
              <Card className="mb-4 p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text variant="body" weight="semibold" numberOfLines={1} className="flex-1">
                    {booking.caterer?.name || 'Caterer'}
                  </Text>
                  <Badge label={BOOKING_STATUS_LABELS[booking.status] || booking.status} variant="status" />
                </View>
                <View className="flex-row items-center mb-1">
                  <CalendarCheck size={14} color={COLORS.neutral500} />
                  <Text variant="body-sm" className="text-neutral-600 ml-1">
                    {formatDate(booking.event_date)} • {booking.event_time}
                  </Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Text variant="caption" className="text-neutral-500">
                    {booking.event_type.charAt(0).toUpperCase() + booking.event_type.slice(1)} • {booking.guest_count} guests
                  </Text>
                </View>
                <View className="flex-row items-center justify-between pt-2 border-t border-neutral-100">
                  <Text variant="body-sm" weight="semibold" className="text-primary">
                    {formatCurrency(booking.grand_total)}
                  </Text>
                  <Text variant="caption" className="text-primary">
                    {segment === 'upcoming' ? 'Track →' : segment === 'completed' ? 'Review →' : ''}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

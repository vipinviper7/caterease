import { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Heart, Briefcase, Home, Cake, Gem, Calendar, Minus, Plus } from 'lucide-react-native';
import { Text, Button, Input } from '@/src/components/ui';
import { useBookingStore } from '@/src/stores/bookingStore';
import { useCaterer } from '@/src/hooks/useCaterers';
import { EVENT_TYPES, COLORS } from '@/src/utils/constants';
import { addDays, format } from 'date-fns';

const EVENT_ICONS: Record<string, any> = {
  wedding: Heart, birthday: Cake, corporate: Briefcase,
  housewarming: Home, engagement: Gem, other: Calendar,
};

export default function BookingNewScreen() {
  const { catererId } = useLocalSearchParams<{ catererId: string }>();
  const router = useRouter();
  const { data: caterer } = useCaterer(catererId);
  const store = useBookingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const minDate = format(addDays(new Date(), 3), 'yyyy-MM-dd');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!store.draft.event_type) errs.event_type = 'Select an event type';
    if (!store.draft.event_date) errs.event_date = 'Select a date';
    if (!store.draft.event_time) errs.event_time = 'Select a time';
    if (store.draft.guest_count < (caterer?.min_guests || 10)) errs.guest_count = `Minimum ${caterer?.min_guests || 10} guests`;
    if (store.draft.guest_count > (caterer?.max_guests || 5000)) errs.guest_count = `Maximum ${caterer?.max_guests || 5000} guests`;
    if (!store.draft.venue_address || store.draft.venue_address.length < 5) errs.venue_address = 'Enter a valid address';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    store.setDraftField('caterer_id', catererId);
    router.push({ pathname: '/(stack)/booking/menu-select', params: { bookingId: 'new', catererId } });
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text variant="body" weight="semibold" className="mb-3">Event Type</Text>
      <View className="flex-row flex-wrap gap-3 mb-1">
        {EVENT_TYPES.map((et) => {
          const Icon = EVENT_ICONS[et.key] || Calendar;
          const selected = store.draft.event_type === et.key;
          return (
            <TouchableOpacity
              key={et.key}
              onPress={() => store.setDraftField('event_type', et.key as any)}
              className={`w-[30%] items-center p-3 rounded-card border ${selected ? 'border-primary bg-primary-light' : 'border-neutral-200'}`}
            >
              <Icon size={24} color={selected ? COLORS.primary : COLORS.neutral500} />
              <Text variant="caption" weight={selected ? 'semibold' : 'regular'} className={`mt-1 ${selected ? 'text-primary' : ''}`}>
                {et.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {errors.event_type && <Text variant="caption" className="text-nonveg mb-2">{errors.event_type}</Text>}

      <Input
        label="Event Date"
        placeholder="YYYY-MM-DD"
        value={store.draft.event_date}
        onChangeText={(v) => store.setDraftField('event_date', v)}
        error={errors.event_date}
        className="mt-4"
      />
      <Text variant="caption" className="text-neutral-400 mt-1">Minimum 3 days from today ({minDate})</Text>

      <Input
        label="Event Time"
        placeholder="e.g. 12:00 PM"
        value={store.draft.event_time}
        onChangeText={(v) => store.setDraftField('event_time', v)}
        error={errors.event_time}
        className="mt-4"
      />

      <Text variant="body" weight="semibold" className="mt-4 mb-2">Guest Count</Text>
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => store.setDraftField('guest_count', Math.max(10, store.draft.guest_count - 10))}
          className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
        >
          <Minus size={18} color={COLORS.neutral700} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold" className="mx-6">{store.draft.guest_count}</Text>
        <TouchableOpacity
          onPress={() => store.setDraftField('guest_count', store.draft.guest_count + 10)}
          className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
        >
          <Plus size={18} color={COLORS.neutral700} />
        </TouchableOpacity>
      </View>
      {errors.guest_count && <Text variant="caption" className="text-nonveg mt-1">{errors.guest_count}</Text>}
      {caterer && (
        <Text variant="caption" className="text-neutral-400 mt-1">
          This caterer serves {caterer.min_guests} - {caterer.max_guests} guests
        </Text>
      )}

      <Input
        label="Venue Address"
        placeholder="Enter the event venue address"
        value={store.draft.venue_address}
        onChangeText={(v) => store.setDraftField('venue_address', v)}
        error={errors.venue_address}
        multiline
        numberOfLines={3}
        className="mt-4"
      />

      <Input
        label="Special Requests (Optional)"
        placeholder="Any dietary restrictions or special requirements?"
        value={store.draft.special_requests}
        onChangeText={(v) => store.setDraftField('special_requests', v)}
        multiline
        numberOfLines={3}
        className="mt-4"
      />

      <Button title="Select Menu Items" onPress={handleNext} size="lg" className="mt-6 mb-8" />
    </ScrollView>
  );
}

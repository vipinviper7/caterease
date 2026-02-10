import { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, Button, Card, Input } from '@/src/components/ui';
import { RatingInput } from '@/src/components/ui/Rating';
import { useCreateReview } from '@/src/hooks/useReviews';
import { useBooking } from '@/src/hooks/useBookings';
import * as Haptics from 'expo-haptics';

export default function ReviewScreen() {
  const { id, catererId } = useLocalSearchParams<{ id: string; catererId: string }>();
  const router = useRouter();
  const { data: booking } = useBooking(id);
  const createReview = useCreateReview();

  const [overall, setOverall] = useState(0);
  const [taste, setTaste] = useState(0);
  const [service, setService] = useState(0);
  const [value, setValue] = useState(0);
  const [cleanliness, setCleanliness] = useState(0);
  const [text, setText] = useState('');

  const handleSubmit = async () => {
    if (overall === 0) {
      Alert.alert('Rating Required', 'Please provide an overall rating.');
      return;
    }
    try {
      await createReview.mutateAsync({
        bookingId: id,
        catererId: catererId || booking?.caterer_id || '',
        overall_rating: overall,
        taste_rating: taste || overall,
        service_rating: service || overall,
        value_rating: value || overall,
        cleanliness_rating: cleanliness || overall,
        text: text || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Thank you!', 'Your review has been submitted.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      {booking?.caterer && (
        <Card className="p-4 mb-6">
          <Text variant="body" weight="bold">{booking.caterer.name}</Text>
          <Text variant="body-sm" className="text-neutral-500 mt-1">
            {booking.event_type} • {booking.event_date}
          </Text>
        </Card>
      )}

      {/* Overall Rating */}
      <View className="items-center mb-8">
        <Text variant="h3" weight="semibold" className="mb-3">Overall Rating</Text>
        <RatingInput value={overall} onChange={(v) => { setOverall(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} size={40} />
      </View>

      {/* Category Ratings */}
      <Text variant="body" weight="semibold" className="mb-4">Rate Categories</Text>
      {[
        { label: 'Taste & Quality', value: taste, setter: setTaste },
        { label: 'Service', value: service, setter: setService },
        { label: 'Value for Money', value: value, setter: setValue },
        { label: 'Cleanliness', value: cleanliness, setter: setCleanliness },
      ].map((cat) => (
        <View key={cat.label} className="flex-row items-center justify-between mb-4">
          <Text variant="body-sm" className="text-neutral-700">{cat.label}</Text>
          <RatingInput value={cat.value} onChange={cat.setter} size={24} />
        </View>
      ))}

      {/* Review Text */}
      <Input
        label="Your Review (Optional)"
        placeholder="Share your experience with this caterer..."
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={4}
        className="mt-2 mb-6"
      />

      <Button
        title="Submit Review"
        onPress={handleSubmit}
        loading={createReview.isPending}
        disabled={overall === 0}
        size="lg"
        className="mb-8"
      />
    </ScrollView>
  );
}

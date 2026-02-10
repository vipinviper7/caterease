import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { Review } from '../types/database';

const useLocalFallback = !process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co';

let localReviews: Review[] = [];

export function useReviews(catererId: string) {
  return useQuery({
    queryKey: ['reviews', catererId],
    queryFn: async (): Promise<Review[]> => {
      if (useLocalFallback) {
        return localReviews.filter(r => r.caterer_id === catererId);
      }

      const { data, error } = await supabase
        .from('reviews')
        .select('*, profile:profiles(full_name, avatar_url)')
        .eq('caterer_id', catererId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Review[];
    },
    enabled: !!catererId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { session } = useAuthStore();

  return useMutation({
    mutationFn: async (review: {
      bookingId: string;
      catererId: string;
      overall_rating: number;
      taste_rating: number;
      service_rating: number;
      value_rating: number;
      cleanliness_rating: number;
      text?: string;
      images?: string[];
    }) => {
      if (useLocalFallback) {
        const newReview: Review = {
          id: `review-${Date.now()}`,
          booking_id: review.bookingId,
          caterer_id: review.catererId,
          user_id: session?.user?.id || 'local-user',
          overall_rating: review.overall_rating,
          taste_rating: review.taste_rating,
          service_rating: review.service_rating,
          value_rating: review.value_rating,
          cleanliness_rating: review.cleanliness_rating,
          text: review.text || null,
          images: review.images || [],
          created_at: new Date().toISOString(),
        };
        localReviews.push(newReview);
        return newReview;
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          booking_id: review.bookingId,
          caterer_id: review.catererId,
          user_id: session!.user.id,
          overall_rating: review.overall_rating,
          taste_rating: review.taste_rating,
          service_rating: review.service_rating,
          value_rating: review.value_rating,
          cleanliness_rating: review.cleanliness_rating,
          text: review.text || null,
          images: review.images || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data as Review;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', vars.catererId] });
      queryClient.invalidateQueries({ queryKey: ['caterer', vars.catererId] });
    },
  });
}

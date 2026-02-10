import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { Favorite } from '../types/database';
import * as Haptics from 'expo-haptics';

const useLocalFallback = !process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co';

let localFavorites: Favorite[] = [];

export function useFavorites() {
  const { session } = useAuthStore();

  return useQuery({
    queryKey: ['favorites', session?.user?.id],
    queryFn: async (): Promise<Favorite[]> => {
      if (useLocalFallback) return localFavorites;

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', session!.user.id);
      if (error) throw error;
      return (data || []) as Favorite[];
    },
    enabled: useLocalFallback || !!session,
  });
}

export function useIsFavorite(catererId: string) {
  const { data: favorites } = useFavorites();
  return favorites?.some(f => f.caterer_id === catererId) || false;
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { session } = useAuthStore();

  return useMutation({
    mutationFn: async (catererId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (useLocalFallback) {
        const idx = localFavorites.findIndex(f => f.caterer_id === catererId);
        if (idx >= 0) {
          localFavorites.splice(idx, 1);
        } else {
          localFavorites.push({
            id: `fav-${Date.now()}`,
            user_id: 'local-user',
            caterer_id: catererId,
            created_at: new Date().toISOString(),
          });
        }
        return;
      }

      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', session!.user.id)
        .eq('caterer_id', catererId)
        .single();

      if (existing) {
        await supabase.from('favorites').delete().eq('id', existing.id);
      } else {
        await supabase.from('favorites').insert({
          user_id: session!.user.id,
          caterer_id: catererId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

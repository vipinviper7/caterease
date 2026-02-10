import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useBookingStore } from '../stores/bookingStore';
import { Booking, BookingItem, BookingStatus, BookingTimelineEntry } from '../types/database';
import { GST_RATE, ADVANCE_PERCENTAGE } from '../utils/constants';
import caterersJson from '../data/caterers.json';
import { Caterer } from '../types/database';

const useLocalFallback = !process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co';

// In-memory store for local fallback
let localBookings: (Booking & { items?: BookingItem[] })[] = [];

export function useBookings(status?: 'upcoming' | 'completed' | 'cancelled') {
  const { session } = useAuthStore();

  return useQuery({
    queryKey: ['bookings', session?.user?.id, status],
    queryFn: async (): Promise<Booking[]> => {
      if (useLocalFallback) {
        let filtered = [...localBookings];
        if (status === 'upcoming') {
          filtered = filtered.filter(b => !['completed', 'cancelled'].includes(b.status));
        } else if (status === 'completed') {
          filtered = filtered.filter(b => b.status === 'completed');
        } else if (status === 'cancelled') {
          filtered = filtered.filter(b => b.status === 'cancelled');
        }
        return filtered.map(b => ({
          ...b,
          caterer: (caterersJson as unknown as Caterer[]).find(c => c.id === b.caterer_id),
        }));
      }

      let query = supabase
        .from('bookings')
        .select('*, caterer:caterers(*)')
        .eq('user_id', session!.user.id)
        .order('created_at', { ascending: false });

      if (status === 'upcoming') {
        query = query.not('status', 'in', '("completed","cancelled")');
      } else if (status === 'completed') {
        query = query.eq('status', 'completed');
      } else if (status === 'cancelled') {
        query = query.eq('status', 'cancelled');
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Booking[];
    },
    enabled: useLocalFallback || !!session,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: async (): Promise<Booking | null> => {
      if (useLocalFallback) {
        const booking = localBookings.find(b => b.id === id);
        if (booking) {
          return {
            ...booking,
            caterer: (caterersJson as unknown as Caterer[]).find(c => c.id === booking.caterer_id),
          };
        }
        return null;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select('*, caterer:caterers(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Booking;
    },
    enabled: !!id,
  });
}

export function useBookingItems(bookingId: string) {
  return useQuery({
    queryKey: ['booking-items', bookingId],
    queryFn: async (): Promise<BookingItem[]> => {
      if (useLocalFallback) {
        const booking = localBookings.find(b => b.id === bookingId);
        return booking?.items || [];
      }

      const { data, error } = await supabase
        .from('booking_items')
        .select('*')
        .eq('booking_id', bookingId);
      if (error) throw error;
      return (data || []) as BookingItem[];
    },
    enabled: !!bookingId,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { session } = useAuthStore();
  const { draft, resetDraft } = useBookingStore();

  return useMutation({
    mutationFn: async (): Promise<Booking> => {
      const caterer = (caterersJson as unknown as Caterer[]).find(c => c.id === draft.caterer_id);
      if (!caterer) throw new Error('Caterer not found');

      const foodTotal = draft.selected_items.reduce((sum, item) => sum + item.price, 0) * draft.guest_count;
      const staffCharge = caterer.staff_charge_per_plate * draft.guest_count;
      const setupCharge = caterer.setup_charge;
      const deliveryCharge = caterer.delivery_charge;
      const subtotal = foodTotal + staffCharge + setupCharge + deliveryCharge;
      const gstAmount = Math.round(subtotal * GST_RATE);
      const grandTotal = subtotal + gstAmount;
      const advanceAmount = Math.round(grandTotal * ADVANCE_PERCENTAGE);
      const balanceAmount = grandTotal - advanceAmount;

      const timeline: BookingTimelineEntry[] = [
        { stage: 'confirmed', label: 'Booking Confirmed', timestamp: null, note: null },
        { stage: 'menu_locked', label: 'Menu Locked', timestamp: null, note: null },
        { stage: 'advance_paid', label: 'Advance Paid', timestamp: null, note: null },
        { stage: 'in_preparation', label: 'In Preparation', timestamp: null, note: null },
        { stage: 'event_day', label: 'Event Day', timestamp: null, note: null },
        { stage: 'completed', label: 'Service Complete', timestamp: null, note: null },
      ];

      const bookingData = {
        user_id: session?.user?.id || 'local-user',
        caterer_id: draft.caterer_id,
        event_type: draft.event_type!,
        event_date: draft.event_date,
        event_time: draft.event_time,
        guest_count: draft.guest_count,
        venue_address: draft.venue_address,
        special_requests: draft.special_requests || null,
        status: 'pending_confirmation' as BookingStatus,
        food_total: foodTotal,
        staff_charge: staffCharge,
        setup_charge: setupCharge,
        delivery_charge: deliveryCharge,
        subtotal,
        gst_amount: gstAmount,
        grand_total: grandTotal,
        advance_amount: advanceAmount,
        balance_amount: balanceAmount,
        advance_paid: false,
        balance_paid: false,
        agreement_accepted: true,
        timeline,
      };

      if (useLocalFallback) {
        const id = `booking-${Date.now()}`;
        const now = new Date().toISOString();
        const booking: Booking & { items?: BookingItem[] } = {
          id,
          ...bookingData,
          created_at: now,
          updated_at: now,
          items: draft.selected_items.map((item, idx) => ({
            id: `bi-${Date.now()}-${idx}`,
            booking_id: id,
            menu_item_id: item.id,
            name: item.name,
            price: item.price,
            is_veg: item.is_veg,
            quantity: draft.guest_count,
          })),
        };
        localBookings.unshift(booking);
        return booking;
      }

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      // Insert booking items
      const bookingItems = draft.selected_items.map(item => ({
        booking_id: booking.id,
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        is_veg: item.is_veg,
        quantity: draft.guest_count,
      }));

      await supabase.from('booking_items').insert(bookingItems);

      return booking as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      resetDraft();
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: BookingStatus }) => {
      if (useLocalFallback) {
        const booking = localBookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = status;
          booking.updated_at = new Date().toISOString();
          const timelineEntry = booking.timeline.find(t => t.stage === status);
          if (timelineEntry) {
            timelineEntry.timestamp = new Date().toISOString();
          }
        }
        return booking;
      }

      const { data, error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

// Export for local access
export function getLocalBookings() {
  return localBookings;
}

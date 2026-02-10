import { create } from 'zustand';
import { EventType, MenuItem } from '../types/database';

interface BookingDraft {
  caterer_id: string;
  event_type: EventType | null;
  event_date: string;
  event_time: string;
  guest_count: number;
  venue_address: string;
  special_requests: string;
  selected_items: MenuItem[];
}

interface BookingState {
  draft: BookingDraft;
  setDraftField: <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => void;
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  isItemSelected: (itemId: string) => boolean;
  getSelectedCount: () => number;
  getPricePerPlate: () => number;
  resetDraft: () => void;
}

const initialDraft: BookingDraft = {
  caterer_id: '',
  event_type: null,
  event_date: '',
  event_time: '',
  guest_count: 50,
  venue_address: '',
  special_requests: '',
  selected_items: [],
};

export const useBookingStore = create<BookingState>((set, get) => ({
  draft: { ...initialDraft },
  setDraftField: (key, value) =>
    set((state) => ({
      draft: { ...state.draft, [key]: value },
    })),
  addItem: (item) =>
    set((state) => ({
      draft: {
        ...state.draft,
        selected_items: [...state.draft.selected_items, item],
      },
    })),
  removeItem: (itemId) =>
    set((state) => ({
      draft: {
        ...state.draft,
        selected_items: state.draft.selected_items.filter((i) => i.id !== itemId),
      },
    })),
  isItemSelected: (itemId) =>
    get().draft.selected_items.some((i) => i.id === itemId),
  getSelectedCount: () => get().draft.selected_items.length,
  getPricePerPlate: () =>
    get().draft.selected_items.reduce((sum, item) => sum + item.price, 0),
  resetDraft: () => set({ draft: { ...initialDraft } }),
}));

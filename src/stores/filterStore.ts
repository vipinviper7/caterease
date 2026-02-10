import { create } from 'zustand';

interface FilterState {
  searchQuery: string;
  cuisines: string[];
  eventTypes: string[];
  budgetRange: [number, number];
  minRating: number;
  isVegOnly: boolean;
  isVerifiedOnly: boolean;
  guestCount: number | null;
  sortBy: 'rating' | 'price_low' | 'price_high' | 'popularity';
  city: string;
  setSearchQuery: (query: string) => void;
  toggleCuisine: (cuisine: string) => void;
  toggleEventType: (eventType: string) => void;
  setBudgetRange: (range: [number, number]) => void;
  setMinRating: (rating: number) => void;
  setVegOnly: (value: boolean) => void;
  setVerifiedOnly: (value: boolean) => void;
  setGuestCount: (count: number | null) => void;
  setSortBy: (sort: 'rating' | 'price_low' | 'price_high' | 'popularity') => void;
  setCity: (city: string) => void;
  resetFilters: () => void;
  getActiveFilterCount: () => number;
}

const initialFilters = {
  searchQuery: '',
  cuisines: [] as string[],
  eventTypes: [] as string[],
  budgetRange: [0, 2000] as [number, number],
  minRating: 0,
  isVegOnly: false,
  isVerifiedOnly: false,
  guestCount: null as number | null,
  sortBy: 'rating' as const,
  city: 'Bangalore',
};

export const useFilterStore = create<FilterState>((set, get) => ({
  ...initialFilters,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleCuisine: (cuisine) =>
    set((state) => ({
      cuisines: state.cuisines.includes(cuisine)
        ? state.cuisines.filter((c) => c !== cuisine)
        : [...state.cuisines, cuisine],
    })),
  toggleEventType: (eventType) =>
    set((state) => ({
      eventTypes: state.eventTypes.includes(eventType)
        ? state.eventTypes.filter((e) => e !== eventType)
        : [...state.eventTypes, eventType],
    })),
  setBudgetRange: (budgetRange) => set({ budgetRange }),
  setMinRating: (minRating) => set({ minRating }),
  setVegOnly: (isVegOnly) => set({ isVegOnly }),
  setVerifiedOnly: (isVerifiedOnly) => set({ isVerifiedOnly }),
  setGuestCount: (guestCount) => set({ guestCount }),
  setSortBy: (sortBy) => set({ sortBy }),
  setCity: (city) => set({ city }),
  resetFilters: () => set({ ...initialFilters }),
  getActiveFilterCount: () => {
    const state = get();
    let count = 0;
    if (state.cuisines.length > 0) count++;
    if (state.eventTypes.length > 0) count++;
    if (state.budgetRange[0] > 0 || state.budgetRange[1] < 2000) count++;
    if (state.minRating > 0) count++;
    if (state.isVegOnly) count++;
    if (state.isVerifiedOnly) count++;
    if (state.guestCount) count++;
    return count;
  },
}));

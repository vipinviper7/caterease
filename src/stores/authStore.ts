import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { Profile } from '../types/database';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  hasOnboarded: boolean;
  isDemoMode: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setHasOnboarded: (value: boolean) => void;
  setDemoMode: (value: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  isLoading: true,
  hasOnboarded: false,
  isDemoMode: false,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setHasOnboarded: (hasOnboarded) => set({ hasOnboarded }),
  setDemoMode: (isDemoMode) => set({ isDemoMode }),
  reset: () => set({ session: null, profile: null, isLoading: false, isDemoMode: false }),
}));

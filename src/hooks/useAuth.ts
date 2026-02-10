import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { Profile } from '../types/database';

export function useAuth() {
  const { session, profile, isLoading, setSession, setProfile, setLoading, setHasOnboarded, reset } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else reset();
    });

    checkOnboarded();

    return () => subscription.unsubscribe();
  }, []);

  async function checkOnboarded() {
    const value = await AsyncStorage.getItem('hasOnboarded');
    setHasOnboarded(value === 'true');
  }

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) setProfile(data as Profile);
  }

  async function sendOtp(phone: string) {
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`,
    });
    if (error) throw error;
  }

  async function verifyOtp(phone: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token,
      type: 'sms',
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
    reset();
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!session) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id)
      .select()
      .single();
    if (error) throw error;
    if (data) setProfile(data as Profile);
  }

  return {
    session,
    profile,
    isLoading,
    sendOtp,
    verifyOtp,
    signOut,
    updateProfile,
    fetchProfile,
  };
}

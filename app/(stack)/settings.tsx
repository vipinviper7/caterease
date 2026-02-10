import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Input, Button } from '@/src/components/ui';
import { useAuth } from '@/src/hooks/useAuth';
import { useAuthStore } from '@/src/stores/authStore';
import { COLORS } from '@/src/utils/constants';

const CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad'];
const DIETARY_OPTIONS = [
  { key: 'veg', label: 'Vegetarian' },
  { key: 'non-veg', label: 'Non-Vegetarian' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'jain', label: 'Jain' },
];

export default function SettingsScreen() {
  const { profile } = useAuthStore();
  const { updateProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name || '');
  const [city, setCity] = useState(profile?.default_city || 'Bangalore');
  const [dietary, setDietary] = useState(profile?.dietary_preference || '');
  const [notifications, setNotifications] = useState(profile?.notifications_enabled ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: name,
        default_city: city,
        dietary_preference: dietary as any,
        notifications_enabled: notifications,
      });
      Alert.alert('Saved', 'Your settings have been updated.');
    } catch (err) {
      Alert.alert('Error', 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Input
        label="Full Name"
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        className="mb-4"
      />

      <Text variant="body-sm" weight="medium" className="mb-2 text-neutral-700">Default City</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {CITIES.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setCity(c)}
            className={`px-4 py-2 rounded-chip ${city === c ? 'bg-primary' : 'bg-neutral-100'}`}
          >
            <Text variant="body-sm" weight={city === c ? 'semibold' : 'regular'} className={city === c ? 'text-white' : ''}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text variant="body-sm" weight="medium" className="mb-2 text-neutral-700">Dietary Preference</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {DIETARY_OPTIONS.map((d) => (
          <TouchableOpacity
            key={d.key}
            onPress={() => setDietary(d.key)}
            className={`px-4 py-2 rounded-chip ${dietary === d.key ? 'bg-primary' : 'bg-neutral-100'}`}
          >
            <Text variant="body-sm" weight={dietary === d.key ? 'semibold' : 'regular'} className={dietary === d.key ? 'text-white' : ''}>
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => setNotifications(!notifications)}
        className="flex-row items-center justify-between py-4 border-b border-neutral-100 mb-6"
      >
        <Text variant="body">Push Notifications</Text>
        <View className={`w-12 h-7 rounded-full p-0.5 ${notifications ? 'bg-primary' : 'bg-neutral-300'}`}>
          <View className={`w-6 h-6 rounded-full bg-white ${notifications ? 'self-end' : 'self-start'}`} />
        </View>
      </TouchableOpacity>

      <Button title="Save Settings" onPress={handleSave} loading={saving} size="lg" />
    </ScrollView>
  );
}

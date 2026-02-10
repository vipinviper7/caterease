import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Heart, Gift, Settings, HelpCircle, Info, LogOut, ChevronRight, User } from 'lucide-react-native';
import { Text, Card } from '@/src/components/ui';
import { useAuth } from '@/src/hooks/useAuth';
import { useAuthStore } from '@/src/stores/authStore';
import { COLORS } from '@/src/utils/constants';

const MENU_ITEMS = [
  { icon: MapPin, label: 'Saved Addresses', route: '/(stack)/addresses' },
  { icon: Heart, label: 'Favorites', route: '/(stack)/search' },
  { icon: Gift, label: 'Refer & Earn', route: '/(stack)/referral' },
  { icon: Settings, label: 'Settings', route: '/(stack)/settings' },
  { icon: HelpCircle, label: 'Help & Support', route: null },
  { icon: Info, label: 'About CaterEase', route: null },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { profile } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1">
        <View className="px-4 pt-4 pb-6">
          <Text variant="h2" weight="bold">Profile</Text>
        </View>

        {/* User Card */}
        <Card className="mx-4 p-4 mb-6">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-primary-light items-center justify-center">
              <User size={28} color={COLORS.primary} />
            </View>
            <View className="flex-1 ml-4">
              <Text variant="body" weight="bold">
                {profile?.full_name || 'CaterEase User'}
              </Text>
              <Text variant="body-sm" className="text-neutral-500 mt-0.5">
                {profile?.phone || 'Demo Mode'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(stack)/settings')}
              className="p-2"
            >
              <Text variant="body-sm" weight="medium" className="text-primary">Edit</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Menu Items */}
        <View className="mx-4">
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => item.route ? router.push(item.route as any) : null}
              className="flex-row items-center py-4 border-b border-neutral-100"
            >
              <View className="w-10 h-10 rounded-full bg-neutral-50 items-center justify-center">
                <item.icon size={20} color={COLORS.neutral700} />
              </View>
              <Text variant="body" className="flex-1 ml-3">{item.label}</Text>
              <ChevronRight size={18} color={COLORS.neutral400} />
            </TouchableOpacity>
          ))}

          {/* Sign Out */}
          <TouchableOpacity
            onPress={handleSignOut}
            className="flex-row items-center py-4 mt-4"
          >
            <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center">
              <LogOut size={20} color={COLORS.nonveg} />
            </View>
            <Text variant="body" weight="medium" className="text-nonveg ml-3">Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View className="items-center py-8">
          <Text variant="caption" className="text-neutral-400">CaterEase v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { View, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { Gift, Copy, Share2 } from 'lucide-react-native';
import { Text, Card, Button } from '@/src/components/ui';
import { useAuthStore } from '@/src/stores/authStore';
import { COLORS } from '@/src/utils/constants';
import * as Haptics from 'expo-haptics';

export default function ReferralScreen() {
  const { profile } = useAuthStore();
  const referralCode = profile?.referral_code || 'CATER500';

  const handleCopy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Copied!', 'Referral code copied to clipboard.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join CaterEase and get ₹500 off your first booking! Use my referral code: ${referralCode}\n\nDownload now: https://caterease.app`,
      });
    } catch (err) {
      // User cancelled
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      {/* Hero */}
      <View className="items-center py-8 mb-6">
        <View className="w-20 h-20 rounded-full bg-primary-light items-center justify-center mb-4">
          <Gift size={40} color={COLORS.primary} />
        </View>
        <Text variant="h2" weight="bold" className="text-center mb-2">
          Give ₹500, Get ₹500
        </Text>
        <Text variant="body" className="text-center text-neutral-500 px-4">
          Share your referral code with friends. When they book their first event, you both get ₹500 off!
        </Text>
      </View>

      {/* Referral Code */}
      <Card className="p-4 mb-6">
        <Text variant="body-sm" weight="medium" className="text-neutral-500 mb-2">Your Referral Code</Text>
        <View className="flex-row items-center justify-between bg-neutral-50 rounded-card p-4">
          <Text variant="h3" weight="bold" className="tracking-widest">{referralCode}</Text>
          <TouchableOpacity onPress={handleCopy} className="p-2">
            <Copy size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </Card>

      <Button
        title="Share with Friends"
        icon={<Share2 size={18} color="#fff" />}
        onPress={handleShare}
        size="lg"
        className="mb-6"
      />

      {/* How it works */}
      <Card variant="outlined" className="p-4 mb-6">
        <Text variant="body" weight="semibold" className="mb-3">How it works</Text>
        {[
          { step: '1', text: 'Share your unique referral code with friends' },
          { step: '2', text: 'They sign up and book their first event' },
          { step: '3', text: 'You both get ₹500 off your next booking!' },
        ].map((item) => (
          <View key={item.step} className="flex-row items-start mb-3">
            <View className="w-6 h-6 rounded-full bg-primary items-center justify-center mr-3 mt-0.5">
              <Text variant="caption" weight="bold" className="text-white">{item.step}</Text>
            </View>
            <Text variant="body-sm" className="text-neutral-600 flex-1">{item.text}</Text>
          </View>
        ))}
      </Card>

      {/* Referral History */}
      <Text variant="body" weight="semibold" className="mb-3">Referral History</Text>
      <View className="items-center py-8">
        <Text variant="body-sm" className="text-neutral-400">No referrals yet. Start sharing!</Text>
      </View>
    </ScrollView>
  );
}

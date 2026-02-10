import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone } from 'lucide-react-native';
import { Text, Button, Input } from '@/src/components/ui';
import { useAuth } from '@/src/hooks/useAuth';
import { COLORS } from '@/src/utils/constants';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { sendOtp } = useAuth();

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await sendOtp(phone);
      router.push({ pathname: '/(auth)/verify-otp', params: { phone } });
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // For demo: skip auth and go directly to tabs
  const handleDemoMode = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-16">
          <View className="mb-12">
            <Text variant="h1" weight="bold" className="text-primary mb-2">
              CaterEase
            </Text>
            <Text variant="h2" weight="semibold" className="mb-2">
              Welcome back
            </Text>
            <Text variant="body" className="text-neutral-500">
              Enter your phone number to continue
            </Text>
          </View>

          <Input
            label="Phone Number"
            placeholder="Enter 10-digit number"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={(text) => {
              setPhone(text.replace(/[^0-9]/g, ''));
              setError('');
            }}
            leftIcon={
              <View className="flex-row items-center">
                <Phone size={18} color={COLORS.neutral500} />
                <Text variant="body" className="ml-2 text-neutral-700">+91</Text>
              </View>
            }
            error={error}
          />

          <Button
            title="Send OTP"
            onPress={handleSendOtp}
            loading={loading}
            disabled={phone.length !== 10}
            className="mt-6"
            size="lg"
          />

          <View className="mt-8 items-center">
            <Text variant="caption" className="text-neutral-400 mb-4">
              By continuing, you agree to our Terms of Service
            </Text>

            <Button
              title="Continue in Demo Mode"
              variant="outline"
              onPress={handleDemoMode}
              size="md"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

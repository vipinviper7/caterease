import { useState, useRef, useEffect } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '@/src/components/ui';
import { useAuth } from '@/src/hooks/useAuth';

export default function VerifyOtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const router = useRouter();
  const { verifyOtp, sendOtp } = useAuth();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError('');

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits entered
    if (index === 5 && text) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join('');
    if (otpCode.length !== 6) {
      setError('Enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await verifyOtp(phone!, otpCode);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await sendOtp(phone!);
      setCountdown(30);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-16">
          <Text variant="h2" weight="bold" className="mb-2">
            Verify OTP
          </Text>
          <Text variant="body" className="text-neutral-500 mb-8">
            Enter the 6-digit code sent to +91 {phone}
          </Text>

          {/* OTP Input */}
          <View className="flex-row justify-between mb-6">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                className="w-12 h-14 border-2 rounded-input text-center text-xl font-jakarta-bold border-neutral-300 focus:border-primary"
                maxLength={1}
                keyboardType="number-pad"
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          {error ? (
            <Text variant="body-sm" className="text-nonveg mb-4">
              {error}
            </Text>
          ) : null}

          <Button
            title="Verify"
            onPress={() => handleVerify()}
            loading={loading}
            size="lg"
            className="mb-6"
          />

          <View className="items-center">
            {countdown > 0 ? (
              <Text variant="body-sm" className="text-neutral-500">
                Resend OTP in {countdown}s
              </Text>
            ) : (
              <Button
                title="Resend OTP"
                variant="ghost"
                onPress={handleResend}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

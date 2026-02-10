import { useState, useRef } from 'react';
import { View, FlatList, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '@/src/components/ui';
import { useAuthStore } from '@/src/stores/authStore';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Find Your Perfect Caterer',
    description: 'Browse hundreds of caterers with verified reviews, menus, and transparent pricing.',
    emoji: '🍽️',
  },
  {
    id: '2',
    title: 'Book With Confidence',
    description: 'Secure your event with digital agreements, menu locking, and clear payment schedules.',
    emoji: '✅',
  },
  {
    id: '3',
    title: 'Track Every Detail',
    description: 'Follow your booking from confirmation to event day with real-time updates and direct messaging.',
    emoji: '📱',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const { setHasOnboarded } = useAuthStore();

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await completeOnboarding();
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    setHasOnboarded(true);
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-end px-4 pt-2">
        {currentIndex < slides.length - 1 && (
          <Button title="Skip" variant="ghost" size="sm" onPress={handleSkip} />
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="items-center justify-center px-8" style={{ width }}>
            <View className="w-32 h-32 rounded-full bg-primary-light items-center justify-center mb-8">
              <Text className="text-6xl">{item.emoji}</Text>
            </View>
            <Text variant="h1" weight="bold" className="text-center mb-4">
              {item.title}
            </Text>
            <Text variant="body" className="text-center text-neutral-600 leading-6">
              {item.description}
            </Text>
          </View>
        )}
      />

      {/* Dot indicators */}
      <View className="flex-row justify-center mb-8">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`w-2 h-2 rounded-full mx-1 ${
              index === currentIndex ? 'bg-primary w-6' : 'bg-neutral-300'
            }`}
          />
        ))}
      </View>

      <View className="px-6 pb-6">
        <Button
          title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          size="lg"
          className="w-full"
        />
      </View>
    </SafeAreaView>
  );
}

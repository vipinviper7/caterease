import { View, ScrollView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, MapPin, ChevronDown } from 'lucide-react-native';
import { Text, Chip, SearchBar, CatererCardSkeleton } from '@/src/components/ui';
import { CatererCard } from '@/src/components/caterer/CatererCard';
import { useCaterers, useFeaturedCaterers } from '@/src/hooks/useCaterers';
import { useFilterStore } from '@/src/stores/filterStore';
import { useAuthStore } from '@/src/stores/authStore';
import { COLORS, CUISINE_TYPES } from '@/src/utils/constants';
import { useState } from 'react';

const QUICK_FILTERS = [
  { key: 'pureveg', label: 'Pure Veg' },
  { key: 'wedding', label: 'Wedding' },
  { key: 'under500', label: 'Under ₹500' },
  { key: 'toprated', label: 'Top Rated' },
  { key: 'verified', label: 'Verified' },
];

const CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad'];

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const filters = useFilterStore();
  const { data: caterers, isLoading, refetch } = useCaterers();
  const { data: featured } = useFeaturedCaterers();
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const handleQuickFilter = (key: string) => {
    if (activeQuickFilter === key) {
      setActiveQuickFilter(null);
      filters.resetFilters();
      return;
    }
    setActiveQuickFilter(key);
    filters.resetFilters();
    switch (key) {
      case 'pureveg': filters.setVegOnly(true); break;
      case 'wedding': filters.toggleEventType('wedding'); break;
      case 'under500': filters.setBudgetRange([0, 500]); break;
      case 'toprated': filters.setMinRating(4.5); break;
      case 'verified': filters.setVerifiedOnly(true); break;
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <View>
            <Text variant="body-sm" className="text-neutral-500">
              {greeting()}{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
            </Text>
            <TouchableOpacity
              onPress={() => setShowCityPicker(!showCityPicker)}
              className="flex-row items-center mt-1"
            >
              <MapPin size={16} color={COLORS.primary} />
              <Text variant="body" weight="semibold" className="ml-1">
                {filters.city}
              </Text>
              <ChevronDown size={16} color={COLORS.neutral600} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center">
            <Bell size={20} color={COLORS.neutral700} />
          </TouchableOpacity>
        </View>

        {/* City picker dropdown */}
        {showCityPicker && (
          <View className="mx-4 bg-white border border-neutral-200 rounded-card p-2 mb-2">
            {CITIES.map((city) => (
              <TouchableOpacity
                key={city}
                onPress={() => {
                  filters.setCity(city);
                  setShowCityPicker(false);
                  setActiveQuickFilter(null);
                }}
                className={`py-2 px-3 rounded-lg ${filters.city === city ? 'bg-primary-light' : ''}`}
              >
                <Text
                  variant="body-sm"
                  weight={filters.city === city ? 'semibold' : 'regular'}
                  className={filters.city === city ? 'text-primary' : ''}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Search Bar */}
        <View className="px-4 mt-3 mb-4">
          <SearchBar
            onPress={() => router.push('/(stack)/search')}
            editable={false}
          />
        </View>

        {/* Quick Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          className="mb-4"
        >
          {QUICK_FILTERS.map((filter) => (
            <Chip
              key={filter.key}
              label={filter.label}
              selected={activeQuickFilter === filter.key}
              onPress={() => handleQuickFilter(filter.key)}
            />
          ))}
        </ScrollView>

        {/* Featured Caterers */}
        {featured && featured.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between px-4 mb-3">
              <Text variant="h3" weight="bold">Featured Caterers</Text>
              <TouchableOpacity onPress={() => router.push('/(stack)/search')}>
                <Text variant="body-sm" weight="medium" className="text-primary">See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={featured}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CatererCard caterer={item} variant="horizontal" />
              )}
            />
          </View>
        )}

        {/* Cuisine Categories */}
        <View className="mb-6">
          <Text variant="h3" weight="bold" className="px-4 mb-3">Browse by Cuisine</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {CUISINE_TYPES.map((cuisine) => (
              <TouchableOpacity
                key={cuisine}
                onPress={() => {
                  filters.resetFilters();
                  filters.toggleCuisine(cuisine);
                  router.push('/(stack)/search');
                }}
                className="items-center mr-4"
              >
                <View className="w-16 h-16 rounded-full bg-primary-light items-center justify-center mb-2">
                  <Text className="text-2xl">
                    {cuisine === 'North Indian' ? '🍛' :
                     cuisine === 'South Indian' ? '🥘' :
                     cuisine === 'Chinese' ? '🥡' :
                     cuisine === 'Continental' ? '🍝' :
                     cuisine === 'Mughlai' ? '🍗' :
                     cuisine === 'Street Food' ? '🌮' :
                     cuisine === 'Italian' ? '🍕' : '🍽️'}
                  </Text>
                </View>
                <Text variant="caption" weight="medium" className="text-center">
                  {cuisine}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Caterers List */}
        <View className="px-4 pb-8">
          <Text variant="h3" weight="bold" className="mb-3">
            Caterers in {filters.city}
          </Text>
          {isLoading ? (
            <>
              <CatererCardSkeleton />
              <CatererCardSkeleton />
              <CatererCardSkeleton />
            </>
          ) : caterers && caterers.length > 0 ? (
            caterers.map((caterer) => (
              <CatererCard key={caterer.id} caterer={caterer} />
            ))
          ) : (
            <View className="items-center py-12">
              <Text variant="body" className="text-neutral-500">
                No caterers found. Try changing filters.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

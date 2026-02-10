import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, X } from 'lucide-react-native';
import { Text, SearchBar, Chip, Button, CatererCardSkeleton } from '@/src/components/ui';
import { CatererCard } from '@/src/components/caterer/CatererCard';
import { useCaterers } from '@/src/hooks/useCaterers';
import { useFilterStore } from '@/src/stores/filterStore';
import { COLORS, CUISINE_TYPES, EVENT_TYPES } from '@/src/utils/constants';

export default function SearchScreen() {
  const router = useRouter();
  const filters = useFilterStore();
  const { data: caterers, isLoading } = useCaterers();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Search Header */}
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color={COLORS.neutral900} />
        </TouchableOpacity>
        <View className="flex-1">
          <SearchBar
            value={filters.searchQuery}
            onChangeText={filters.setSearchQuery}
            onFilterPress={() => setShowFilters(true)}
            autoFocus
          />
        </View>
      </View>

      {/* Active Filter Chips */}
      {filters.getActiveFilterCount() > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          className="mb-2"
        >
          {filters.cuisines.map((c) => (
            <Chip key={c} label={c} selected onPress={() => filters.toggleCuisine(c)} className="mb-2" />
          ))}
          {filters.isVegOnly && <Chip label="Pure Veg" selected onPress={() => filters.setVegOnly(false)} className="mb-2" />}
          {filters.isVerifiedOnly && <Chip label="Verified" selected onPress={() => filters.setVerifiedOnly(false)} className="mb-2" />}
          {filters.minRating > 0 && <Chip label={`${filters.minRating}+ Rating`} selected onPress={() => filters.setMinRating(0)} className="mb-2" />}
          <Chip
            label="Clear All"
            onPress={() => filters.resetFilters()}
            className="mb-2"
          />
        </ScrollView>
      )}

      {/* Results */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <Text variant="body-sm" className="text-neutral-500 mb-3">
          {caterers?.length || 0} caterers found
        </Text>
        {isLoading ? (
          <>
            <CatererCardSkeleton />
            <CatererCardSkeleton />
          </>
        ) : caterers && caterers.length > 0 ? (
          caterers.map((caterer) => (
            <CatererCard key={caterer.id} caterer={caterer} />
          ))
        ) : (
          <View className="items-center py-12">
            <Text variant="body" className="text-neutral-500">No caterers match your filters.</Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-4 pt-4 pb-4 border-b border-neutral-100">
            <Text variant="h3" weight="bold">Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={24} color={COLORS.neutral700} />
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1 px-4 pt-4">
            {/* Cuisine */}
            <Text variant="body" weight="semibold" className="mb-3">Cuisine</Text>
            <View className="flex-row flex-wrap mb-6">
              {CUISINE_TYPES.map((cuisine) => (
                <Chip
                  key={cuisine}
                  label={cuisine}
                  selected={filters.cuisines.includes(cuisine)}
                  onPress={() => filters.toggleCuisine(cuisine)}
                  className="mb-2"
                />
              ))}
            </View>

            {/* Event Type */}
            <Text variant="body" weight="semibold" className="mb-3">Event Type</Text>
            <View className="flex-row flex-wrap mb-6">
              {EVENT_TYPES.map((et) => (
                <Chip
                  key={et.key}
                  label={et.label}
                  selected={filters.eventTypes.includes(et.key)}
                  onPress={() => filters.toggleEventType(et.key)}
                  className="mb-2"
                />
              ))}
            </View>

            {/* Rating */}
            <Text variant="body" weight="semibold" className="mb-3">Minimum Rating</Text>
            <View className="flex-row mb-6">
              {[0, 3.5, 4.0, 4.5].map((r) => (
                <Chip
                  key={r}
                  label={r === 0 ? 'Any' : `${r}+`}
                  selected={filters.minRating === r}
                  onPress={() => filters.setMinRating(r)}
                  className="mb-2"
                />
              ))}
            </View>

            {/* Toggles */}
            <View className="mb-6">
              <TouchableOpacity
                onPress={() => filters.setVegOnly(!filters.isVegOnly)}
                className="flex-row items-center justify-between py-3"
              >
                <Text variant="body">Pure Veg Only</Text>
                <View className={`w-12 h-7 rounded-full p-0.5 ${filters.isVegOnly ? 'bg-primary' : 'bg-neutral-300'}`}>
                  <View className={`w-6 h-6 rounded-full bg-white ${filters.isVegOnly ? 'self-end' : 'self-start'}`} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => filters.setVerifiedOnly(!filters.isVerifiedOnly)}
                className="flex-row items-center justify-between py-3"
              >
                <Text variant="body">Verified Only</Text>
                <View className={`w-12 h-7 rounded-full p-0.5 ${filters.isVerifiedOnly ? 'bg-primary' : 'bg-neutral-300'}`}>
                  <View className={`w-6 h-6 rounded-full bg-white ${filters.isVerifiedOnly ? 'self-end' : 'self-start'}`} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Sort */}
            <Text variant="body" weight="semibold" className="mb-3">Sort By</Text>
            <View className="flex-row flex-wrap mb-6">
              {[
                { key: 'rating', label: 'Top Rated' },
                { key: 'price_low', label: 'Price: Low to High' },
                { key: 'price_high', label: 'Price: High to Low' },
              ].map((sort) => (
                <Chip
                  key={sort.key}
                  label={sort.label}
                  selected={filters.sortBy === sort.key}
                  onPress={() => filters.setSortBy(sort.key as any)}
                  className="mb-2"
                />
              ))}
            </View>
          </ScrollView>

          <View className="px-4 pb-6 pt-4 border-t border-neutral-100 flex-row">
            <Button
              title="Reset"
              variant="outline"
              onPress={() => filters.resetFilters()}
              className="flex-1 mr-3"
            />
            <Button
              title="Apply Filters"
              onPress={() => setShowFilters(false)}
              className="flex-1"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

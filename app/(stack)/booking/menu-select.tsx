import { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Text, Button, Chip } from '@/src/components/ui';
import { VegIndicator } from '@/src/components/ui/Badge';
import { useBookingStore } from '@/src/stores/bookingStore';
import { useCatererMenu } from '@/src/hooks/useCaterers';
import { formatCurrency } from '@/src/utils/formatters';
import { COLORS } from '@/src/utils/constants';

export default function MenuSelectScreen() {
  const { catererId } = useLocalSearchParams<{ catererId: string }>();
  const router = useRouter();
  const { data: menuData } = useCatererMenu(catererId);
  const store = useBookingStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = menuData?.categories || [];
  const filteredItems = activeCategory
    ? categories.find(c => c.id === activeCategory)?.items || []
    : categories.flatMap(c => c.items);

  const handleToggleItem = (item: any) => {
    if (store.isItemSelected(item.id)) {
      store.removeItem(item.id);
    } else {
      store.addItem(item);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
      >
        <Chip label="All" selected={!activeCategory} onPress={() => setActiveCategory(null)} />
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.name}
            selected={activeCategory === cat.id}
            onPress={() => setActiveCategory(cat.id)}
          />
        ))}
      </ScrollView>

      <ScrollView className="flex-1 px-4">
        <TouchableOpacity onPress={() => router.push('/(stack)/portion-planner')} className="mb-4">
          <Text variant="body-sm" weight="medium" className="text-primary">
            Need help deciding? Try the Portion Planner
          </Text>
        </TouchableOpacity>

        {filteredItems.map((item) => {
          const selected = store.isItemSelected(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleToggleItem(item)}
              className={`flex-row items-center py-4 px-3 mb-2 rounded-card border ${selected ? 'border-primary bg-primary-light' : 'border-neutral-100'}`}
            >
              <VegIndicator isVeg={item.is_veg} />
              <View className="flex-1 mx-3">
                <Text variant="body-sm" weight="medium">{item.name}</Text>
                {item.description && (
                  <Text variant="caption" className="text-neutral-500 mt-0.5" numberOfLines={1}>{item.description}</Text>
                )}
                {item.is_popular && (
                  <Text variant="caption" weight="semibold" className="text-primary mt-0.5">Popular</Text>
                )}
              </View>
              <Text variant="body-sm" weight="semibold" className="mr-3">{formatCurrency(item.price)}</Text>
              <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selected ? 'bg-primary border-primary' : 'border-neutral-300'}`}>
                {selected && <Check size={14} color="#fff" />}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {store.getSelectedCount() > 0 && (
        <View className="px-4 py-4 border-t border-neutral-100 bg-white">
          <View className="flex-row items-center justify-between mb-3">
            <Text variant="body-sm" className="text-neutral-600">
              {store.getSelectedCount()} items selected
            </Text>
            <Text variant="body" weight="bold" className="text-primary">
              {formatCurrency(store.getPricePerPlate())}/plate
            </Text>
          </View>
          <Button
            title="Continue to Summary"
            onPress={() => router.push({ pathname: '/(stack)/booking/summary', params: { bookingId: 'new' } })}
            size="lg"
          />
        </View>
      )}
    </View>
  );
}

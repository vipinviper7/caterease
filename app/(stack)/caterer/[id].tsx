import { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ArrowLeft, Share2, Heart, BadgeCheck, Clock, Users, MessageCircle } from 'lucide-react-native';
import { Text, Button, Badge, Card, Chip, RatingDisplay, Skeleton } from '@/src/components/ui';
import { VegIndicator } from '@/src/components/ui/Badge';
import { useCaterer, useCatererMenu } from '@/src/hooks/useCaterers';
import { useReviews } from '@/src/hooks/useReviews';
import { useIsFavorite, useToggleFavorite } from '@/src/hooks/useFavorites';
import { formatCurrency } from '@/src/utils/formatters';
import { COLORS } from '@/src/utils/constants';

type Tab = 'menu' | 'reviews' | 'info';

export default function CatererProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('menu');
  const { data: caterer, isLoading } = useCaterer(id);
  const { data: menuData } = useCatererMenu(id);
  const { data: reviews } = useReviews(id);
  const isFavorite = useIsFavorite(id);
  const toggleFavorite = useToggleFavorite();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  if (isLoading || !caterer) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Skeleton width="100%" height={250} borderRadius={0} />
        <View className="p-4">
          <Skeleton width="70%" height={24} className="mb-3" />
          <Skeleton width="50%" height={16} className="mb-2" />
          <Skeleton width="90%" height={16} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="relative">
          <Image
            source={{ uri: caterer.cover_image_url }}
            style={{ width: '100%', height: 280 }}
            contentFit="cover"
            transition={300}
          />
          <SafeAreaView className="absolute top-0 left-0 right-0" edges={['top']}>
            <View className="flex-row items-center justify-between px-4 pt-2">
              <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-black/40 items-center justify-center">
                <ArrowLeft size={20} color="#fff" />
              </TouchableOpacity>
              <View className="flex-row">
                <TouchableOpacity className="w-10 h-10 rounded-full bg-black/40 items-center justify-center mr-2">
                  <Share2 size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => toggleFavorite.mutate(caterer.id)}
                  className="w-10 h-10 rounded-full bg-black/40 items-center justify-center"
                >
                  <Heart size={18} color="#fff" fill={isFavorite ? '#fff' : 'transparent'} />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Info Header */}
        <View className="px-4 pt-4 pb-3">
          <View className="flex-row items-center mb-1">
            <Text variant="h2" weight="bold" className="flex-1">{caterer.name}</Text>
            {caterer.is_verified && <BadgeCheck size={20} color="#3B82F6" />}
          </View>
          <View className="flex-row items-center mb-2">
            <RatingDisplay rating={caterer.rating_avg} count={caterer.rating_count} size={16} />
            <Text variant="body-sm" className="text-neutral-500 mx-2">|</Text>
            <Text variant="body-sm" className="text-neutral-600">{caterer.city}</Text>
          </View>
          <View className="flex-row flex-wrap gap-1 mb-3">
            {caterer.is_pure_veg && <Badge label="Pure Veg" variant="pureveg" />}
            {caterer.cuisines.map((c) => <Badge key={c} label={c} />)}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-4">
            <Button
              title="Book Now"
              onPress={() => router.push({ pathname: '/(stack)/booking/new', params: { catererId: caterer.id } })}
              className="flex-1"
            />
            <Button
              title="Message"
              variant="outline"
              icon={<MessageCircle size={16} color={COLORS.primary} />}
              onPress={() => {}}
              className="flex-1"
            />
          </View>
        </View>

        {/* Tab Selector */}
        <View className="flex-row mx-4 bg-neutral-100 rounded-card p-1 mb-4">
          {(['menu', 'reviews', 'info'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-button items-center ${activeTab === tab ? 'bg-white shadow-sm' : ''}`}
            >
              <Text
                variant="body-sm"
                weight={activeTab === tab ? 'semibold' : 'regular'}
                className={activeTab === tab ? 'text-primary' : 'text-neutral-500'}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View className="px-4 pb-8">
          {activeTab === 'menu' && menuData && (
            <View>
              {menuData.categories.map((category) => (
                <View key={category.id} className="mb-4">
                  <TouchableOpacity
                    onPress={() => toggleCategory(category.id)}
                    className="flex-row items-center justify-between py-2 border-b border-neutral-100"
                  >
                    <Text variant="body" weight="semibold">{category.name}</Text>
                    <Text variant="caption" className="text-neutral-500">
                      {category.items.length} items {expandedCategories.has(category.id) ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>
                  {(expandedCategories.has(category.id) || expandedCategories.size === 0) &&
                    category.items.map((item) => (
                      <View key={item.id} className="flex-row items-center py-3 border-b border-neutral-50">
                        <VegIndicator isVeg={item.is_veg} />
                        <View className="flex-1 ml-3">
                          <Text variant="body-sm" weight="medium">{item.name}</Text>
                          {item.description && (
                            <Text variant="caption" className="text-neutral-500 mt-0.5">{item.description}</Text>
                          )}
                          {item.is_popular && (
                            <Text variant="caption" weight="semibold" className="text-primary mt-0.5">Popular</Text>
                          )}
                        </View>
                        <Text variant="body-sm" weight="semibold">{formatCurrency(item.price)}</Text>
                      </View>
                    ))}
                </View>
              ))}
            </View>
          )}

          {activeTab === 'reviews' && (
            <View>
              {/* Rating Summary */}
              <Card className="p-4 mb-4">
                <View className="flex-row items-center mb-3">
                  <Text variant="h1" weight="bold" className="mr-2">{caterer.rating_avg.toFixed(1)}</Text>
                  <View>
                    <RatingDisplay rating={caterer.rating_avg} size={18} />
                    <Text variant="caption" className="text-neutral-500">{caterer.rating_count} reviews</Text>
                  </View>
                </View>
              </Card>

              {reviews && reviews.length > 0 ? (
                reviews.map((review) => (
                  <Card key={review.id} variant="outlined" className="p-4 mb-3">
                    <View className="flex-row items-center mb-2">
                      <RatingDisplay rating={review.overall_rating} size={14} />
                      <Text variant="caption" className="text-neutral-400 ml-auto">
                        {new Date(review.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    {review.text && (
                      <Text variant="body-sm" className="text-neutral-700">{review.text}</Text>
                    )}
                    <View className="flex-row mt-2 flex-wrap gap-2">
                      {[
                        { label: 'Taste', value: review.taste_rating },
                        { label: 'Service', value: review.service_rating },
                        { label: 'Value', value: review.value_rating },
                        { label: 'Cleanliness', value: review.cleanliness_rating },
                      ].map((cat) => (
                        <Text key={cat.label} variant="caption" className="text-neutral-500">
                          {cat.label}: {cat.value}/5
                        </Text>
                      ))}
                    </View>
                  </Card>
                ))
              ) : (
                <Text variant="body-sm" className="text-neutral-500 text-center py-8">No reviews yet</Text>
              )}
            </View>
          )}

          {activeTab === 'info' && (
            <View>
              <Card variant="outlined" className="p-4 mb-4">
                <Text variant="body" weight="semibold" className="mb-2">About</Text>
                <Text variant="body-sm" className="text-neutral-600 leading-5">{caterer.description}</Text>
              </Card>

              <Card variant="outlined" className="p-4 mb-4">
                <Text variant="body" weight="semibold" className="mb-3">Details</Text>
                <View className="flex-row items-center mb-2">
                  <Clock size={16} color={COLORS.neutral500} />
                  <Text variant="body-sm" className="text-neutral-600 ml-2">
                    Responds within {caterer.response_time_hours} hours
                  </Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Users size={16} color={COLORS.neutral500} />
                  <Text variant="body-sm" className="text-neutral-600 ml-2">
                    {caterer.min_guests} - {caterer.max_guests} guests
                  </Text>
                </View>
              </Card>

              <Card variant="outlined" className="p-4 mb-4">
                <Text variant="body" weight="semibold" className="mb-3">Pricing</Text>
                <View className="flex-row justify-between mb-2">
                  <Text variant="body-sm" className="text-neutral-600">Price per plate</Text>
                  <Text variant="body-sm" weight="medium">
                    {formatCurrency(caterer.min_price_per_plate)} - {formatCurrency(caterer.max_price_per_plate)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text variant="body-sm" className="text-neutral-600">Staff charge</Text>
                  <Text variant="body-sm" weight="medium">{formatCurrency(caterer.staff_charge_per_plate)}/plate</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text variant="body-sm" className="text-neutral-600">Setup charge</Text>
                  <Text variant="body-sm" weight="medium">{formatCurrency(caterer.setup_charge)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text variant="body-sm" className="text-neutral-600">Delivery charge</Text>
                  <Text variant="body-sm" weight="medium">{formatCurrency(caterer.delivery_charge)}</Text>
                </View>
              </Card>

              {caterer.specialties.length > 0 && (
                <Card variant="outlined" className="p-4">
                  <Text variant="body" weight="semibold" className="mb-3">Specialties</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {caterer.specialties.map((s) => (
                      <Badge key={s} label={s} />
                    ))}
                  </View>
                </Card>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

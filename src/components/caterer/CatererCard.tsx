import { TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { MapPin, Heart, BadgeCheck } from 'lucide-react-native';
import { Text, Card, Badge, RatingDisplay } from '../ui';
import { Caterer } from '../../types/database';
import { formatCurrency } from '../../utils/formatters';
import { COLORS } from '../../utils/constants';
import { useIsFavorite, useToggleFavorite } from '../../hooks/useFavorites';

interface CatererCardProps {
  caterer: Caterer;
  variant?: 'vertical' | 'horizontal';
}

export function CatererCard({ caterer, variant = 'vertical' }: CatererCardProps) {
  const router = useRouter();
  const isFavorite = useIsFavorite(caterer.id);
  const toggleFavorite = useToggleFavorite();

  const handlePress = () => {
    router.push({ pathname: '/(stack)/caterer/[id]', params: { id: caterer.id } });
  };

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <Card className="w-64 mr-4 overflow-hidden">
          <Image
            source={{ uri: caterer.cover_image_url }}
            style={{ width: '100%', height: 140 }}
            contentFit="cover"
            placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
            transition={300}
          />
          <View className="p-3">
            <View className="flex-row items-center mb-1">
              <Text variant="body-sm" weight="semibold" className="flex-1" numberOfLines={1}>
                {caterer.name}
              </Text>
              {caterer.is_verified && (
                <BadgeCheck size={16} color="#3B82F6" />
              )}
            </View>
            <View className="flex-row items-center mb-2">
              <RatingDisplay rating={caterer.rating_avg} count={caterer.rating_count} size={12} />
              <Text variant="caption" className="text-neutral-500 ml-2">
                {caterer.city}
              </Text>
            </View>
            <Text variant="caption" weight="medium" className="text-primary">
              From {formatCurrency(caterer.min_price_per_plate)}/plate
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <Card className="mb-4 overflow-hidden">
        <View>
          <Image
            source={{ uri: caterer.cover_image_url }}
            style={{ width: '100%', height: 180 }}
            contentFit="cover"
            placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
            transition={300}
          />
          {/* Favorite button */}
          <TouchableOpacity
            onPress={() => toggleFavorite.mutate(caterer.id)}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 items-center justify-center"
          >
            <Heart
              size={18}
              color={isFavorite ? COLORS.primary : COLORS.neutral600}
              fill={isFavorite ? COLORS.primary : 'transparent'}
            />
          </TouchableOpacity>
          {caterer.is_pure_veg && (
            <View className="absolute top-3 left-3">
              <Badge label="Pure Veg" variant="pureveg" />
            </View>
          )}
        </View>
        <View className="p-4">
          <View className="flex-row items-center mb-1">
            <Text variant="body" weight="semibold" className="flex-1" numberOfLines={1}>
              {caterer.name}
            </Text>
            {caterer.is_verified && (
              <View className="flex-row items-center ml-2">
                <BadgeCheck size={16} color="#3B82F6" />
                <Text variant="caption" className="text-blue-600 ml-0.5">Verified</Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center mb-2">
            <RatingDisplay rating={caterer.rating_avg} count={caterer.rating_count} size={14} />
            <View className="flex-row items-center ml-3">
              <MapPin size={12} color={COLORS.neutral500} />
              <Text variant="caption" className="text-neutral-500 ml-1">
                {caterer.city}
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-1 mb-3">
            {caterer.cuisines.slice(0, 3).map((cuisine) => (
              <Badge key={cuisine} label={cuisine} />
            ))}
          </View>

          <View className="flex-row items-center justify-between">
            <Text variant="body-sm" weight="semibold" className="text-primary">
              {formatCurrency(caterer.min_price_per_plate)} - {formatCurrency(caterer.max_price_per_plate)}/plate
            </Text>
            <Text variant="caption" className="text-neutral-500">
              {caterer.min_guests}-{caterer.max_guests} guests
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

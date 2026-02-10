import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Text, Card, EmptyState } from '@/src/components/ui';
import { useConversations } from '@/src/hooks/useMessages';
import { formatRelativeTime } from '@/src/utils/formatters';
import { COLORS } from '@/src/utils/constants';

export default function MessagesScreen() {
  const router = useRouter();
  const { data: conversations, refetch } = useConversations();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-4 pt-4 pb-4">
        <Text variant="h2" weight="bold">Messages</Text>
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={COLORS.primary} />}
      >
        {!conversations || conversations.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={48} color={COLORS.neutral300} />}
            title="No messages yet"
            description="Start a conversation with a caterer when you book an event."
          />
        ) : (
          conversations.map((conv) => (
            <TouchableOpacity
              key={conv.id}
              onPress={() => router.push({ pathname: '/(stack)/booking/[id]/chat', params: { id: conv.booking_id, conversationId: conv.id, catererId: conv.caterer_id } })}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center py-4 border-b border-neutral-100">
                <Image
                  source={{ uri: conv.caterer?.logo_url }}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                  contentFit="cover"
                />
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center justify-between">
                    <Text variant="body-sm" weight="semibold" numberOfLines={1} className="flex-1">
                      {conv.caterer?.name || 'Caterer'}
                    </Text>
                    {conv.last_message_at && (
                      <Text variant="caption" className="text-neutral-400">
                        {formatRelativeTime(conv.last_message_at)}
                      </Text>
                    )}
                  </View>
                  <View className="flex-row items-center mt-0.5">
                    <Text variant="body-sm" className="text-neutral-500 flex-1" numberOfLines={1}>
                      {conv.last_message || 'No messages yet'}
                    </Text>
                    {conv.user_unread_count > 0 && (
                      <View className="bg-primary rounded-full w-5 h-5 items-center justify-center ml-2">
                        <Text variant="caption" weight="bold" className="text-white">
                          {conv.user_unread_count}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

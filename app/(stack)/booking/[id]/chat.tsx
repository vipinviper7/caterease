import { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Send } from 'lucide-react-native';
import { Text, Chip } from '@/src/components/ui';
import { useMessages, useSendMessage, useCreateConversation } from '@/src/hooks/useMessages';
import { QUICK_REPLIES, COLORS } from '@/src/utils/constants';
import { formatRelativeTime } from '@/src/utils/formatters';

export default function ChatScreen() {
  const { id, conversationId: existingConvId, catererId } = useLocalSearchParams<{
    id: string; conversationId?: string; catererId: string;
  }>();
  const [message, setMessage] = useState('');
  const [convId, setConvId] = useState(existingConvId || '');
  const scrollRef = useRef<ScrollView>(null);

  const createConversation = useCreateConversation();
  const { data: messages, refetch } = useMessages(convId);
  const sendMessage = useSendMessage();

  useEffect(() => {
    if (!convId && catererId) {
      createConversation.mutateAsync({ catererId, bookingId: id }).then((conv) => {
        setConvId(conv.id);
      });
    }
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = text || message.trim();
    if (!content || !convId) return;
    setMessage('');
    await sendMessage.mutateAsync({ conversationId: convId, content });
    refetch();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-4 pt-4"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages?.map((msg) => (
          <View
            key={msg.id}
            className={`mb-3 max-w-[80%] ${
              msg.sender_type === 'user' ? 'self-end' :
              msg.sender_type === 'system' ? 'self-center' : 'self-start'
            }`}
          >
            <View className={`px-4 py-3 rounded-2xl ${
              msg.sender_type === 'user' ? 'bg-primary rounded-br-sm' :
              msg.sender_type === 'system' ? 'bg-neutral-100 rounded-lg' :
              'bg-neutral-100 rounded-bl-sm'
            }`}>
              <Text
                variant="body-sm"
                className={msg.sender_type === 'user' ? 'text-white' :
                  msg.sender_type === 'system' ? 'text-neutral-500 text-center' : 'text-neutral-800'}
              >
                {msg.content}
              </Text>
            </View>
            <Text variant="caption" className={`text-neutral-400 mt-1 ${msg.sender_type === 'user' ? 'text-right' : ''}`}>
              {formatRelativeTime(msg.created_at)}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Quick Replies */}
      {(!messages || messages.length <= 1) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        >
          {QUICK_REPLIES.map((reply) => (
            <Chip
              key={reply}
              label={reply}
              onPress={() => handleSend(reply)}
              className="mr-2"
            />
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <View className="flex-row items-end px-4 py-3 border-t border-neutral-100">
        <TextInput
          className="flex-1 bg-neutral-100 rounded-card px-4 py-3 font-jakarta text-base max-h-24"
          placeholder="Type a message..."
          placeholderTextColor={COLORS.neutral400}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity
          onPress={() => handleSend()}
          disabled={!message.trim()}
          className={`ml-3 w-11 h-11 rounded-full items-center justify-center ${
            message.trim() ? 'bg-primary' : 'bg-neutral-200'
          }`}
        >
          <Send size={18} color={message.trim() ? '#fff' : COLORS.neutral400} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

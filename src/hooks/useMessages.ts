import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { Conversation, Message } from '../types/database';
import caterersJson from '../data/caterers.json';
import { Caterer } from '../types/database';

const useLocalFallback = !process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co';

let localConversations: Conversation[] = [];
let localMessages: Message[] = [];

const CATERER_REPLIES = [
  'Thank you for reaching out! We would be happy to help.',
  'That sounds great! Let me check and get back to you.',
  'Yes, we can definitely arrange that for your event.',
  'Our team will coordinate with you on the details.',
  'We offer customized packages. Let us discuss your requirements.',
];

export function useConversations() {
  const { session } = useAuthStore();

  return useQuery({
    queryKey: ['conversations', session?.user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      if (useLocalFallback) {
        return localConversations.map(c => ({
          ...c,
          caterer: (caterersJson as unknown as Caterer[]).find(cat => cat.id === c.caterer_id),
        }));
      }

      const { data, error } = await supabase
        .from('conversations')
        .select('*, caterer:caterers(*)')
        .eq('user_id', session!.user.id)
        .order('last_message_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Conversation[];
    },
    enabled: useLocalFallback || !!session,
  });
}

export function useMessages(conversationId: string) {
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async (): Promise<Message[]> => {
      if (useLocalFallback) {
        return localMessages.filter(m => m.conversation_id === conversationId);
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as Message[];
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (useLocalFallback || !conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setRealtimeMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  const allMessages = [...(query.data || []), ...realtimeMessages];

  return { ...query, data: allMessages };
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { session } = useAuthStore();

  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      if (useLocalFallback) {
        const msg: Message = {
          id: `msg-${Date.now()}`,
          conversation_id: conversationId,
          sender_type: 'user',
          content,
          created_at: new Date().toISOString(),
        };
        localMessages.push(msg);

        // Update conversation
        const conv = localConversations.find(c => c.id === conversationId);
        if (conv) {
          conv.last_message = content;
          conv.last_message_at = msg.created_at;
        }

        // Simulate caterer auto-reply after 2 seconds
        setTimeout(() => {
          const reply: Message = {
            id: `msg-${Date.now()}-reply`,
            conversation_id: conversationId,
            sender_type: 'caterer',
            content: CATERER_REPLIES[Math.floor(Math.random() * CATERER_REPLIES.length)],
            created_at: new Date().toISOString(),
          };
          localMessages.push(reply);
          if (conv) {
            conv.last_message = reply.content;
            conv.last_message_at = reply.created_at;
          }
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }, 2000);

        return msg;
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'user',
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation last message
      await supabase
        .from('conversations')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      return data as Message;
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { session } = useAuthStore();

  return useMutation({
    mutationFn: async ({ catererId, bookingId }: { catererId: string; bookingId: string }) => {
      if (useLocalFallback) {
        // Check if conversation already exists
        const existing = localConversations.find(
          c => c.caterer_id === catererId && c.booking_id === bookingId
        );
        if (existing) return existing;

        const conv: Conversation = {
          id: `conv-${Date.now()}`,
          booking_id: bookingId,
          user_id: session?.user?.id || 'local-user',
          caterer_id: catererId,
          last_message: null,
          last_message_at: null,
          user_unread_count: 0,
          caterer_unread_count: 0,
          created_at: new Date().toISOString(),
        };
        localConversations.push(conv);

        // Add system message
        const systemMsg: Message = {
          id: `msg-${Date.now()}-sys`,
          conversation_id: conv.id,
          sender_type: 'system',
          content: 'Conversation started. You can discuss event details here.',
          created_at: new Date().toISOString(),
        };
        localMessages.push(systemMsg);

        return conv;
      }

      // Check existing
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('caterer_id', catererId)
        .eq('booking_id', bookingId)
        .eq('user_id', session!.user.id)
        .single();

      if (existing) return existing as Conversation;

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          booking_id: bookingId,
          user_id: session!.user.id,
          caterer_id: catererId,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

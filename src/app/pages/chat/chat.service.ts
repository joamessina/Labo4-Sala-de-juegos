import { Injectable, NgZone } from '@angular/core';
import {
  RealtimeChannel,
  RealtimePostgresInsertPayload,
} from '@supabase/supabase-js';
import { SupabaseService } from '../../../supabase/supabase.service';

export type ChatMessage = {
  id: number;
  user_id: string;
  email: string;
  text: string;
  created_at: string;
};

@Injectable({ providedIn: 'root' })
export class ChatService {
  private channel?: RealtimeChannel;

  constructor(private zone: NgZone, private sb: SupabaseService) {}

  async fetchLast(limit = 80): Promise<ChatMessage[]> {
    const { data, error } = await this.sb.client
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as ChatMessage[];
  }

  async send(user_id: string, email: string, text: string) {
    const { data, error } = await this.sb.client
      .from('chat_messages')
      .insert([{ user_id, email, text }])
      .select()
      .single();
    if (error) throw error;
    return data as ChatMessage;
  }

  subscribe(onInsert: (msg: ChatMessage) => void) {
    this.unsubscribe();
    this.channel = this.sb.client
      .channel('chat-global')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload: RealtimePostgresInsertPayload<ChatMessage>) => {
          console.log('[RT] payload', payload.new);
          this.zone.run(() => onInsert(payload.new));
        }
      )
      .subscribe((status, err) => {
        console.log('[Realtime] status:', status, 'err:', err ?? '');
      });
  }

  unsubscribe() {
    if (this.channel) {
      this.sb.client.removeChannel(this.channel);
      this.channel = undefined;
    }
  }
}

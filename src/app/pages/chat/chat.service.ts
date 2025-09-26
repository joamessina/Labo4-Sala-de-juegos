import { Injectable, NgZone, inject } from '@angular/core';
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
  private zone = inject(NgZone);

  constructor(private sb: SupabaseService) {}

  async fetchLast(limit = 80): Promise<ChatMessage[]> {
    const { data, error } = await this.sb.client
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as ChatMessage[];
  }

  async fetchSince(isoTs: string): Promise<ChatMessage[]> {
    const { data, error } = await this.sb.client
      .from('chat_messages')
      .select('*')
      .gt('created_at', isoTs)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []) as ChatMessage[];
  }

  async send(user_id: string, email: string, text: string) {
    const { data, error } = await this.sb.client
      .from('chat_messages')
      .insert([{ user_id, email, text }])
      .select('*')
      .single();

    if (error) throw error;
    return data as ChatMessage;
  }

  subscribe(onEvent: (msg: ChatMessage | null, status?: string) => void) {
    this.unsubscribe();

    this.channel = this.sb.client
      .channel('realtime:public:chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload: RealtimePostgresInsertPayload<ChatMessage>) => {
          this.zone.run(() => onEvent(payload.new as ChatMessage));
        }
      )
      .subscribe((status, err) => {
        console.log('[Realtime] status:', status, 'err:', err ?? '');
        this.zone.run(() => onEvent(null, status));
      });
  }

  unsubscribe() {
    if (this.channel) {
      this.sb.client.removeChannel(this.channel);
      this.channel = undefined;
    }
  }
}

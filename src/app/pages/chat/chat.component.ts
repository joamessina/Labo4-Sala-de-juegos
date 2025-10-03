import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  effect,
  DestroyRef,
  inject,
  Injector,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage, ChatService } from './chat.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('listEnd') listEnd!: ElementRef<HTMLDivElement>;
  @ViewChild('scrollBody') scrollBody!: ElementRef<HTMLDivElement>;
  @ViewChild('msgInput') msgInput!: ElementRef<HTMLInputElement>;

  msgs: ChatMessage[] = [];
  text = '';
  sending = false;
  meEmail = '';
  MAX_LEN = 255;
  submitted = false;

  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);

  constructor(private chat: ChatService, private auth: AuthService) {
    effect(
      () => {
        const u = this.auth.user();

        this.chat.unsubscribe();
        this.msgs = [];

        if (!u) {
          this.meEmail = '';
          return;
        }

        this.meEmail = u.email!;
        this.initRealtime();
      },
      { injector: this.injector }
    );
  }

  async ngOnInit() {}

  ngOnDestroy() {
    this.chat.unsubscribe();
  }

  ngAfterViewInit() {
    this.scrollToBottom(true);
  }

  private lastTs: string | null = null;

  private setMsgs(list: ChatMessage[]) {
    this.msgs = list;
    this.lastTs = list.length ? list[list.length - 1].created_at : null;
  }

  private async initRealtime() {
    try {
      const hist = await this.chat.fetchLast(80);
      this.setMsgs(hist);
      this.scrollToBottom(true);

      this.chat.subscribe(async (msg, status) => {
        if (status === 'SUBSCRIBED') {
          if (this.lastTs) {
            try {
              const missed = await this.chat.fetchSince(this.lastTs);
              if (missed.length) {
                const merged = [...this.msgs];
                for (const m of missed) {
                  if (!merged.some((x) => x.id === m.id)) merged.push(m);
                }
                this.setMsgs(merged);
                this.scrollToBottom(true);
              }
            } catch (e) {
              console.warn('[Chat] backfill error:', e);
            }
          }
          return;
        }

        if (msg) {
          if (!this.msgs.some((m) => m.id === msg.id)) {
            this.setMsgs([...this.msgs, msg]);
            this.scrollToBottom(true);
          }
        }
      });
    } catch (e) {
      console.error('[Chat] initRealtime error', e);
    }
  }

  async send() {
    this.submitted = true;

    const trimmed = (this.text ?? '').trim();
    const u = this.auth.user();

    if (!trimmed || this.sending || !u) {
      setTimeout(() => this.msgInput?.nativeElement?.focus(), 0);
      return;
    }

    this.submitted = false;

    const MAX = 255;
    const safe = trimmed.length > MAX ? trimmed.slice(0, MAX) : trimmed;

    this.sending = true;
    try {
      const created = await this.chat.send(u.id, u.email!, safe);
      if (!this.msgs.some((m) => m.id === created.id)) {
        this.setMsgs([...this.msgs, created]);
        this.scrollToBottom(true);
      }
      this.text = '';
    } finally {
      this.sending = false;
    }
  }

  isMine(m: ChatMessage) {
    return m.email === this.meEmail;
  }
  trackById(_: number, m: ChatMessage) {
    return m.id;
  }

  formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  }

  private scrollLock = false;

  private scrollToBottom(force = false) {
    if (this.scrollLock) return;
    this.scrollLock = true;

    const body = this.scrollBody?.nativeElement;
    const end = this.listEnd?.nativeElement;
    if (!body) {
      this.scrollLock = false;
      return;
    }

    const nearBottom =
      body.scrollTop + body.clientHeight >= body.scrollHeight - 24;

    if (!force && !nearBottom) {
      this.scrollLock = false;
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        body.scrollTo({
          top: body.scrollHeight,
          behavior: force ? 'auto' : 'smooth',
        });

        body.scrollTop = Math.max(0, body.scrollHeight - body.clientHeight);

        end?.scrollIntoView({ block: 'end' });

        setTimeout(() => {
          body.scrollTop = body.scrollHeight;
          this.scrollLock = false;
        }, 0);
      });
    });
  }
}

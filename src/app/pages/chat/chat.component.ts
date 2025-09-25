import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  effect,
  DestroyRef,
  inject,
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

  msgs: ChatMessage[] = [];
  text = '';
  sending = false;
  meEmail = '';

  private destroyRef = inject(DestroyRef);

  constructor(private chat: ChatService, private auth: AuthService) {
    effect(() => {
      const u = this.auth.user();

      this.chat.unsubscribe();
      this.msgs = [];

      if (!u) {
        this.meEmail = '';
        return;
      }

      this.meEmail = u.email!;
      this.initRealtime();
    });
  }

  async ngOnInit() {}

  ngOnDestroy() {
    this.chat.unsubscribe();
  }

  ngAfterViewInit() {
    this.scrollToBottom(true);
  }

  private async initRealtime() {
    try {
      this.msgs = await this.chat.fetchLast(80);
      this.scrollToBottom(true);

      this.chat.subscribe((msg) => {
        if (!this.msgs.some((m) => m.id === msg.id)) {
          this.msgs = [...this.msgs, msg];
          this.scrollToBottom(true);
        }
      });
    } catch (e) {
      console.error('[Chat] initRealtime error', e);
    }
  }

  async send() {
    const trimmed = this.text.trim();
    const u = this.auth.user();
    if (!trimmed || this.sending || !u) return;

    this.sending = true;
    try {
      const created = await this.chat.send(u.id, u.email!, trimmed);

      if (!this.msgs.some((m) => m.id === created.id)) {
        this.msgs = [...this.msgs, created];
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

  private scrollToBottom(force = false) {
    // Usamos rAF para asegurarnos que las burbujas ya renderizaron
    requestAnimationFrame(() => {
      const body = this.scrollBody?.nativeElement;
      if (!body) return;

      // Método más confiable: setear scrollTop al final
      body.scrollTop = body.scrollHeight;

      // “Ancla” extra por si el navegador necesita ayuda
      this.listEnd?.nativeElement?.scrollIntoView({
        block: 'end',
        behavior: force ? 'auto' : 'smooth',
      });
    });
  }
}

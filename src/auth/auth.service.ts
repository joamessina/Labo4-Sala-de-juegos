// src/app/auth/auth.service.ts
import { Injectable, signal, computed } from '@angular/core';
import {
  SupabaseClient,
  Session,
  AuthChangeEvent,
  User,
} from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';

export type SessionUser = { id: string; email: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supa: SupabaseClient;

  private _user = signal<SessionUser | null>(null);
  user = this._user;
  isLoggedIn = computed(() => !!this._user());

  constructor(private sb: SupabaseService) {
    // ✅ usar SIEMPRE el cliente compartido
    this.supa = sb.client;

    // Estado inicial
    this.supa.auth.getSession().then(({ data }) => {
      const u = data.session?.user as User | null;
      this._user.set(u ? { id: u.id, email: u.email! } : null);
    });

    // Cambios de sesión
    this.supa.auth.onAuthStateChange(
      (_e: AuthChangeEvent, session: Session | null) => {
        const u = session?.user as User | null;
        this._user.set(u ? { id: u.id, email: u.email! } : null);
      }
    );
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supa.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    const u = data.user;
    this._user.set(u ? { id: u.id, email: u.email! } : null);
    return data;
  }

  async register(email: string, password: string, displayName?: string) {
    const { data, error } = await this.supa.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName ?? '' } },
    });
    if (error) throw error;
    if (!data.session) {
      const li = await this.supa.auth.signInWithPassword({ email, password });
      if (li.error) throw li.error;
    }
    return data;
  }

  async logout() {
    const { error } = await this.supa.auth.signOut();
    if (error) throw error;
    this._user.set(null);
  }

  getSession() {
    return this.supa.auth.getSession();
  }
  insertLoginLog(email: string) {
    return this.supa.from('login_logs').insert({ email });
  }
}

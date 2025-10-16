import { Injectable, signal, computed } from '@angular/core';
import {
  SupabaseClient,
  Session,
  AuthChangeEvent,
  User,
} from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersService } from '../app/users/users.service';

export type SessionUser = { id: string; email: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supa: SupabaseClient;

  private _user = signal<SessionUser | null>(null);
  user = this._user;
  isLoggedIn = computed(() => !!this._user());

  private _role = signal<string | null>(null);
  role = this._role;
  isAdmin = computed(() => this._role() === 'admin');

  constructor(private sb: SupabaseService, private users: UsersService) {
    this.supa = sb.client;
    this.supa.auth.getSession().then(({ data }) => {
      const u = data.session?.user as User | null;
      this._user.set(u ? { id: u.id, email: u.email! } : null);
      if (u?.email) this.users.getRoleByEmail(u.email);
    });

    this.supa.auth.onAuthStateChange((_e, session) => {
      const u = session?.user as User | null;
      this._user.set(u ? { id: u.id, email: u.email! } : null);
      if (u?.email) this.users.getRoleByEmail(u.email);
    });
  }

  async refreshRole(email?: string) {
    const em = email ?? this._user()?.email;
    if (!em) {
      this._role.set(null);
      return;
    }
    const { data, error } = await this.supa
      .from('users')
      .select('rol')
      .eq('email', em)
      .maybeSingle();

    if (error) {
      console.warn('[Auth] refreshRole error', error);
      this._role.set(null);
      return;
    }
    this._role.set(data?.rol ?? null);
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supa.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    const u = data.user;
    this._user.set(u ? { id: u.id, email: u.email! } : null);
    await this.users.getRoleByEmail(u?.email ?? email);
    return data;
  }

  async register(email: string, password: string, displayName?: string) {
    const { data, error } = await this.supa.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName ?? '' } },
    });
    if (error) throw error;

    await this.users.ensureUserRow(email, displayName ?? '');

    if (!data.session) {
      const li = await this.supa.auth.signInWithPassword({ email, password });
      if (li.error) throw li.error;
    }
    await this.users.getRoleByEmail(email);
    return data;
  }

  async logout() {
    try {
      await this.supa.auth.signOut({ scope: 'local' });
    } catch {
    } finally {
      this._user.set(null);
      this.users.role.set(null);
    }
  }

  getSession() {
    return this.supa.auth.getSession();
  }

  insertLoginLog(email: string) {
    return this.supa.from('login_logs').insert({ email });
  }
}

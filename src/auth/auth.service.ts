import { Injectable } from '@angular/core';
import {
  createClient,
  SupabaseClient,
  Session,
  AuthChangeEvent,
} from '@supabase/supabase-js';
import { environment } from '../enviroments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supa: SupabaseClient;
  private _session: Session | null = null;

  constructor() {
    this.supa = createClient(
      environment.supabase.url,
      environment.supabase.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );

    this.supa.auth.getSession().then(({ data }) => {
      this._session = data.session ?? null;
    });
    this.supa.auth.onAuthStateChange((_event: AuthChangeEvent, session) => {
      this._session = session ?? null;
    });
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supa.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
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
  }

  get user() {
    return this._session?.user ?? null;
  }

  getSession() {
    return this.supa.auth.getSession();
  }

  insertLoginLog(email: string) {
    return this.supa.from('login_logs').insert({ email });
  }
}

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../enviroments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supa: SupabaseClient;

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
    return data;
  }

  async logout() {
    const { error } = await this.supa.auth.signOut();
    if (error) throw error;
  }

  getSession() {
    return this.supa.auth.getSession();
  }
}

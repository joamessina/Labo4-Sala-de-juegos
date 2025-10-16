// src/app/users/users.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private sb: any;

  constructor(private supa: SupabaseService) {
    this.sb = this.supa.client;
  }

  private _role = signal<string | null>(null);
  role = this._role;
  isAdmin = computed(() => this._role() === 'admin');

  async getRoleByEmail(
    email: string | null | undefined
  ): Promise<string | null> {
    if (!email) {
      this._role.set(null);
      return null;
    }

    const { data, error } = await this.sb
      .from('users')
      .select('rol')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.warn('[UsersService] getRoleByEmail error', error);
      this._role.set(null);
      return null;
    }

    const rol = data?.rol ?? null;
    this._role.set(rol);
    return rol;
  }

  async ensureUserRow(email: string, name = '') {
    const { error } = await this.sb
      .from('users')
      .upsert({ email, name, rol: 'user' }, { onConflict: 'email' });
    if (error) console.error('[UsersService] ensureUserRow', error);
  }
}

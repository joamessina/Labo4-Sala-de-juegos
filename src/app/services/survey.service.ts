import { Injectable } from '@angular/core';
import { SupabaseService } from '../../supabase/supabase.service';

export type Survey = {
  user?: string;
  user_id?: string;
  game: string;
  name: string;
  surname: string;
  age: number;
  phone: string;
  commentary: string;
  valueRange: string;
  recommendCheck: boolean;
};

@Injectable({ providedIn: 'root' })
export class EncuestaService {
  private table = 'encuestas';
  constructor(private sb: SupabaseService) {}

  async submit(s: Survey) {
    const { error } = await this.sb.client.from(this.table).insert({
      user_id: s.user_id ?? null,
      email: s.user ?? '',
      game: s.game,
      name: s.name,
      surname: s.surname,
      age: s.age,
      phone: s.phone,
      value_range: s.valueRange,
      recommend: s.recommendCheck,
      commentary: s.commentary,
    });
    if (error) throw error;
  }
}

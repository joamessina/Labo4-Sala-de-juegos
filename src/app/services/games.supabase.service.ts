import { Injectable } from '@angular/core';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable({ providedIn: 'root' })
export class GamesService {
  userPoints: Record<string, number> = {};

  constructor(private sb: SupabaseService) {}

  // lee el mejor puntaje del usuario para ese juego
  async getPointsByGame(game: string) {
    const { data, error } = await this.sb.client
      .from('game_scores')
      .select('points')
      .eq('game', game)
      .order('points', { ascending: false })
      .limit(1);

    if (error) {
      console.error('[game_scores] getPoints error', error);
      this.userPoints[game] = 0;
      return 0;
    }
    const best = data?.[0]?.points ?? 0;
    this.userPoints[game] = best;
    return best;
  }

  // upsert si el nuevo puntaje es mejor
  async setGameInfo(game: string, points: number) {
    // quién soy
    const sess = await this.sb.client.auth.getUser();
    const user = sess.data.user;
    if (!user) throw new Error('No hay sesión');

    // traigo el mejor actual
    await this.getPointsByGame(game);
    const best = this.userPoints[game] ?? 0;
    if (points <= best) return; // no supera, no guardo

    const row = {
      user_id: user.id,
      email: user.email!,
      game,
      points,
      updated_at: new Date().toISOString(),
    };

    // estrategia simple: inserto siempre (quedan múltiples filas) o…
    // …si preferís UNA por (user,game), agregá unique index y hacé upsert.
    // Aquí hacemos upsert con llave (user_id, game)
    const { error } = await this.sb.client
      .from('game_scores')
      .upsert(row, { onConflict: 'user_id,game' });

    if (error) {
      console.error('[game_scores] upsert error', error);
      throw error;
    }
    this.userPoints[game] = points;
  }

  // (opcional) ranking del juego
  async getLeaderboard(game: string, limit = 20) {
    const { data, error } = await this.sb.client
      .from('game_scores')
      .select('email, points, updated_at')
      .eq('game', game)
      .order('points', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  }
}

import { Injectable } from '@angular/core';
import { SupabaseService } from '../../supabase/supabase.service';
import { Resultados } from '../pages/interfaces/resultados.interface';

@Injectable({ providedIn: 'root' })
export class ResultadosService {
  private tabla = 'resultados';
  constructor(private sb: SupabaseService) {}

  async registrarResultado(
    usuario: string,
    puntaje: number,
    juego: string
  ): Promise<void> {
    const { error } = await this.sb.client.from(this.tabla).insert({
      usuario,
      puntaje,
      juego,
      fecha: new Date().toISOString(),
    });
    if (error) throw error;
  }

  async devolverResultados(limit = 10): Promise<Resultados[]> {
    const { data, error } = await this.sb.client
      .from(this.tabla)
      .select('*')
      .order('puntaje', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({ ...r, fecha: new Date(r.fecha) }));
  }

  async devolverResultadosPorUsuario(email: string, limit = 50) {
    const { data, error } = await this.sb.client
      .from(this.tabla)
      .select('*')
      .eq('usuario', email)
      .order('fecha', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({ ...r, fecha: new Date(r.fecha) }));
  }

  async devolverResultadosPorJuego(juego: string, limit = 50) {
    const { data, error } = await this.sb.client
      .from(this.tabla)
      .select('*')
      .eq('juego', juego)
      .order('fecha', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({ ...r, fecha: new Date(r.fecha) }));
  }
}

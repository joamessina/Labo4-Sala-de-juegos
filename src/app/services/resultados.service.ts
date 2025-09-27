import { Injectable } from '@angular/core';
import { SupabaseService } from '../../supabase/supabase.service';
import { Resultados } from '../pages/interfaces/resultados.interface';

@Injectable({
  providedIn: 'root',
})
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

    return (data ?? []).map((r: any) => ({
      ...r,
      fecha: r.fecha ? new Date(r.fecha) : new Date(),
    })) as Resultados[];
  }
}

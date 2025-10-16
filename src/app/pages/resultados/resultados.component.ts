import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/auth.service';
import { SupabaseService } from '../../../supabase/supabase.service';

type Resultado = {
  id: number;
  usuario: string;
  juego: string;
  puntaje: number;
  fecha: Date;
};

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.scss'],
})
export class ResultadosComponent {
  private sb = inject(SupabaseService);
  private auth = inject(AuthService);

  loading = true;
  items: Resultado[] = [];
  err = '';

  async ngOnInit() {
    const u = this.auth.user();
    if (!u?.email) {
      this.err = 'Tenés que iniciar sesión.';
      this.loading = false;
      return;
    }

    try {
      const { data, error } = await this.sb.client
        .from('resultados')
        .select('*')
        .eq('usuario', u.email)
        .order('fecha', { ascending: false })
        .limit(100);

      if (error) throw error;

      this.items = (data ?? []).map((r: any) => ({
        ...r,
        fecha: new Date(r.fecha),
      })) as Resultado[];
    } catch (e: any) {
      this.err = e?.message ?? 'No se pudo cargar.';
    } finally {
      this.loading = false;
    }
  }

  trackById = (_: number, r: Resultado) => r.id;
}

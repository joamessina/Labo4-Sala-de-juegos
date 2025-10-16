import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SupabaseService } from '../../../supabase/supabase.service';

type Encuesta = {
  id: number;
  user_id: string | null;
  email: string | null;
  nombre: string;
  apellido: string;
  edad: number;
  telefono: string;
  comentario: string;
  mejoras: boolean;
  volverias: string;
  favorito: string | null;
  fecha: string;
};

@Component({
  selector: 'app-encuestas-admin',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './encuestas-admin.component.html',
  styleUrls: ['./encuestas-admin.component.scss'],
})
export class EncuestasAdminComponent {
  private sb = inject(SupabaseService);

  loading = true;
  err = '';
  items: Encuesta[] = [];

  async ngOnInit() {
    this.loading = true;
    this.err = '';
    try {
      const { data, error } = await this.sb.client
        .from('encuestas')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) throw error;
      this.items = (data ?? []) as Encuesta[];
    } catch (e: any) {
      this.err = e?.message ?? 'No se pudo cargar.';
    } finally {
      this.loading = false;
    }
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../supabase/supabase.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './encuesta.component.html',
  styleUrls: ['./encuesta.component.scss'],
})
export class EncuestaComponent {
  private sb = inject(SupabaseService);
  private auth = inject(AuthService);

  model = {
    nombre: '',
    apellido: '',
    edad: null as number | null,
    telefono: '',
    comentario: '',
    mejoras: '' as 'si' | 'no' | '',
    favorito: '',
  };

  msg = '';
  err = '';

  async enviar() {
    this.msg = '';
    this.err = '';

    if (this.model.edad === null) {
      this.err = 'Completá la edad.';
      return;
    }
    if (this.model.edad < 18 || this.model.edad > 99) {
      this.err = 'La edad debe estar entre 18 y 99.';
      return;
    }
    if (!/^\d{1,10}$/.test(this.model.telefono.trim())) {
      this.err = 'El teléfono debe tener solo números (máx. 10 dígitos).';
      return;
    }
    if (!this.model.mejoras) {
      this.err = 'Respondé si te gustaría que agreguemos más juegos.';
      return;
    }

    if (
      !this.model.nombre.trim() ||
      !this.model.apellido.trim() ||
      !this.model.comentario.trim()
    ) {
      this.err = 'Todos los campos son requeridos.';
      return;
    }

    const u = this.auth.user();

    const payload = {
      user_id: u?.id ?? null,
      email: u?.email ?? null,
      nombre: this.model.nombre.trim(),
      apellido: this.model.apellido.trim(),
      edad: Number(this.model.edad),
      telefono: this.model.telefono.trim(),
      comentario: this.model.comentario.trim(),
      mejoras: this.model.mejoras,
      favorito: this.model.favorito || null,
    };

    const { error } = await this.sb.client.from('encuestas').insert(payload);

    if (error) {
      this.err = 'No se pudo guardar la encuesta.';
      console.error('[ENCUESTA]', error);
      return;
    }

    this.msg = '¡Encuesta enviada con éxito!';
    this.model = {
      nombre: '',
      apellido: '',
      edad: null,
      telefono: '',
      comentario: '',
      mejoras: '',
      favorito: '',
    };
  }
}

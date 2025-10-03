import { Component, OnDestroy, OnInit } from '@angular/core';
import { Respuestaapisimpsons } from '../interfaces/respuestaapisimpsons.interface';
import { ApiSimpsonsService } from '../../services/api-simpsons.service';

import Swal from 'sweetalert2';
import { ResultadosService } from '../../services/resultados.service';
import { AuthService, SessionUser } from '../../../auth/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preguntados.component.html',
  styleUrls: ['./preguntados.component.scss'],
})
export class PreguntadosComponent implements OnInit, OnDestroy {
  public subscripcion?: Subscription;

  public personajes: Respuestaapisimpsons[] = [];
  public personajeAAdivinar!: Respuestaapisimpsons;
  public opciones: string[] = [];
  public cantidadDeOpciones: number = 4;
  public puntosJugador: number = 0;
  public contadorDeJugadas: number = 0;
  public cantidadDeJugadas: number = 1;
  public indiceActual: number = 0;
  public mensaje!: string;
  public botonesDeshabilitados: boolean = false;
  public usuarioActual: SessionUser | null = null;
  public mensajeRespuesta: string = '';
  public nombreJuego: string = 'Preguntados';

  constructor(
    private apiSimpsonsService: ApiSimpsonsService,
    private resultadosService: ResultadosService,
    public authenticationService: AuthService
  ) {
    this.usuarioActual = this.authenticationService.user();
  }

  ngOnInit(): void {
    this.cargarJuegoNuevo();
  }

  public cargarJuegoNuevo() {
    this.resetearValores();
    this.subscripcion = this.apiSimpsonsService
      .obtenerPersonajesFiltrados()
      .subscribe((respuesta) => {
        this.personajes = respuesta;
        this.indiceActual = 0;
        this.cargarSiguientePersonaje();
      });
  }

  public resetearValores(): void {
    this.opciones = [];
    this.personajes = [];
    this.contadorDeJugadas = 0;
    this.puntosJugador = 0;
    this.botonesDeshabilitados = false;
  }

  public cargarSiguientePersonaje(): void {
    this.personajeAAdivinar = this.personajes[this.indiceActual];
    this.opciones = this.generarOpciones(this.personajeAAdivinar.character);
  }

  public generarOpciones(nombreCorrecto: string): string[] {
    const opciones: string[] = [];
    opciones.push(nombreCorrecto);

    while (opciones.length < this.cantidadDeOpciones) {
      const personajeAleatorio = this.seleccionarPersonajeAlAzar();
      const nombreAleatorio = personajeAleatorio.character;

      if (!opciones.includes(nombreAleatorio)) {
        opciones.push(nombreAleatorio);
      }
    }

    return this.mezclarOpciones(opciones);
  }

  public seleccionarPersonajeAlAzar(): Respuestaapisimpsons {
    const indiceAleatorio = Math.floor(Math.random() * this.personajes.length);
    return this.personajes[indiceAleatorio];
  }

  public mezclarOpciones(opciones: string[]): string[] {
    return opciones.sort(() => Math.random() - 0.5);
  }

  public verificarRespuesta(nombreElegido: string): void {
    let icono: 'success' | 'error' | 'info';

    if (nombreElegido === this.personajeAAdivinar.character) {
      this.puntosJugador++;
      this.mensaje = `¡Correcto! El personaje es ${this.personajeAAdivinar.character} .`;
      icono = 'success';
    } else {
      this.mensaje = `¡Incorrecto! El personaje es ${this.personajeAAdivinar.character} .`;
      icono = 'error';
    }

    this.comunicarAlUsuario('jugada', this.mensaje, '', icono);
    this.contadorDeJugadas++;
    this.indiceActual++;

    if (this.contadorDeJugadas < this.cantidadDeJugadas) {
      this.cargarSiguientePersonaje();
    } else {
      this.botonesDeshabilitados = true;
      this.mensaje = `Se terminó el juego! Tu puntaje es: ${this.puntosJugador} puntos.
                      Si te gustó, volvé a jugar`;
      this.comunicarAlUsuario('final', 'JUEGO TERMINADO', this.mensaje, 'info');
    }
  }

  public comunicarAlUsuario(
    tipo: string,
    titulo: string,
    texto: string,
    icono: 'success' | 'error' | 'info'
  ): void {
    switch (tipo) {
      case 'jugada':
        Swal.fire({
          position: 'center',
          icon: icono,
          title: titulo,
          showConfirmButton: false,
          timer: 1000,
        });
        break;
      default:
        if (this.usuarioActual?.email) {
          this.registrarResultado(
            this.usuarioActual?.email,
            this.puntosJugador,
            this.nombreJuego
          );
        }

        Swal.fire({
          title: titulo,
          text: texto,
          icon: icono,
          showCancelButton: true,
          confirmButtonText: 'Jugar de nuevo',
          cancelButtonText: 'Volver al Home',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'swal2-btn swal2-btn--primary',
            cancelButton: 'swal2-btn swal2-btn--outline',
          },
        }).then((result) => {
          if (result.isConfirmed) {
            this.cargarJuegoNuevo();
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            this.authenticationService?.user();
            this.resultadosService;
            window.location.href = '/home';
          }
        });
    }
  }

  public async registrarResultado(
    usuario: string,
    puntaje: number,
    juego: string
  ) {
    try {
      await this.resultadosService.registrarResultado(usuario, puntaje, juego);
    } catch (error: any) {
      const msg =
        error?.message ??
        error?.hint ??
        'No se pudo registrar el resultado. Intentá nuevamente.';
      Swal.fire('Error', msg, 'error');
    }
  }

  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'assets/img/placeholder.png';
  }

  ngOnDestroy() {
    this.subscripcion?.unsubscribe();
  }
}

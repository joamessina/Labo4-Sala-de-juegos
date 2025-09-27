import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, of } from 'rxjs';
import { Respuestaapisimpsons } from '../pages/interfaces/respuestaapisimpsons.interface';

type ApiCharacter = {
  id: number;
  name: string;
  portrait_path: string;
};

type CharactersResponse =
  | ApiCharacter[]
  | { results: ApiCharacter[]; page: number; total_pages: number };

@Injectable({ providedIn: 'root' })
export class ApiSimpsonsService {
  private readonly BASE = 'https://thesimpsonsapi.com/api';
  public cantidadDePersonajes = 10;

  constructor(private http: HttpClient) {}

  obtenerPersonajesFiltrados() {
    return this.http.get<CharactersResponse>(`${this.BASE}/characters`).pipe(
      map((res) => {
        const list: ApiCharacter[] = Array.isArray(res)
          ? res
          : (res as any)?.results ?? [];

        const mapped: Respuestaapisimpsons[] = list.map((c) => ({
          quote: '',
          character: c.name,
          image: this.absoluteImg(c.portrait_path),
          characterDirection: 'Right',
        }));

        return this.filtrarAleatoriosUnicos(mapped, this.cantidadDePersonajes);
      }),
      catchError(() => of<Respuestaapisimpsons[]>([]))
    );
  }

  private absoluteImg(path: string, size: 200 | 500 | 1280 = 500) {
    if (!path) return '';
    return `https://cdn.thesimpsonsapi.com/${size}${path}`;
  }

  private filtrarAleatoriosUnicos(
    personajes: Respuestaapisimpsons[],
    cantidad: number
  ) {
    const unicos: Respuestaapisimpsons[] = [];
    const nombres = new Set<string>();

    for (const p of personajes) {
      if (!nombres.has(p.character)) {
        nombres.add(p.character);
        unicos.push(p);
        if (unicos.length === cantidad) break;
      }
    }

    return unicos.sort(() => Math.random() - 0.5);
  }
}

import { Routes } from '@angular/router';
import { canActivate } from '../chat/chat.guard'; // ya la tenés

export const HANGEDMAN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [canActivate], // solo logueados
    loadComponent: () =>
      import('../../ahorcado/hangedman.component').then(
        (m) => m.HangedmanComponent
      ),
  },
];

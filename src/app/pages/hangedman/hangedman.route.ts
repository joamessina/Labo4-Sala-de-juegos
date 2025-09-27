import { Routes } from '@angular/router';
import { chatGuard } from '../chat/chat.guard';

export const HANGEDMAN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [chatGuard],
    loadComponent: () =>
      import('../../ahorcado/hangedman.component').then(
        (m) => m.HangedmanComponent
      ),
  },
];

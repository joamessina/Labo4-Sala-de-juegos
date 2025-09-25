import { Routes } from '@angular/router';
import { canActivate } from './chat.guard';

export const CHAT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [canActivate],
    loadComponent: () =>
      import('./chat.component').then((m) => m.ChatComponent),
  },
];

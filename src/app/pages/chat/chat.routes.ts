import { Routes } from '@angular/router';
import { chatGuard } from '../chat/chat.guard';

export const CHAT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [chatGuard],
    loadComponent: () =>
      import('./chat.component').then((m) => m.ChatComponent),
  },
];

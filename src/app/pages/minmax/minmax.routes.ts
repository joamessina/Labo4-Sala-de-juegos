import { Routes } from '@angular/router';
import { chatGuard } from '../chat/chat.guard';
export const MINMAX_ROUTES: Routes = [
  {
    path: '',
    canActivate: [chatGuard],
    loadComponent: () =>
      import('../../mayormenor/minmax.component').then(
        (m) => m.MinmaxComponent
      ),
  },
];

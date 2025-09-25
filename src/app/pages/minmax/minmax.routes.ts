import { Routes } from '@angular/router';
import { canActivate } from '../chat/chat.guard';

export const MINMAX_ROUTES: Routes = [
  {
    path: '',
    canActivate: [canActivate],
    loadComponent: () =>
      import('../../mayormenor/minmax.component').then(
        (m) => m.MinmaxComponent
      ),
  },
];

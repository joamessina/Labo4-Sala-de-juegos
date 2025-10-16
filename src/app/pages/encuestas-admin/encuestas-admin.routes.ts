import { Routes } from '@angular/router';
import { adminGuard } from '../../guard/admin.guard';

export default [
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./encuestas-admin.component').then(
        (m) => m.EncuestasAdminComponent
      ),
  },
] as Routes;

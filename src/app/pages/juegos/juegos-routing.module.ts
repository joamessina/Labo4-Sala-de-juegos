import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { chatGuard } from '../chat/chat.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'preguntados',
        loadComponent: () =>
          import('../preguntados/preguntados.component').then(
            (m) => m.PreguntadosComponent
          ),
        canActivate: [chatGuard],
      },
      {
        path: 'ahorcado',
        loadComponent: () =>
          import('../../ahorcado/hangedman.component').then(
            (m) => m.HangedmanComponent
          ),
        canActivate: [chatGuard],
      },
      {
        path: 'mayor-menor',
        loadComponent: () =>
          import('../../mayormenor/minmax.component').then(
            (m) => m.MinmaxComponent
          ),
        canActivate: [chatGuard],
      },

      {
        path: 'blackjack',
        loadComponent: () =>
          import('../blackjack/blackjack.component').then(
            (m) => m.BlackjackComponent
          ),
        canActivate: [chatGuard],
      },

      { path: 'minmax', redirectTo: 'mayor-menor', pathMatch: 'full' },

      { path: '', redirectTo: 'preguntados', pathMatch: 'full' },
      { path: '**', redirectTo: 'preguntados' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JuegosRoutingModule {}

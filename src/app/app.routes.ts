import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { QuienSoyComponent } from './pages/quien-soy/quien-soy.component';
import { RegisterComponent } from './pages/register/register.component';
import { adminGuard } from './guard/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Home' },

  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'register', component: RegisterComponent, title: 'Registro' },
  { path: 'quien-soy', component: QuienSoyComponent, title: 'Quién Soy' },

  {
    path: 'chat',
    loadChildren: () =>
      import('./pages/chat/chat.routes').then((m) => m.CHAT_ROUTES),
  },

  {
    path: 'juegos',
    loadChildren: () =>
      import('./pages/juegos/juegos.module').then((m) => m.JuegosModule),
  },

  {
    path: 'encuesta',
    loadComponent: () =>
      import('./pages/encuesta/encuesta.component').then(
        (m) => m.EncuestaComponent
      ),
  },

  {
    path: 'admin/encuestas',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/encuestas-admin/encuestas-admin.component').then(
        (m) => m.EncuestasAdminComponent
      ),
  },

  { path: '**', redirectTo: '' },
];

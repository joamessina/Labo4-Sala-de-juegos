import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { QuienSoyComponent } from './pages/quien-soy/quien-soy.component';
import { RegisterComponent } from './pages/register/register.component';

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
    path: 'juegos/ahorcado',
    loadChildren: () =>
      import('./pages/hangedman/hangedman.route').then(
        (m) => m.HANGEDMAN_ROUTES
      ),
  },

  { path: '**', redirectTo: '' },
];

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { UsersService } from '../users/users.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const users = inject(UsersService);
  const router = inject(Router);

  const email = auth.user()?.email;
  if (!email) {
    router.navigateByUrl('/login');
    return false;
  }

  const rol = await users.getRoleByEmail(email);
  if (rol === 'admin') return true;

  router.navigateByUrl('/');
  return false;
};

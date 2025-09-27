import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

export const chatGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!!auth.user()) return true;

  router.navigate(['/login'], { queryParams: { redirect: state.url } });
  return false;
};

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

export function canActivate() {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.user()) {
    router.navigateByUrl('/login');
    return false;
  }
  return true;
}

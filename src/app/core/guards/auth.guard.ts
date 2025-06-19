import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

// auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token'); // matches AuthService TOKEN_KEY
  if (token) {
    return true;
  } else {
    router.navigate(['/']);
    return false;
  }
};

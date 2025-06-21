// src/app/core/auth/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
// No need for map, take from rxjs/operators if not used

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Using `isAuthenticated` signal directly for clarity
  if (authService.isAuthenticated()) {
    return true; // Allow activation if authenticated
  } else {
    router.navigate(['/login']); // Redirect to login page if not authenticated
    return false; // Prevent activation
  }
};
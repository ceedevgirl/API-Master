import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  isAuthenticated = signal<boolean>(false); // Using Angular Signal

  constructor(private router: Router) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    this.isAuthenticated.set(!!token);
  }

  login(username: string, password: string): Observable<boolean> {
    // Simulate API call for login
    return of(true).pipe(
      delay(1000), // Simulate network delay
      tap((success) => {
        if (success) {
          const mockToken = 'mock-jwt-token-12345'; // In a real app, this comes from the server
          localStorage.setItem(this.TOKEN_KEY, mockToken);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']); // Redirect to login page
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { ErrorService } from '../error-handling/error.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private errorService: ErrorService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    // Attach token if available
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Log request and response
    console.log('Outgoing Request:', request);

    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          console.log('Incoming Response:', event);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Centralized error handling
        if (error.status === 401 || error.status === 403) {
          // Handle unauthorized/forbidden specifically
          console.error('Authentication Error:', error.message);
          this.authService.logout(); // Clear token and redirect
        }
        return this.errorService.handleError(error);
      })
    );
  }
}
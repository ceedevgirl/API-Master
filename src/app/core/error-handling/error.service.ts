import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor() { }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.status === 401) {
        // Handle unauthorized specifically, e.g., redirect to login
        console.error('Unauthorized request. Redirecting to login...');
      } else if (error.status === 404) {
        console.error('Resource not found.');
      }
    }
    console.error(errorMessage);
    // You might want to display a user-friendly message here
    alert(`Error: ${errorMessage}`); // For demonstration, use a more sophisticated UI in real app
    return throwError(() => new Error(errorMessage));
  }
}
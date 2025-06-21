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
      
      errorMessage = `Error: ${error.error.message}`;
    } else {
      
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.status === 401) {
        
        console.error('Unauthorized request. Redirecting to login...');
      } else if (error.status === 404) {
        console.error('Resource not found.');
      }
    }
    console.error(errorMessage);
    
    alert(`Error: ${errorMessage}`); 
    return throwError(() => new Error(errorMessage));
  }
}
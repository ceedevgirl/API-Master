import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';
import { ErrorService } from '../error-handling/error.service';
import { CacheService } from '../cache/cache.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
<<<<<<< HEAD
  private baseUrl = environment.NG_APP_API_URL;
=======
  private apiUrl = environment.apiUrl;
>>>>>>> dev

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private cacheService: CacheService
  ) { }

  /**
   * Performs a GET request.
   * @param path The API endpoint path (e.g., 'posts').
   * @param params Optional HTTP parameters.
   * @param useCache Whether to use caching for this request.
   * @returns An Observable of the response body.
   */
  get<T>(path: string, params: HttpParams = new HttpParams(), useCache: boolean = true): Observable<T> {
    const url = `${this.apiUrl}/${path}`;
    const cacheKey = `${url}?${params.toString()}`;

    if (useCache) {
      const cachedResponse = this.cacheService.get(cacheKey);
      if (cachedResponse) {
        return cachedResponse.pipe(
          // Assuming the cached response is HttpResponse<T>, we need to map back to T
          // This might require a slight adjustment if you want the full HttpResponse or just body
          // For simplicity, let's assume get returns Observable<T> directly
          // If CacheService.get returns Observable<HttpResponse<any>>, then adjust the return type here:
          // map(res => res.body as T)
          // For now, let's assume CacheService returns the data directly.
          // If CacheService.get returns Observable<HttpResponse<any>>, you'd need to adjust here:
          // map(res => res.body as T)
        ) as Observable<T>; // Type assertion to satisfy return type
      }
    }

    return this.http.get<T>(url, { params }).pipe(
      retry(1),
      tap(response => {
        if (useCache && response instanceof HttpResponse) { // Only cache if it's a full HttpResponse
          this.cacheService.put(cacheKey, response);
        }
      }),
      catchError(error => this.errorService.handleError(error))
    );
  }

  /**
   * Performs a POST request.
   * @param path The API endpoint path.
   * @param body The request body.
   * @returns An Observable of the response body.
   */
  post<T>(path: string, body: any): Observable<T> {
    const url = `${this.apiUrl}/${path}`;
    // Invalidate relevant cache entries for POST operations
    this.cacheService.clearByKey(this.apiUrl + '/posts'); // Example: Invalidate posts list cache
    return this.http.post<T>(url, body).pipe(
      retry(1),
      catchError(error => this.errorService.handleError(error))
    );
  }

  /**
   * Performs a PUT request.
   * @param path The API endpoint path.
   * @param body The request body.
   * @returns An Observable of the response body.
   */
  put<T>(path: string, body: any): Observable<T> {
    const url = `${this.apiUrl}/${path}`;
    // Invalidate relevant cache entries for PUT operations
    this.cacheService.clearByKey(this.apiUrl + '/posts'); // Example: Invalidate posts list cache
    this.cacheService.clearByKey(url); // Invalidate specific item cache
    return this.http.put<T>(url, body).pipe(
      retry(1),
      catchError(error => this.errorService.handleError(error))
    );
  }

  /**
   * Performs a DELETE request.
   * @param path The API endpoint path.
   * @returns An Observable of the response body.
   */
  delete<T>(path: string): Observable<T> {
    const url = `${this.apiUrl}/${path}`;
    // Invalidate relevant cache entries for DELETE operations
    this.cacheService.clearByKey(this.apiUrl + '/posts'); // Example: Invalidate posts list cache
    this.cacheService.clearByKey(url); // Invalidate specific item cache
    return this.http.delete<T>(url).pipe(
      retry(1),
      catchError(error => this.errorService.handleError(error))
    );
  }

  // Overload for when full HttpResponse is desired (e.g., for pagination headers or caching)
  getWithResponse<T>(path: string, params: HttpParams = new HttpParams(), useCache: boolean = true): Observable<HttpResponse<T>> {
    const url = `${this.apiUrl}/${path}`;
    const cacheKey = `${url}?${params.toString()}`;

    if (useCache) {
      const cachedResponse = this.cacheService.get(cacheKey);
      if (cachedResponse) {
        return cachedResponse as Observable<HttpResponse<T>>;
      }
    }

    return this.http.get<T>(url, { params, observe: 'response' }).pipe(
      retry(1),
      tap(response => {
        if (useCache) {
          this.cacheService.put(cacheKey, response);
        }
      }),
      catchError(error => this.errorService.handleError(error))
    );
  }
}
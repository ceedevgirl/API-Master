import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { of, Observable } from 'rxjs';

interface CacheEntry {
  response: HttpResponse<any>;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private CACHE_DURATION_MS = 60 * 1000; // 1 minute

  constructor() { }

  get(key: string): Observable<HttpResponse<any>> | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    const isExpired = (Date.now() - entry.timestamp) > this.CACHE_DURATION_MS;
    if (isExpired) {
      console.log(`Cache for ${key} expired.`);
      this.cache.delete(key);
      return undefined;
    }

    console.log(`Cache hit for ${key}`);
    return of(entry.response.clone()); // Return a clone to prevent external modification
  }

  put(key: string, response: HttpResponse<any>): void {
    console.log(`Caching response for ${key}`);
    this.cache.set(key, { response: response.clone(), timestamp: Date.now() });
  }

  clear(): void {
    console.log('Cache cleared.');
    this.cache.clear();
  }

  clearByKey(key: string): void {
    console.log(`Cache for ${key} cleared.`);
    this.cache.delete(key);
  }
}
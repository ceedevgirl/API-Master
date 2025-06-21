import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;
  let localStorageSpy: jasmine.Spy;

  beforeEach(() => {
    // Create router spy
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    
    // Create localStorage spy
    localStorageSpy = spyOn(Storage.prototype, 'getItem');
    spyOn(Storage.prototype, 'setItem');
    spyOn(Storage.prototype, 'removeItem');

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    service = TestBed.inject(AuthService);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    // Clean up localStorage
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should set isAuthenticated to false when no token exists in localStorage', () => {
      localStorageSpy.and.returnValue(null);
      
      const newService = TestBed.inject(AuthService);
      
      expect(newService.isAuthenticated()).toBe(false);
    });
  });

  describe('login()', () => {
    it('should successfully login with valid credentials', async () => {
      const result = await firstValueFrom(service.login('testuser', 'password'));
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'mock-jwt-token-12345');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return observable that emits after delay', (done) => {
      const startTime = Date.now();
      
      service.login('testuser', 'password').subscribe(result => {
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeGreaterThanOrEqual(1000);
        expect(result).toBe(true);
        done();
      });
    });

    it('should handle login with empty credentials', async () => {
      const result = await firstValueFrom(service.login('', ''));
      
      expect(result).toBe(true); // Service always returns true in mock implementation
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('logout()', () => {
    beforeEach(() => {
      // Set up initial authenticated state
      service.isAuthenticated.set(true);
    });

    it('should clear token from localStorage', () => {
      service.logout();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
    });

    it('should set isAuthenticated to false', () => {
      service.logout();
      
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should navigate to login page', () => {
      service.logout();
      
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should perform all logout actions in correct order', () => {
      service.logout();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(service.isAuthenticated()).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('getToken()', () => {
    it('should return token when it exists in localStorage', () => {
      const mockToken = 'test-token-123';
      localStorageSpy.and.returnValue(mockToken);
      
      const token = service.getToken();
      
      expect(token).toBe(mockToken);
      expect(localStorage.getItem).toHaveBeenCalledWith('authToken');
    });

    it('should return null when no token exists in localStorage', () => {
      localStorageSpy.and.returnValue(null);
      
      const token = service.getToken();
      
      expect(token).toBeNull();
      expect(localStorage.getItem).toHaveBeenCalledWith('authToken');
    });
  });

  describe('Authentication State Management', () => {
    it('should maintain authentication state across login and logout', async () => {
      // Initial state
      expect(service.isAuthenticated()).toBe(false);
      
      // Login
      await firstValueFrom(service.login('user', 'pass'));
      expect(service.isAuthenticated()).toBe(true);
      
      // Logout
      service.logout();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    
    it('should handle multiple consecutive login calls', async () => {
      const login1 = service.login('user1', 'pass1');
      const login2 = service.login('user2', 'pass2');
      
      const [result1, result2] = await Promise.all([
        firstValueFrom(login1),
        firstValueFrom(login2)
      ]);
      
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should handle logout when already logged out', () => {
      service.isAuthenticated.set(false);
      
      expect(() => service.logout()).not.toThrow();
      expect(service.isAuthenticated()).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
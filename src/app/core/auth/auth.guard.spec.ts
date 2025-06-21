import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated: jasmine.createSpy('isAuthenticated')
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = {} as RouterStateSnapshot;
  });

  it('should allow activation when user is authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => 
      authGuard(mockRoute, mockState)
    );

    expect(result).toBe(true);
    expect(authService.isAuthenticated).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should prevent activation when user is not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => 
      authGuard(mockRoute, mockState)
    );

    expect(result).toBe(false);
    expect(authService.isAuthenticated).toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);

    TestBed.runInInjectionContext(() => 
      authGuard(mockRoute, mockState)
    );

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should call isAuthenticated method once', () => {
    authService.isAuthenticated.and.returnValue(true);

    TestBed.runInInjectionContext(() => 
      authGuard(mockRoute, mockState)
    );

    expect(authService.isAuthenticated).toHaveBeenCalledTimes(1);
  });

  it('should not redirect when user is authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);

    TestBed.runInInjectionContext(() => 
      authGuard(mockRoute, mockState)
    );

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
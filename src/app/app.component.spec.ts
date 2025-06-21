import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';

import { AppComponent } from './app.component';
import { AuthService } from './core/auth/auth.service';

// Mock component for testing routes
@Component({
  template: '<div>Mock Component</div>'
})
class MockComponent {}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout', 'isAuthenticated']);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([
          { path: '', component: MockComponent },
          { path: 'posts', component: MockComponent },
          { path: 'posts/create', component: MockComponent },
          { path: 'login', component: MockComponent }
        ]),
        provideLocationMocks(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    
    // Spy on router.navigate after injection
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default property values', () => {
    expect(component.title).toBe('My Blog');
    expect(component.searchTerm).toBe('');
    expect(component.isMenuOpen).toBe(false);
  });

  describe('logout', () => {
    it('should call authService.logout()', () => {
      component.logout();
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  describe('performSearch', () => {
    it('should navigate to /posts with search query when searchTerm has value', () => {
      component.searchTerm = 'test search';
      component.performSearch();

      expect(router.navigate).toHaveBeenCalledWith(['/posts'], {
        queryParams: { search: 'test search' }
      });
    });

    it('should navigate to /posts with trimmed search query', () => {
      component.searchTerm = '  test search  ';
      component.performSearch();

      expect(router.navigate).toHaveBeenCalledWith(['/posts'], {
        queryParams: { search: 'test search' }
      });
    });

    it('should navigate to /posts without query params when searchTerm is empty', () => {
      component.searchTerm = '';
      component.performSearch();

      expect(router.navigate).toHaveBeenCalledWith(['/posts']);
    });

    it('should navigate to /posts without query params when searchTerm is only whitespace', () => {
      component.searchTerm = '   ';
      component.performSearch();

      expect(router.navigate).toHaveBeenCalledWith(['/posts']);
    });
  });

  describe('clearSearch', () => {
    it('should clear searchTerm and navigate with null search param', () => {
      component.searchTerm = 'test';
      component.clearSearch();

      expect(component.searchTerm).toBe('');
      expect(router.navigate).toHaveBeenCalledWith(['/posts'], {
        queryParams: { search: null },
        queryParamsHandling: 'merge'
      });
    });
  });

  describe('toggleMenu', () => {
    it('should toggle isMenuOpen from false to true', () => {
      component.isMenuOpen = false;
      component.toggleMenu();
      expect(component.isMenuOpen).toBe(true);
    });

    it('should toggle isMenuOpen from true to false', () => {
      component.isMenuOpen = true;
      component.toggleMenu();
      expect(component.isMenuOpen).toBe(false);
    });
  });

  describe('closeMenu', () => {
    it('should set isMenuOpen to false', () => {
      component.isMenuOpen = true;
      component.closeMenu();
      expect(component.isMenuOpen).toBe(false);
    });

    it('should keep isMenuOpen as false when already false', () => {
      component.isMenuOpen = false;
      component.closeMenu();
      expect(component.isMenuOpen).toBe(false);
    });
  });

  describe('Template rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render the title in the logo', () => {
      const logoElement = fixture.debugElement.query(By.css('.logo'));
      expect(logoElement.nativeElement.textContent).toBe('My Blog');
    });

    it('should render search input with correct placeholder', () => {
      const searchInput = fixture.debugElement.query(By.css('.search-input'));
      expect(searchInput.nativeElement.placeholder).toBe('Search posts...');
    });

    it('should show clear search button when searchTerm has value', () => {
      component.searchTerm = 'test';
      fixture.detectChanges();
      const clearButton = fixture.debugElement.query(By.css('.clear-search-button'));
      expect(clearButton).toBeTruthy();
    });

    it('should hide clear search button when searchTerm is empty', () => {
      component.searchTerm = '';
      fixture.detectChanges();
      const clearButton = fixture.debugElement.query(By.css('.clear-search-button'));
      expect(clearButton).toBeFalsy();
    });

    it('should add menu-open class to hamburger when menu is open', () => {
      component.isMenuOpen = true;
      fixture.detectChanges();
      const hamburger = fixture.debugElement.query(By.css('.hamburger-icon'));
      expect(hamburger.nativeElement.classList).toContain('menu-open');
    });

    it('should add menu-open class to header-right when menu is open', () => {
      component.isMenuOpen = true;
      fixture.detectChanges();
      const headerRight = fixture.debugElement.query(By.css('.header-right'));
      expect(headerRight.nativeElement.classList).toContain('menu-open');
    });

    it('should show menu backdrop when menu is open', () => {
      component.isMenuOpen = true;
      fixture.detectChanges();
      const backdrop = fixture.debugElement.query(By.css('.menu-backdrop'));
      expect(backdrop.nativeElement.classList).toContain('show');
    });
  });

  describe('Authentication-based rendering', () => {
    it('should show Create Post link when authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);
      fixture.detectChanges();
      
      const createPostLink = fixture.debugElement.query(By.css('.create-post-button'));
      expect(createPostLink).toBeTruthy();
      expect(createPostLink.nativeElement.textContent).toBe('Create Post');
    });

    it('should show Login link when not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      fixture.detectChanges();
      
      const loginLink = fixture.debugElement.query(By.css('.login-button'));
      expect(loginLink).toBeTruthy();
      expect(loginLink.nativeElement.textContent).toBe('👤 Login');
    });

    it('should show Logout button when authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);
      fixture.detectChanges();
      
      const logoutButton = fixture.debugElement.query(By.css('.logout-button'));
      expect(logoutButton).toBeTruthy();
      expect(logoutButton.nativeElement.textContent).toBe('👤 Logout');
    });

    it('should hide Create Post link when not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      fixture.detectChanges();
      
      const createPostLink = fixture.debugElement.query(By.css('.create-post-button'));
      expect(createPostLink).toBeFalsy();
    });

    it('should hide Login link when authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);
      fixture.detectChanges();
      
      const loginLink = fixture.debugElement.query(By.css('.login-button'));
      expect(loginLink).toBeFalsy();
    });

    it('should hide Logout button when not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      fixture.detectChanges();
      
      const logoutButton = fixture.debugElement.query(By.css('.logout-button'));
      expect(logoutButton).toBeFalsy();
    });
  });

  describe('Event handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call performSearch when Enter key is pressed in search input', () => {
      spyOn(component, 'performSearch');
      const searchInput = fixture.debugElement.query(By.css('.search-input'));
      
      searchInput.nativeElement.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
      
      expect(component.performSearch).toHaveBeenCalled();
    });

    it('should call clearSearch when clear button is clicked', () => {
      spyOn(component, 'clearSearch');
      component.searchTerm = 'test';
      fixture.detectChanges();
      
      const clearButton = fixture.debugElement.query(By.css('.clear-search-button'));
      clearButton.nativeElement.click();
      
      expect(component.clearSearch).toHaveBeenCalled();
    });

    it('should call toggleMenu when hamburger is clicked', () => {
      spyOn(component, 'toggleMenu');
      const hamburger = fixture.debugElement.query(By.css('.hamburger-icon'));
      
      hamburger.nativeElement.click();
      
      expect(component.toggleMenu).toHaveBeenCalled();
    });

    it('should call logout when logout button is clicked', () => {
      spyOn(component, 'logout');
      authService.isAuthenticated.and.returnValue(true);
      fixture.detectChanges();
      
      const logoutButton = fixture.debugElement.query(By.css('.logout-button'));
      logoutButton.nativeElement.click();
      
      expect(component.logout).toHaveBeenCalled();
    });

    it('should call closeMenu when backdrop is clicked', () => {
      spyOn(component, 'closeMenu');
      component.isMenuOpen = true;
      fixture.detectChanges();
      
      const backdrop = fixture.debugElement.query(By.css('.menu-backdrop'));
      backdrop.nativeElement.click();
      
      expect(component.closeMenu).toHaveBeenCalled();
    });
  });

  describe('Footer', () => {
    it('should render footer with copyright text', () => {
      fixture.detectChanges();
      const footer = fixture.debugElement.query(By.css('.footer p'));
      expect(footer.nativeElement.textContent).toBe('© 2025 Blog App. All rights reserved.');
    });
  });
});
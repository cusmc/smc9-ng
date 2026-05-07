import { of, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthService } from './auth/auth.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockHttp: jasmine.SpyObj<HttpClient>;
  let isLoggedIn$: BehaviorSubject<boolean>;

  beforeEach(() => {
    isLoggedIn$ = new BehaviorSubject<boolean>(false);

    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', [
      'isLoggedIn$', 'getUsername', 'logout'
    ]);
    mockAuthService.isLoggedIn$.and.returnValue(isLoggedIn$.asObservable());
    mockAuthService.getUsername.and.returnValue(null);

    mockRouter = jasmine.createSpyObj<Router>('Router', ['navigate']);
    mockHttp = jasmine.createSpyObj<HttpClient>('HttpClient', ['get']);
    mockHttp.get.and.returnValue(of({ ProfileName: 'Test User', UGPG: '', Course_id: '' }));

    component = new AppComponent(mockAuthService, mockRouter, mockHttp);
  });

  describe('ngOnInit()', () => {
    it('sets isLoggedIn to false initially when not authenticated', () => {
      component.ngOnInit();
      expect(component.isLoggedIn).toBeFalse();
    });

    it('sets isLoggedIn to true when auth state emits true', () => {
      component.ngOnInit();
      isLoggedIn$.next(true);
      expect(component.isLoggedIn).toBeTrue();
    });

    it('sets username from authService when logged in', () => {
      mockAuthService.getUsername.and.returnValue('jdoe');
      component.ngOnInit();
      isLoggedIn$.next(true);
      expect(component.username).toBe('jdoe');
    });

    it('opens sidenav when user logs in', () => {
      component.ngOnInit();
      isLoggedIn$.next(true);
      expect(component.sidenavOpen).toBeTrue();
    });

    it('calls loadUserProfile when user logs in', () => {
      component.ngOnInit();
      isLoggedIn$.next(true);
      expect(mockHttp.get).toHaveBeenCalled();
    });

    it('does not call loadUserProfile when logged out', () => {
      component.ngOnInit();
      isLoggedIn$.next(false);
      expect(mockHttp.get).not.toHaveBeenCalled();
    });
  });

  describe('logout()', () => {
    it('calls authService.logout()', () => {
      component.logout();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('navigates to /login', () => {
      component.logout();
      expect(mockRouter.navigate).toHaveBeenCalledOnceWith(['/login']);
    });
  });

  describe('navGroups', () => {
    it('has Assessment, Masters and Reports groups', () => {
      const labels = component.navGroups.map(g => g.label);
      expect(labels).toContain('Assessment');
      expect(labels).toContain('Masters');
      expect(labels).toContain('Reports');
    });
  });
});

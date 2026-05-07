import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {} as RouterStateSnapshot;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn']);
    mockRouter = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('returns true and does not redirect when the user is logged in', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard(dummyRoute, dummyState));

    expect(result).toBeTrue();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('returns false and navigates to /login when the user is not logged in', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard(dummyRoute, dummyState));

    expect(result).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledOnceWith(['/login']);
  });
});

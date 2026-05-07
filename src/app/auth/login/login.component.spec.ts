import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    mockRouter = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('form validation', () => {
    it('is invalid when both fields are empty', () => {
      expect(component.loginForm.invalid).toBeTrue();
    });

    it('marks username as required when empty', () => {
      component.loginForm.setValue({ username: '', password: 'validpass' });
      expect(component.f['username'].errors?.['required']).toBeTruthy();
    });

    it('marks password as required when empty', () => {
      component.loginForm.setValue({ username: 'jdoe', password: '' });
      expect(component.f['password'].errors?.['required']).toBeTruthy();
    });

    it('marks password invalid for fewer than 6 characters', () => {
      component.loginForm.setValue({ username: 'jdoe', password: 'abc' });
      expect(component.f['password'].errors?.['minlength']).toBeTruthy();
    });

    it('is valid when username is provided and password is at least 6 characters', () => {
      component.loginForm.setValue({ username: 'jdoe', password: 'secret' });
      expect(component.loginForm.valid).toBeTrue();
    });
  });

  describe('onSubmit()', () => {
    it('does not call authService.login when the form is invalid', () => {
      component.onSubmit();
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('sets submitted to true on any submit attempt', () => {
      component.onSubmit();
      expect(component.submitted).toBeTrue();
    });

    it('navigates to /elogbook/activities on successful login', () => {
      mockAuthService.login.and.returnValue(of({}));
      component.loginForm.setValue({ username: 'jdoe', password: 'secret123' });

      component.onSubmit();

      expect(mockAuthService.login).toHaveBeenCalledOnceWith('jdoe', 'secret123');
      expect(mockRouter.navigate).toHaveBeenCalledOnceWith(['/elogbook/activities']);
    });

    it('sets error from error_description on login failure', () => {
      mockAuthService.login.and.returnValue(
        throwError(() => ({ error: { error_description: 'Invalid credentials.' } }))
      );
      component.loginForm.setValue({ username: 'jdoe', password: 'wrongpass' });

      component.onSubmit();

      expect(component.error).toBe('Invalid credentials.');
      expect(component.loading).toBeFalse();
    });

    it('falls back to "Login failed" when error has no error_description', () => {
      mockAuthService.login.and.returnValue(throwError(() => ({})));
      component.loginForm.setValue({ username: 'jdoe', password: 'wrongpass' });

      component.onSubmit();

      expect(component.error).toBe('Login failed');
    });

    it('clears a previous error on each new submit', () => {
      component.error = 'Previous error';
      component.onSubmit(); // invalid form, but error should be cleared
      expect(component.error).toBeNull();
    });
  });
});

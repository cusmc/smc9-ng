import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login()', () => {
    it('stores access_token and userName in localStorage on success', () => {
      let resolved = false;

      service.login('jdoe', 'secret123').subscribe(() => (resolved = true));

      const req = httpMock.expectOne(r => r.url.includes('/token'));
      expect(req.request.method).toBe('POST');
      req.flush({ access_token: 'my-token', token_type: 'bearer' });

      expect(resolved).toBeTrue();
      expect(localStorage.getItem('access_token')).toBe('my-token');
      expect(localStorage.getItem('userName')).toBe('jdoe');
    });

    it('encodes credentials in the request body', () => {
      service.login('user@test', 'p@ss!').subscribe();

      const req = httpMock.expectOne(r => r.url.includes('/token'));
      expect(req.request.body).toContain('grant_type=password');
      expect(req.request.body).toContain(encodeURIComponent('user@test'));
      expect(req.request.body).toContain(encodeURIComponent('p@ss!'));
      req.flush({ access_token: 'tok' });
    });

    it('updates isLoggedIn$ to true after successful login', done => {
      service.login('jdoe', 'secret123').subscribe(() => {
        service.isLoggedIn$().subscribe(val => {
          expect(val).toBeTrue();
          done();
        });
      });

      httpMock.expectOne(r => r.url.includes('/token')).flush({ access_token: 'tok' });
    });

    it('emits error and leaves localStorage untouched on HTTP failure', () => {
      let errored = false;

      service.login('jdoe', 'wrong').subscribe({ error: () => (errored = true) });

      const req = httpMock.expectOne(r => r.url.includes('/token'));
      req.flush({ error: 'invalid_grant' }, { status: 400, statusText: 'Bad Request' });

      expect(errored).toBeTrue();
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('userName')).toBeNull();
    });
  });

  describe('logout()', () => {
    it('removes access_token and userName from localStorage', () => {
      localStorage.setItem('access_token', 'tok');
      localStorage.setItem('userName', 'jdoe');

      service.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('userName')).toBeNull();
    });

    it('emits false on isLoggedIn$', done => {
      localStorage.setItem('access_token', 'tok');
      service.logout();

      service.isLoggedIn$().subscribe(val => {
        expect(val).toBeFalse();
        done();
      });
    });
  });

  describe('getToken()', () => {
    it('returns the stored token', () => {
      localStorage.setItem('access_token', 'my-token');
      expect(service.getToken()).toBe('my-token');
    });

    it('returns null when no token is stored', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('getUsername()', () => {
    it('returns the stored username', () => {
      localStorage.setItem('userName', 'jdoe');
      expect(service.getUsername()).toBe('jdoe');
    });

    it('returns null when no username is stored', () => {
      expect(service.getUsername()).toBeNull();
    });
  });

  describe('isLoggedIn()', () => {
    it('returns true when access_token is present', () => {
      localStorage.setItem('access_token', 'tok');
      expect(service.isLoggedIn()).toBeTrue();
    });

    it('returns false when access_token is absent', () => {
      expect(service.isLoggedIn()).toBeFalse();
    });
  });

  describe('isLoggedIn$()', () => {
    it('emits false initially when not logged in', done => {
      service.isLoggedIn$().subscribe(val => {
        expect(val).toBeFalse();
        done();
      });
    });
  });
});

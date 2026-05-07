import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

const BASE = environment.apiUrl;

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('get()', () => {
    it('makes a GET request to the correct URL and parses plain JSON', done => {
      const data = [{ id: 1 }];

      service.get<typeof data>('/api/test').subscribe(result => {
        expect(result).toEqual(data);
        done();
      });

      const req = httpMock.expectOne(`${BASE}/api/test`);
      expect(req.request.method).toBe('GET');
      req.flush(JSON.stringify(data));
    });

    it('unwraps doubly-serialized JSON (string whose value is JSON)', done => {
      const inner = [{ id: 2 }];

      service.get<typeof inner>('/api/test').subscribe(result => {
        expect(result).toEqual(inner);
        done();
      });

      const req = httpMock.expectOne(`${BASE}/api/test`);
      req.flush(JSON.stringify(JSON.stringify(inner)));
    });

    it('returns the raw string when the body is not valid JSON', done => {
      service.get<any>('/api/test').subscribe(result => {
        expect(result).toBe('OK');
        done();
      });

      const req = httpMock.expectOne(`${BASE}/api/test`);
      req.flush('OK');
    });

    it('appends provided query-string params', () => {
      service.get('/api/test', { Empid: 'E001', Inst_id: 1 }).subscribe();

      const req = httpMock.expectOne(r => r.url === `${BASE}/api/test`);
      expect(req.request.params.get('Empid')).toBe('E001');
      expect(req.request.params.get('Inst_id')).toBe('1');
      req.flush('[]');
    });

    it('omits null and undefined param values', () => {
      service.get('/api/test', { a: 'val', b: null, c: undefined }).subscribe();

      const req = httpMock.expectOne(r => r.url === `${BASE}/api/test`);
      expect(req.request.params.has('a')).toBeTrue();
      expect(req.request.params.has('b')).toBeFalse();
      expect(req.request.params.has('c')).toBeFalse();
      req.flush('[]');
    });
  });

  describe('post()', () => {
    it('makes a POST request and parses the text response', done => {
      const payload = { name: 'test' };
      const response = { ok: true };

      service.post<typeof response>('/api/save', payload).subscribe(result => {
        expect(result).toEqual(response);
        done();
      });

      const req = httpMock.expectOne(`${BASE}/api/save`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(JSON.stringify(response));
    });
  });

  describe('put()', () => {
    it('makes a PUT request to the correct URL', done => {
      const payload = { id: 1 };

      service.put<any>('/api/update', payload).subscribe(result => {
        expect(result).toEqual({ updated: true });
        done();
      });

      const req = httpMock.expectOne(`${BASE}/api/update`);
      expect(req.request.method).toBe('PUT');
      req.flush({ updated: true });
    });
  });

  describe('delete()', () => {
    it('makes a DELETE request to the correct URL', done => {
      service.delete<any>('/api/remove/1').subscribe(result => {
        expect(result).toEqual({ deleted: true });
        done();
      });

      const req = httpMock.expectOne(`${BASE}/api/remove/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ deleted: true });
    });
  });

  describe('getBlob()', () => {
    it('makes a GET request with responseType blob', done => {
      const blobData = new Blob(['pdf content'], { type: 'application/pdf' });

      service.getBlob('/api/report').subscribe(result => {
        expect(result).toBeInstanceOf(Blob);
        done();
      });

      const req = httpMock.expectOne(`${BASE}/api/report`);
      expect(req.request.responseType).toBe('blob');
      req.flush(blobData);
    });
  });
});

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    // Use responseType: 'text' and parse to handle both proper JSON and raw JSON string responses
    return this.http
      .get(`${this.apiUrl}${endpoint}`, { params: httpParams, responseType: 'text' })
      .pipe(map(body => this.parseResponse<T>(body)));
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    // Use responseType: 'text' and parse to handle both proper JSON and raw JSON string responses
    return this.http
      .post(`${this.apiUrl}${endpoint}`, body, { responseType: 'text' })
      .pipe(map(res => this.parseResponse<T>(res)));
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`);
  }

  getBlob(endpoint: string, params?: any): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.apiUrl}${endpoint}`, { params: httpParams, responseType: 'blob' });
  }

  postBlob(endpoint: string, body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}${endpoint}`, body, { responseType: 'blob' });
  }

  postFormData<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http
      .post(`${this.apiUrl}${endpoint}`, formData, { responseType: 'text' })
      .pipe(map(res => this.parseResponse<T>(res)));
  }

  private parseResponse<T>(body: string): T {
    try {
      const parsed = JSON.parse(body);
      // Handle doubly-serialized JSON: backend returns JSON string whose value is JSON
      if (typeof parsed === 'string') {
        return JSON.parse(parsed) as T;
      }
      return parsed as T;
    } catch {
      // If JSON.parse fails, return the raw string (for non-JSON responses)
      return body as unknown as T;
    }
  }
}

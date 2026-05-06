import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.checkLoggedIn());
 

  private tokenUrl = environment.apiUrl ? `${environment.apiUrl}/token` : '/token';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const body = `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    return new Observable(observer => {
      this.http.post<any>(this.tokenUrl, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).subscribe({
        next: (response: any) => {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('userName', username);
          this.isLoggedInSubject.next(true);
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userName');
    this.isLoggedInSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUsername(): string | null {
    return localStorage.getItem('userName');
  }

  isLoggedIn(): boolean {
    return this.checkLoggedIn();
  }

  isLoggedIn$(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  private checkLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
}

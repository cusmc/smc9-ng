import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/api.service';
import { Webpage } from './webpages.models';

const BASE = '/api/Website/WebpagesAPI';

@Injectable({ providedIn: 'root' })
export class WebpagesService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Webpage[]> {
    return this.api.get<Webpage[]>(`${BASE}/GetDatas`);
  }

  getById(id: number): Observable<Webpage> {
    return this.api.get<Webpage>(`${BASE}/GetDatabyId`, { id });
  }

  save(data: Partial<Webpage>): Observable<any> {
    return this.api.post<any>(`${BASE}/SaveData`, data);
  }

  delete(id: number): Observable<any> {
    return this.api.post<any>(`${BASE}/DeleteData`, { id });
  }
}

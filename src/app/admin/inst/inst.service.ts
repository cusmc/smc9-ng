import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import { Inst } from './inst.models';

const BASE = '/api/jMedilan/InstMastsAPI';

@Injectable({ providedIn: 'root' })
export class InstService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Inst[]> {
    return this.api.get<Inst[]>(`${BASE}/GetDatas`);
  }

  getById(id: number): Observable<Inst> {
    return this.api.get<Inst>(`${BASE}/GetDatabyId`, { id });
  }

  save(data: Partial<Inst>): Observable<any> {
    return this.api.post<any>(`${BASE}/SaveData`, data);
  }

  delete(id: number): Observable<any> {
    return this.api.post<any>(`${BASE}/DeleteData`, { id });
  }
}

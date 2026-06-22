import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import { CertiRequestDto, UpdateStatusPayload } from './certi-req.models';

const BASE = '/api/Campus/certirequest';

@Injectable({ providedIn: 'root' })
export class CertiReqService {
  constructor(private api: ApiService) {}

  getAll(): Observable<CertiRequestDto[]> {
    return this.api.get<CertiRequestDto[]>(`${BASE}/GetAll`);
  }

  updateStatus(payload: UpdateStatusPayload): Observable<unknown> {
    return this.api.post<unknown>(`${BASE}/Update`, payload);
  }

  printReceipt(id: number): Observable<string> {
    return this.api.get<string>(`${BASE}/Printreceipt`, { id });
  }
}

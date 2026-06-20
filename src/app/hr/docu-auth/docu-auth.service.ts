import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';

export interface PendingDocuRecord {
  documast_id: number;
  empid: number;
  empnm: string;
  description: string;
  filename: string;
  DocType: string;
  create_by: string;
  create_dt: string;
}

export interface DocuAuthRequest {
  Documast_id: number;
  Decision: string;
  RejReason: string;
}

const BASE = '/api/HR/EmpmastsAPI';

@Injectable({ providedIn: 'root' })
export class DocuAuthService {
  constructor(private api: ApiService) {}

  getPendingDocuments(): Observable<PendingDocuRecord[]> {
    return this.api.get<PendingDocuRecord[]>(`${BASE}/GetPendingDocuAuth`);
  }

  authorizeDocument(req: DocuAuthRequest): Observable<any> {
    return this.api.post<any>(`${BASE}/AuthorizeDocu`, req);
  }
}

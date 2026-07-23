import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';

export interface PublicationRecord {
  Pubc_id: number;
  Pubc_dt: string | null;
  Pubc_tp: string | null;
  Pubc_nm: string | null;
  Empid: number;
  Empnm: string;
  Used_Promotion: string | null;
  Promotion_Grade: string | null;
  Auth_Status: string | null;
  SelfUpload: string | null;
  AuthBy: string | null;
  AuthDt: string | null;
  RejReason: string | null;
  Create_by: string | null;
  Create_dt: string | null;
  AttCount: number;
}

export interface PublicationAuthRequest {
  Pubc_id: number;
  Decision: string;
  RejReason: string;
}

export interface PubDocuAttachment {
  documast_id: number;
  filename: string;
  DocType: string;
  pubc_id: number | null;
}

const PUBC_BASE = '/api/HR/PubcsAPI';
const DOCU_BASE = '/api/HR/EmpmastsAPI';

@Injectable({ providedIn: 'root' })
export class PublicationAuthService {
  constructor(private api: ApiService) {}

  getAllPublications(empId?: number): Observable<PublicationRecord[]> {
    const params = empId ? { empId } : {};
    return this.api.get<PublicationRecord[]>(`${PUBC_BASE}/GetAllPublicationAuth`, params);
  }

  authorizePublication(req: PublicationAuthRequest): Observable<any> {
    return this.api.post<any>(`${PUBC_BASE}/AuthorizePublication`, req);
  }

  // Reuses the existing all-documents feed and lets the component filter by
  // pubc_id per card — the same source Document Authorization already uses.
  getAllAttachments(): Observable<PubDocuAttachment[]> {
    return this.api.get<PubDocuAttachment[]>(`${DOCU_BASE}/GetAllDocuAuth`);
  }
}

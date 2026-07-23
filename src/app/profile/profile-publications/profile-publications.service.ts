import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';

export interface MyPublication {
  Pubc_id: number;
  Pubc_dt: string | null;
  Pubc_tp: string | null;
  Pubc_nm: string | null;
  Empid: number;
  Used_Promotion: string | null;
  Promotion_Grade: string | null;
  Auth_Status: string | null;
  SelfUpload: string | null;
  AuthBy: string | null;
  AuthDt: string | null;
  RejReason: string | null;
  Create_by: string | null;
  Create_dt: string | null;
  Edit_by: string | null;
  Edit_dt: string | null;
  AttCount: number;
}

export interface PubDocType {
  SubCode_id: number;
  vals: string;
  HrOnly: boolean;
  AllowedExt: string | null;
  MultiPageAllowed: boolean;
  MinFileSizeKb: number | null;
  MaxFileSizeKb: number | null;
}

export interface MyPubAttachment {
  documast_id: number;
  subcode_id: number;
  description: string;
  filename: string;
  DocType: string;
  create_dt: string;
  auth_status: string | null;
  rej_reason: string | null;
  pubc_id: number | null;
}

const PUBC_BASE = '/api/HR/PubcsAPI';
const DOCU_BASE = '/api/HR/EmpmastsAPI';
const CODELIST_BASE = '/api/Common/CodemastsAPI';

// Grade -> Subcode `Vals` text (matched against the HRDOCUTYPE list rather than
// a hardcoded SubCode_id — see Publication_Subcode_Seed.sql).
export const GRADE_DOC_TYPE_VALS: Record<string, string> = {
  AssocProf: 'Publication Proof - Associate Professor',
  Professor: 'Publication Proof - Professor',
};

@Injectable({ providedIn: 'root' })
export class ProfilePublicationsService {
  constructor(private api: ApiService) {}

  getMyPublications(): Observable<MyPublication[]> {
    return this.api.get<MyPublication[]>(`${PUBC_BASE}/GetMyPublications`);
  }

  saveMyPublication(pub: Partial<MyPublication>): Observable<number> {
    return this.api.post<number>(`${PUBC_BASE}/SaveMyPublication`, pub);
  }

  deleteMyPublication(id: number): Observable<any> {
    return this.api.post(`${PUBC_BASE}/DeleteMyPublication?id=${id}`, {});
  }

  getDocumentTypes(): Observable<PubDocType[]> {
    return this.api.get<PubDocType[]>(`${CODELIST_BASE}/GetCodeListbyCodenm`, { codenm: 'HRDOCUTYPE' });
  }

  getMyAttachments(): Observable<MyPubAttachment[]> {
    return this.api.get<MyPubAttachment[]>(`${DOCU_BASE}/GetMyDocu`);
  }

  uploadAttachment(pubcId: number, subcodeId: number, description: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('Data', JSON.stringify({
      Subcode_id: subcodeId, Description: description, Pubc_id: pubcId,
    }));
    formData.append('file', file, file.name);
    return this.api.postFormData<any>(`${DOCU_BASE}/SelfDocuUpload`, formData);
  }
}

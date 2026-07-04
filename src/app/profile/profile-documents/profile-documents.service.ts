import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';

export interface MyDocuRecord {
  documast_id: number;
  empid: number;
  subcode_id: number;
  description: string;
  filename: string;
  DocType: string;
  create_dt: string;
  auth_status: string | null;
  rej_reason: string | null;
  selfupload: string | null;
  page_no: number | null;
  parent_docu_id: number | null;
}

export interface SubcodeItem {
  SubCode_id: number;
  vals: string;
  String2: string | null;
  DocuAllowSubcode_id: number | null;
  MultiPageAllowed: boolean;
  ConvertPdfToJpg: boolean;
  HrOnly: boolean;
  AllowedExt: string | null;
}

const BASE = '/api/HR/EmpmastsAPI';
const CODELIST_BASE = '/api/Common/CodemastsAPI';

@Injectable({ providedIn: 'root' })
export class ProfileDocumentsService {
  constructor(private api: ApiService) {}

  getMyDocuments(): Observable<MyDocuRecord[]> {
    return this.api.get<MyDocuRecord[]>(`${BASE}/GetMyDocu`);
  }

  getDocumentTypes(): Observable<SubcodeItem[]> {
    return this.api.get<SubcodeItem[]>(`${CODELIST_BASE}/GetCodeListbyCodenm`, { codenm: 'HRDOCUTYPE' });
  }

  uploadDocument(subcodeId: number, description: string, pageNo: number | null,
                 file: File, parentDocuId: number | null = null): Observable<any> {
    const formData = new FormData();
    formData.append('Data', JSON.stringify({
      Subcode_id: subcodeId, Description: description,
      PageNo: pageNo, Parent_Docu_Id: parentDocuId,
    }));
    formData.append('file', file, file.name);
    return this.api.postFormData<any>(`${BASE}/SelfDocuUpload`, formData);
  }
}

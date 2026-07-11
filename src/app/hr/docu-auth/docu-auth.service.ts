import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';

export interface DocuRecord {
  documast_id: number;
  empid: number;
  empnm: string;
  empUsername: string;
  subcode_id: number;
  description: string;
  filename: string;
  DocType: string;
  create_by: string;
  create_dt: string;
  auth_status: string;
  authby: string;
  authdt: string;
  rejreason: string;
  selfupload: string;
}

export interface DocuAuthRequest {
  Documast_id: number;
  Decision: string;
  RejReason: string;
}

export interface NotificationPayload {
  Vtype: string;
  Username: string;
  Msg: string;
  Inst_id: number | null;
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
  MinFileSizeKb: number | null;
  MaxFileSizeKb: number | null;
}

const BASE = '/api/HR/EmpmastsAPI';
const NOTIF_BASE = '/api/Common/notificationssAPI';
const CODELIST_BASE = '/api/Common/CodemastsAPI';

@Injectable({ providedIn: 'root' })
export class DocuAuthService {
  constructor(private api: ApiService) {}

  getAllDocuments(empId?: number): Observable<DocuRecord[]> {
    const params = empId ? { empId } : {};
    return this.api.get<DocuRecord[]>(`${BASE}/GetAllDocuAuth`, params);
  }

  authorizeDocument(req: DocuAuthRequest): Observable<any> {
    return this.api.post<any>(`${BASE}/AuthorizeDocu`, req);
  }

  deleteDocument(id: number): Observable<any> {
    return this.api.post<any>(`${BASE}/DeleteDocu?id=${id}`, {});
  }

  sendNotification(payload: NotificationPayload): Observable<any> {
    return this.api.post<any>(`${NOTIF_BASE}/SaveData`, payload);
  }

  getDocumentTypes(): Observable<SubcodeItem[]> {
    return this.api.get<SubcodeItem[]>(`${CODELIST_BASE}/GetCodeListbyCodenm`, { codenm: 'HRDOCUTYPE' });
  }

  uploadDocument(empid: number, subcodeId: number, description: string, pageNo: number | null,
                 file: File, parentDocuId: number | null = null): Observable<any> {
    const formData = new FormData();
    formData.append('Data', JSON.stringify({
      Empid: empid, Subcode_id: subcodeId, Description: description,
      PageNo: pageNo, Parent_Docu_Id: parentDocuId,
    }));
    formData.append('file', file, file.name);
    return this.api.postFormData<any>(`${BASE}/HrDocuUpload`, formData);
  }
}

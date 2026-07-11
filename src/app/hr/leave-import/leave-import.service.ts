import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import { environment } from '../../../environments/environment';

export interface LeaveImportRowError {
  RowNo: number;
  Empid: string;
  Error: string;
}

export interface LeaveImportResult {
  TotalRows: number;
  Inserted: number;
  Skipped: number;
  Failed: number;
  LogUrl: string;
  Msg: string;
  Errors: LeaveImportRowError[];
}

const BASE = '/api/HR/LeaveImportAPI';

@Injectable({ providedIn: 'root' })
export class LeaveImportService {
  constructor(private api: ApiService) {}

  upload(file: File, remark: string): Observable<LeaveImportResult> {
    const formData = new FormData();
    formData.append('Data', JSON.stringify({ Remark: remark }));
    formData.append('file', file, file.name);
    return this.api.postFormData<LeaveImportResult>(`${BASE}/Upload`, formData);
  }

  // Backend returns a "../"-relative URL (see DeclarationFormService.toAbsoluteUrl) — resolve
  // it against the API origin so the error-log link/download works from the Angular app.
  toAbsoluteUrl(relativeUrl: string): string {
    return `${environment.apiUrl}/${relativeUrl.replace(/^(\.\.\/)+/, '')}`;
  }
}

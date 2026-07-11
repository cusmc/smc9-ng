import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import { environment } from '../../../environments/environment';

export interface GenerateWordResponse {
  url: string;
}

const BASE = '/api/HR/DeclarationFormAPI';

@Injectable({ providedIn: 'root' })
export class DeclarationFormService {
  constructor(private api: ApiService) {}

  generateWord(empid: number, withSign: boolean, withAtt: boolean): Observable<GenerateWordResponse> {
    return this.api.get<GenerateWordResponse>(`${BASE}/GenerateWord`, { empid, withSign, withAtt });
  }

  // The backend returns a path relative to the site root (e.g. "../UploadedFiles/Docs/x.docx"),
  // matching this codebase's established "../"-relative convention -- resolve it against the
  // API origin to get a fetchable absolute URL.
  toAbsoluteUrl(relativeUrl: string): string {
    return `${environment.apiUrl}/${relativeUrl.replace(/^(\.\.\/)+/, '')}`;
  }
}

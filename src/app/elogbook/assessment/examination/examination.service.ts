import { Injectable } from '@angular/core';
import { ApiService } from '../../../shared/api.service';
import { Observable } from 'rxjs';
import { ExamResult, AuthPayload } from './examination.models';

@Injectable({ providedIn: 'root' })
export class ExaminationService {
  constructor(private api: ApiService) {}

  getExamResults(subjectId?: number, studno?: string): Observable<ExamResult[]> {
    const params: any = {};
    if (subjectId) params.Subject_id = subjectId;
    if (studno) params.Studno = studno;
    return this.api.get<ExamResult[]>('/api/Campus/exammastsAPI/GetDatas1', params);
  }

  authExamResult(payload: AuthPayload): Observable<any> {
    return this.api.post('/api/Campus/examressAPI/AuthData', payload);
  }
}

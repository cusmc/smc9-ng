import { Injectable } from '@angular/core';
import { ApiService } from '../../../shared/api.service';
import { Observable } from 'rxjs';
import { StudentCompetency } from './competency-assessment.models';

@Injectable({ providedIn: 'root' })
export class CompetencyAssessmentService {
  constructor(private api: ApiService) {}

  getCompetencies(username: string, subjectId?: number, studno?: string): Observable<StudentCompetency[]> {
    const params: any = {};
    if (subjectId) params.Subject_id = subjectId;
    if (studno) params.Studno = studno;
    return this.api.get<StudentCompetency[]>('/api/Campus/studentcompetencysAPI/GetDatas', params);
  }

  save(row: StudentCompetency, action: 'U' | 'R'): Observable<any> {
    return this.api.post('/api/Campus/studentcompetencysAPI/SaveFacultyData', { ...row, Action: action });
  }
}

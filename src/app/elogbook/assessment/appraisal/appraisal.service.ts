import { Injectable } from '@angular/core';
import { ApiService } from '../../../shared/api.service';
import { Observable } from 'rxjs';
import { AppraisalHeader, AppraisalVM, Course } from './appraisal.models';

@Injectable({ providedIn: 'root' })
export class AppraisalService {
  constructor(private api: ApiService) {}

  getAppraisals(): Observable<AppraisalHeader[]> {
    return this.api.get<AppraisalHeader[]>('/api/Campus/studentappraisalheader/GetAll');
  }

  getAppraisalByStudno(studno: string): Observable<any[]> {
    return this.api.get<any[]>('/api/Campus/studentappraisalheader/GetDataByStudno', { Studno: studno });
  }

  getParamsByCourse(courseid: number, studno: string): Observable<any[]> {
    return this.api.post<any[]>('/api/Campus/studentappraisalheader/GetParaByCourse', { Courseid: courseid, Studno: studno });
  }

  saveAppraisal(vm: AppraisalVM, username: string): Observable<any> {
    return this.api.post(`/api/Campus/studentappraisalheader/Save?Username=${encodeURIComponent(username)}`, vm);
  }

  getCourses(): Observable<Course[]> {
    return this.api.get<Course[]>('/api/Store/CoursesAPI/GetDatas');
  }
}

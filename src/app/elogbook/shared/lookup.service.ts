import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  constructor(private apiService: ApiService) {}

  getSubjectsByEmpid(empid: string): Observable<any[]> {
    return this.apiService.get('/api/Campus/SubMstAPI/SubjListbyEmpid', {
      Inst_id: 1,
      Empid: empid
    });
  }

  getStudentsByCourse(subjectId: number): Observable<any[]> {
    return this.apiService.post('/api/Campus/StudentsAPI/StudListbyCourse', {
      Subject_id: subjectId
    });
  }

  getAllStudents(): Observable<any[]> {
    return this.apiService.get('/api/Campus/StudentsAPI/GetList1', {
      Inst_id: -1
    });
  }

  getCodeList(codenm: string): Observable<any[]> {
    return this.apiService.get('/api/Common/CodemastsAPI/GetCodeListbyCodenm', {
      codenm: codenm
    });
  }

  getCodeListById(codenm: string): Observable<any[]> {
    return this.apiService.get('/api/Common/CodemastsAPI/GetCodeListIdbyCodenm', {
      codenm: codenm
    });
  }

  getFacultyBySubject(subjectId: number): Observable<any[]> {
    return this.apiService.get('/api/ECampusAPI/FacListbySubj_Id1', {
      Subject_id: subjectId
    });
  }

  getCourses(): Observable<any[]> {
    return this.apiService.get('/api/Store/CoursesAPI/GetDatas');
  }

  getSectionsBySubject(subjectId: number): Observable<any[]> {
    return this.apiService.get('/api/Campus/subgroupsAPI/GetList', {
      SubgroupType: 'Section',
      Subject_id: subjectId
    });
  }
}

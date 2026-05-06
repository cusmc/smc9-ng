import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/api.service';
import { ExamMast, Course, Subject, Section } from './exam-master.models';

@Injectable({
  providedIn: 'root'
})
export class ExamMasterService {
  constructor(private apiService: ApiService) {}

  getExams(): Observable<ExamMast[]> {
    return this.apiService.get<ExamMast[]>('/api/Campus/exammastsAPI/GetDatas1');
  }

  getExamById(id: number): Observable<ExamMast> {
    return this.apiService.get<ExamMast>('/api/Campus/exammastsAPI/GetDatabyId', { id });
  }

  saveExam(exam: ExamMast): Observable<any> {
    return this.apiService.post<any>('/api/Campus/exammastsAPI/SaveData', exam);
  }

  deleteExam(id: number): Observable<any> {
    return this.apiService.get<any>('/api/Campus/exammastsAPI/DeleteData', { id });
  }

  getCourses(): Observable<Course[]> {
    return this.apiService.get<Course[]>('/api/Store/CoursesAPI/GetDatas');
  }

  getCourseById(id: number): Observable<Course & { subjects: Subject[] }> {
    return this.apiService.get<Course & { subjects: Subject[] }>('/api/Store/CoursesAPI/GetDataById', { id });
  }

  getSubjectsByCourse(courseId: number): Observable<Subject[]> {
    return this.apiService.get<Subject[]>('/api/Campus/subjectsAPI/GetListbyCourse', { Course_id: courseId });
  }

  getSectionsBySubject(subjectId: number): Observable<Section[]> {
    return this.apiService.get<Section[]>('/api/Campus/subgroupsAPI/GetList', {
      SubgroupType: 'Section',
      Subject_id: subjectId
    });
  }
}

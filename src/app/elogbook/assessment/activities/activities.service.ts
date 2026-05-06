import { Injectable } from '@angular/core';
import { ApiService } from '../../../shared/api.service';
import { Observable } from 'rxjs';
import { Activity, ActivityDashboard, Student } from './activities.models';

@Injectable({
  providedIn: 'root',
})
export class ActivitiesService {
  constructor(private apiService: ApiService) {}

  getActivities(
    empid: string,
    studno?: string,
    subjectId?: number,
  ): Observable<ActivityDashboard[]> {
    const params: any = {
      Empid: empid,
      Activitytype_id: 'null', // literal string 'null' — backend treats it as no-filter
    };
    if (studno) params.Studno = studno;
    if (subjectId) params.Subject_id = subjectId;
    return this.apiService.get<ActivityDashboard[]>(
      '/api/Campus/activitiessAPI/ActivityListbyEmpid',
      params,
    );
  }

  saveActivity(activity: Activity): Observable<any> {
    return this.apiService.post(
      '/api/Campus/activitiessAPI/SaveData',
      activity,
    );
  }

  revertActivity(activity: Activity): Observable<any> {
    return this.apiService.post(
      '/api/Campus/activitiessAPI/RevertStatus',
      activity,
    );
  }

  getStudentDetail(id: string): Observable<Student> {
    return this.apiService.get<Student>('/api/Campus/StudentsAPI/GetStudent', {
      id: id,
    });
  }
}

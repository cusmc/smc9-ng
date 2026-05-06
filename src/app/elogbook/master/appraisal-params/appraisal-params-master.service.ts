import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/api.service';
import { AppraisalParameter } from './appraisal-params-master.models';

@Injectable({
  providedIn: 'root'
})
export class AppraisalParametersMasterService {
  constructor(private apiService: ApiService) {}

  getParameters(): Observable<AppraisalParameter[]> {
    return this.apiService.get<AppraisalParameter[]>('/api/Campus/appraisalparamaster/GetAll');
  }

  getParameterById(id: number): Observable<AppraisalParameter> {
    return this.apiService.get<AppraisalParameter>('/api/Campus/appraisalparamaster/GetById', { id });
  }

  saveParameter(parameter: AppraisalParameter): Observable<any> {
    return this.apiService.post<any>('/api/Campus/appraisalparamaster/Save', parameter);
  }

  deleteParameter(id: number): Observable<any> {
    return this.apiService.get<any>('/api/Campus/appraisalparamaster/Delete', { id });
  }

  importParameters(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.post<any>('/api/Campus/appraisalparamaster/Import', formData);
  }
}

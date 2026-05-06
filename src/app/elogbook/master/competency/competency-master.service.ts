import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/api.service';
import { Competency } from './competency-master.models';

@Injectable({
  providedIn: 'root'
})
export class CompetencyMasterService {
  constructor(private apiService: ApiService) {}

  getCompetencies(subjectId: number): Observable<Competency[]> {
    return this.apiService.get<Competency[]>('/api/Campus/competenciessAPI/GetDatas', { Subject_id: subjectId });
  }

  getCompetencyById(id: number): Observable<Competency> {
    return this.apiService.get<Competency>('/api/Campus/competenciessAPI/GetDataById', { id });
  }

  saveCompetency(competency: Competency): Observable<any> {
    return this.apiService.post<any>('/api/Campus/competenciessAPI/SaveData', competency);
  }

  deleteCompetency(id: number): Observable<any> {
    return this.apiService.get<any>('/api/Campus/competenciessAPI/DeleteData', { id });
  }

  importCompetencies(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.post<any>('/api/Campus/competenciessAPI/ImportCompetencie', formData);
  }

  addSection(section: any): Observable<any> {
    return this.apiService.post<any>('/api/Campus/subgroupsAPI/SaveData', section);
  }
}

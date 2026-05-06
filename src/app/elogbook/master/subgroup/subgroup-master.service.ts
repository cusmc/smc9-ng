import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/api.service';
import { Subgroup } from './subgroup-master.models';

@Injectable({
  providedIn: 'root'
})
export class SubgroupMasterService {
  constructor(private apiService: ApiService) {}

  getSubgroups(type: string, subject_id: number): Observable<Subgroup[]> {
    return this.apiService.get<Subgroup[]>('/api/Campus/subgroupsAPI/GetDatas', {
      Group: type,
      Subject_id: subject_id
    });
  }

  getSubgroupById(id: number): Observable<Subgroup> {
    return this.apiService.get<Subgroup>('/api/Campus/subgroupsAPI/GetDataById', { id });
  }

  saveSubgroup(subgroup: Subgroup): Observable<any> {
    return this.apiService.post<any>('/api/Campus/subgroupsAPI/SaveData', subgroup);
  }

  deleteSubgroup(id: number): Observable<any> {
    return this.apiService.get<any>('/api/Campus/subgroupsAPI/DeleteData', { id });
  }
}

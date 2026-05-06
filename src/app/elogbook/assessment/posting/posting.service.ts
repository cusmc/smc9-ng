import { Injectable } from '@angular/core';
import { ApiService } from '../../../shared/api.service';
import { Observable } from 'rxjs';
import { PostingRow, Speciality, Faculty } from './posting.models';

@Injectable({ providedIn: 'root' })
export class PostingService {
  constructor(private api: ApiService) {}

  getPostings(subjectId: number): Observable<PostingRow[]> {
    return this.api.get<PostingRow[]>('/api/Campus/postingssAPI/GetDatas', { Subject_id: subjectId });
  }

  getPostingsByStudno(studno: string): Observable<PostingRow[]> {
    return this.api.get<PostingRow[]>('/api/Campus/postingssAPI/GetDataByStudno', { Studno: studno });
  }

  getSpecialities(subjectId: number): Observable<Speciality[]> {
    return this.api.get<Speciality[]>('/api/Campus/subgroupsAPI/GetList', {
      SubgroupType: 'Speciality',
      Subject_id: subjectId
    });
  }

  saveSpeciality(subgroupNm: string, subjectId: number): Observable<any> {
    return this.api.post('/api/Campus/subgroupsAPI/SaveData', {
      Subgroup_nm: subgroupNm,
      Subject_id: subjectId,
      Subgroup_type: 'Speciality'
    });
  }

  savePostings(rows: PostingRow[]): Observable<any> {
    return this.api.post('/api/Campus/postingssAPI/SaveData', rows);
  }
}

import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import {
  PerfRow, PerfRequest, CompareRequest, CompareSeries, LookupItem,
} from './hosp-perf.models';

const BASE = '/api/jMedilan/HospPerfAPI';

@Injectable({ providedIn: 'root' })
export class HospPerfService {
  constructor(private api: ApiService) {}

  getSummary(req: PerfRequest): Observable<PerfRow[]> {
    return this.api.post<PerfRow[]>(`${BASE}/GetSummary`, req);
  }

  compare(req: CompareRequest): Observable<CompareSeries[]> {
    return this.api.post<CompareSeries[]>(`${BASE}/Compare`, req);
  }

  loadLookups(): Observable<{ depts: LookupItem[]; doctors: LookupItem[] }> {
    return forkJoin({
      depts:   this.api.get<LookupItem[]>('/api/HMSAPI/getHDepts'),
      doctors: this.api.get<LookupItem[]>('/api/jMedilan/DoctmastsAPI/GetAllDoctList'),
    });
  }
}

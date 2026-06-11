import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import {
  DashboardBundle,
  DailySummary,
  DeptDetail,
  InvestigationItem,
  PhysioItem,
  SurgeonItem,
} from './dashboard.models';

const BASE = '/api/jMedilan/HdashboardsAPI';

@Injectable({ providedIn: 'root' })
export class HimsDashboardService {
  constructor(private api: ApiService) {}

  // fromDate param is reserved for when SP supports date range — pass only toDate for now
  loadAll(toDate: string /*, fromDate?: string */): Observable<DashboardBundle> {
    return forkJoin({
      summary:        this.api.post<DailySummary[]>        (`${BASE}/hDashboardDt`,  { Tdate: toDate, Type: 'DA' }),
      deptDetails:    this.api.post<DeptDetail[]>           (`${BASE}/hDashboardDt`,  { Tdate: toDate, Type: 'DD' }),
      investigations: this.api.post<InvestigationItem[]>    (`${BASE}/hDashboardIDt`, { Tdate: toDate }),
      physio:         this.api.post<PhysioItem[]>           (`${BASE}/hDashboardPhy`, { Tdate: toDate }),
      surgeons:       this.api.post<SurgeonItem[]>          (`${BASE}/hDashboardSS`,  { Tdate: toDate }),
    });
  }
}

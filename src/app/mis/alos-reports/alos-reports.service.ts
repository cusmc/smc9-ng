import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import {
  DeptAlosRow, DischargeStatusRow, IcuAlosRow, MonthlyTrendRow,
  DoctorAlosRow, BedCategoryAlosRow, UnitAlosRow,
} from './alos-reports.models';

const BASE = '/api/jMedilan/QualityIndicatorsAPI';

@Injectable({ providedIn: 'root' })
export class AlosReportsService {
  constructor(private api: ApiService) {}

  getDeptWiseAlos(fromDate: string, toDate: string): Observable<DeptAlosRow[]> {
    return this.api.get<DeptAlosRow[]>(`${BASE}/GetDeptWiseAlosNabh`, { fromDate, toDate });
  }

  getDischargeStatusRates(fromDate: string, toDate: string, deptId: number | null = null): Observable<DischargeStatusRow[]> {
    return this.api.get<DischargeStatusRow[]>(`${BASE}/GetDischargeStatusRates`, { fromDate, toDate, deptId });
  }

  getIcuAlos(fromDate: string, toDate: string): Observable<IcuAlosRow[]> {
    return this.api.get<IcuAlosRow[]>(`${BASE}/GetIcuAlos`, { fromDate, toDate });
  }

  getMonthlyTrend(year: number): Observable<MonthlyTrendRow[]> {
    return this.api.get<MonthlyTrendRow[]>(`${BASE}/GetMonthlyTrendNabh`, { year });
  }

  getDoctorWiseAlos(fromDate: string, toDate: string, deptId: number | null = null): Observable<DoctorAlosRow[]> {
    return this.api.get<DoctorAlosRow[]>(`${BASE}/GetDoctorWiseAlos`, { fromDate, toDate, deptId });
  }

  getBedCategoryAlos(fromDate: string, toDate: string): Observable<BedCategoryAlosRow[]> {
    return this.api.get<BedCategoryAlosRow[]>(`${BASE}/GetBedCategoryAlos`, { fromDate, toDate });
  }

  getUnitWiseAlos(fromDate: string, toDate: string): Observable<UnitAlosRow[]> {
    return this.api.get<UnitAlosRow[]>(`${BASE}/GetUnitWiseAlos`, { fromDate, toDate });
  }
}

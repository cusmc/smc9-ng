import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';

export interface MealTypeItem {
  Subcode_id: number;
  Cd: string;
  Vals: string;
  Ftime: number | null;
  Ttime: number | null;
}

export interface ScanResult {
  empid: number;
  empnm: string;
  deptnm: string;
  desgnm: string;
}

export interface CanteenTxn {
  pk_id: number;
  empid: number;
  subcode_id: number;
  txnDate: string;
  txnDateTime: string;
  canteenRate_Pk_id: number;
  amount: number;
}

export interface CanteenRate {
  pk_id: number;
  rate_id: number;
  subcode_id: number;
  rate: number;
  wef_dt: string;
  valid_upto: string | null;
  prev_pk_id: number | null;
  status: 'P' | 'A' | 'R';
  created_by: string;
  created_dt: string;
  auth_by: string | null;
  auth_dt: string | null;
  remarks: string | null;
  inst_id: number | null;
}

export interface FoodDedRow {
  empid: number;
  foodDed: number;
}

const BASE = '/api/HR/Canteen';
const CODELIST_BASE = '/api/Common/CodemastsAPI';

@Injectable({ providedIn: 'root' })
export class CanteenService {
  constructor(private api: ApiService) {}

  getMealTypes(): Observable<MealTypeItem[]> {
    return this.api.get<MealTypeItem[]>(`${CODELIST_BASE}/GetCodeListbyCodenm`, { codenm: 'MEALTYPE' });
  }

  scanLookup(token: string): Observable<ScanResult> {
    return this.api.get<ScanResult>(`${BASE}/ScanLookup`, { token });
  }

  recordMeal(empid: number, subcodeId: number): Observable<CanteenTxn> {
    return this.api.post<CanteenTxn>(`${BASE}/RecordMeal?empid=${empid}&subcodeId=${subcodeId}`, {});
  }

  getEmployeeQr(empid: number) {
    return this.api.getBlob(`${BASE}/GetEmployeeQr`, { empid });
  }

  getAllRates(): Observable<CanteenRate[]> {
    return this.api.get<CanteenRate[]>(`${BASE}/GetAllRates`);
  }

  getRateById(pkId: number): Observable<CanteenRate> {
    return this.api.get<CanteenRate>(`${BASE}/GetRateById`, { pkId });
  }

  saveRate(rate: Partial<CanteenRate>): Observable<number> {
    return this.api.post<number>(`${BASE}/SaveRate`, rate);
  }

  authRate(pkId: number): Observable<any> {
    return this.api.post<any>(`${BASE}/AuthRate?pkId=${pkId}`, {});
  }

  rejectRate(pkId: number, remarks: string): Observable<any> {
    return this.api.post<any>(`${BASE}/RejectRate?pkId=${pkId}&remarks=${encodeURIComponent(remarks)}`, {});
  }

  getFoodDeductionReport(fromDate: string, toDate: string): Observable<FoodDedRow[]> {
    return this.api.get<FoodDedRow[]>(`${BASE}/GetFoodDeductionReport`, { fromDate, toDate });
  }
}

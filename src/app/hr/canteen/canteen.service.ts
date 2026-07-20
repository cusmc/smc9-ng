import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../shared/api.service';

export interface MealTypeItem {
  Subcode_id: number;
  Cd: string;
  Vals: string;
  Ftime: number | null;
  Ttime: number | null;
}

// These four map JSON returned by CanteenController's own actions, which serialize
// real C# DTOs/entities (DataLibrary.Models.Attend.*) via Web API's default
// JsonFormatter - no CamelCasePropertyNamesContractResolver is configured anywhere
// in this project, so the PascalCase C# property names go out as-is. This is a
// different situation from MealTypeItem above, which comes from a raw ADO
// DataTable endpoint whose casing follows the physical SQL schema instead.
export interface ScanResult {
  Empid: number;
  Empnm: string;
  Deptnm: string;
  Desgnm: string;
  IsActive: boolean;
}

export interface CanteenTxn {
  Pk_id: number;
  Empid: number;
  Subcode_id: number;
  TxnDate: string;
  TxnDateTime: string;
  CanteenRate_Pk_id: number;
  Amount: number;
}

export interface CanteenRate {
  Pk_id: number;
  Rate_id: number;
  Subcode_id: number;
  Rate: number;
  Wef_dt: string;
  Valid_upto: string | null;
  Prev_pk_id: number | null;
  Status: 'P' | 'A' | 'R';
  Created_by: string;
  Created_dt: string;
  Auth_by: string | null;
  Auth_dt: string | null;
  Remarks: string | null;
  Inst_id: number | null;
}

export interface FoodDedRow {
  Empid: number;
  FoodDed: number;
}

const BASE = '/api/HR/Canteen';
const CODELIST_BASE = '/api/Common/CodemastsAPI';

function pickField(row: any, fieldNameLower: string): any {
  const key = Object.keys(row).find((k) => k.toLowerCase() === fieldNameLower);
  return key ? row[key] : undefined;
}

@Injectable({ providedIn: 'root' })
export class CanteenService {
  constructor(private api: ApiService) {}

  getMealTypes(): Observable<MealTypeItem[]> {
    // GetCodeListbyCodenm returns a raw ADO DataTable (bypasses EF), so its JSON key
    // casing follows the physical SQL column names rather than any C# convention -
    // pick fields case-insensitively instead of assuming a specific casing.
    return this.api.get<any[]>(`${CODELIST_BASE}/GetCodeListbyCodenm`, { codenm: 'MEALTYPE' }).pipe(
      map((rows) => rows.map((r) => ({
        Subcode_id: Number(pickField(r, 'subcode_id')),
        Cd: pickField(r, 'cd'),
        Vals: pickField(r, 'vals'),
        Ftime: pickField(r, 'ftime') != null ? Number(pickField(r, 'ftime')) : null,
        Ttime: pickField(r, 'ttime') != null ? Number(pickField(r, 'ttime')) : null,
      }))),
    );
  }

  // Empmast.Empid IS the 6-digit campus-wide ID printed/QR-encoded on every ID
  // card - a genuine QR scan and the manual-entry fallback both resolve to this
  // same Empid, so both paths call this one lookup. No token/signature involved.
  lookupEmployee(empid: number): Observable<ScanResult> {
    return this.api.get<ScanResult>(`${BASE}/Lookup`, { empid });
  }

  recordMeal(empid: number, subcodeId: number, entryMethod: 'QR' | 'MANUAL'): Observable<CanteenTxn> {
    return this.api.post<CanteenTxn>(`${BASE}/RecordMeal?empid=${empid}&subcodeId=${subcodeId}&entryMethod=${entryMethod}`, {});
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

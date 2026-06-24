import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ApiService } from '../shared/api.service';

export interface FirmYearItem {
  Fyear: string;     // e.g. '2026-27'
  Firmx: string;     // e.g. '0001'
  Firmname: string;  // e.g. 'RAJ'
}

export interface FirmOption {
  id: string;   // Firmx
  nm: string;   // Firmname
}

export interface YearOption {
  id: string;   // first 4 chars of Fyear — used as @Yrx in SPs
  nm: string;   // full Fyear label e.g. '2026-27'
}

@Injectable({ providedIn: 'root' })
export class PhSharedService {
  private firmYears$: Observable<FirmYearItem[]>;

  constructor(private api: ApiService) {
    // Fetched once per app session; all subscribers share the same response.
    this.firmYears$ = this.api
      .get<FirmYearItem[]>('/api/Pharmacy/PhCommonAPI/GetFirmYears')
      .pipe(shareReplay(1));
  }

  getFirmYears(): Observable<FirmYearItem[]> {
    return this.firmYears$;
  }

  /** Unique firms from the full list, in arrival order. */
  toFirmOptions(data: FirmYearItem[]): FirmOption[] {
    const seen = new Set<string>();
    return data
      .filter(x => !seen.has(x.Firmx) && seen.add(x.Firmx))
      .map(x => ({ id: x.Firmx, nm: x.Firmname }));
  }

  /** Years for a given firm, latest first. */
  toYearOptions(data: FirmYearItem[], firmx: string): YearOption[] {
    return data
      .filter(x => x.Firmx === firmx)
      .sort((a, b) => b.Fyear.localeCompare(a.Fyear))
      .map(x => ({ id: x.Fyear.substring(0, 4), nm: x.Fyear }));
  }

  /** Returns YYYY-MM-DD string for today — use as default date input value. */
  today(): string {
    return new Date().toISOString().split('T')[0];
  }
}

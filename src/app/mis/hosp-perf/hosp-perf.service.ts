import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import {
  PerfRow, PerfRequest, CompareRequest, CompareSeries, LookupItem,
} from './hosp-perf.models';

const BASE = '/api/jMedilan/HospPerfAPI';

export interface ExcelExportReq {
  Title:   string;
  Headers: string[];
  Rows:    ExcelExportRow[];
}

export interface ExcelExportRow {
  Label:      string;
  Values:     number[];
  IsTotal:    boolean;
  IsCurrency: boolean;
  IsSection:  boolean;
}

@Injectable({ providedIn: 'root' })
export class HospPerfService {
  constructor(private api: ApiService) {}

  getSummary(req: PerfRequest): Observable<PerfRow[]> {
    return this.api.post<PerfRow[]>(`${BASE}/GetSummary`, req);
  }

  compare(req: CompareRequest): Observable<CompareSeries[]> {
    return this.api.post<CompareSeries[]>(`${BASE}/Compare`, req);
  }

  loadLookups(): Observable<{ depts: LookupItem[]; doctors: LookupItem[]; subdepts: LookupItem[] }> {
    return forkJoin({
      depts:    this.api.get<LookupItem[]>('/api/HMSAPI/getHDepts'),
      doctors:  this.api.get<LookupItem[]>('/api/jMedilan/DoctmastsAPI/GetAllDoctList'),
      subdepts: this.api.get<LookupItem[]>('/api/jMedilan/hSubdeptsAPI/GetData_Drp1?id=0'),
    });
  }

  exportPdf(html: string): Observable<{ url: string }> {
    return this.api.post<{ url: string }>(`${BASE}/ExportPDF`, { Html: html });
  }

  exportExcel(req: ExcelExportReq): Observable<{ url: string }> {
    return this.api.post<{ url: string }>(`${BASE}/ExportExcel`, req);
  }
}

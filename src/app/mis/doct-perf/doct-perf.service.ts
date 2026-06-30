import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import { DoctPerfReq, PerfRow, DoctPerfRow, LookupItem, CategoryItem } from './doct-perf.models';

const BASE = '/api/jMedilan/DoctPerfAPI';

export interface ExcelExportRow {
  Label:      string;
  Values:     number[];
  IsTotal:    boolean;
  IsCurrency: boolean;
  IsSection:  boolean;
}

export interface ExcelExportReq {
  Title:   string;
  Headers: string[];
  Rows:    ExcelExportRow[];
}

@Injectable({ providedIn: 'root' })
export class DoctPerfService {
  constructor(private api: ApiService) {}

  getSummary(req: DoctPerfReq): Observable<PerfRow[]> {
    return this.api.post<PerfRow[]>(`${BASE}/GetSummary`, req);
  }

  getDoctorWise(req: DoctPerfReq): Observable<DoctPerfRow[]> {
    return this.api.post<DoctPerfRow[]>(`${BASE}/GetDoctorWise`, req);
  }

  loadLookups(): Observable<{
    depts:      LookupItem[];
    doctors:    LookupItem[];
    subdepts:   LookupItem[];
    categories: CategoryItem[];
  }> {
    return forkJoin({
      depts:      this.api.get<LookupItem[]>('/api/HMSAPI/getHDepts'),
      doctors:    this.api.get<LookupItem[]>('/api/jMedilan/DoctmastsAPI/GetAllDoctList'),
      subdepts:   this.api.get<LookupItem[]>('/api/jMedilan/hSubdeptsAPI/GetData_Drp1?id=0'),
      categories: this.api.get<CategoryItem[]>('/api/Common/CodemastsAPI/GetCodeListbyCodenm', { codenm: 'Category' }),
    });
  }

  exportPdf(html: string): Observable<{ url: string }> {
    return this.api.post<{ url: string }>(`${BASE}/ExportPDF`, { Html: html });
  }

  exportExcel(req: ExcelExportReq): Observable<{ url: string }> {
    return this.api.post<{ url: string }>(`${BASE}/ExportExcel`, req);
  }
}

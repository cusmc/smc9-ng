import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import { FactSheetResponse } from './fact-sheet.models';

const BASE = '/api/jMedilan/FactSheetAPI';

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
export class FactSheetService {
  constructor(private api: ApiService) {}

  getNumbers(fromDate: string, toDate: string): Observable<FactSheetResponse> {
    return this.api.get<FactSheetResponse>(`${BASE}/GetNumbers`, { fromDate, toDate });
  }

  exportPdf(html: string): Observable<{ url: string }> {
    return this.api.post<{ url: string }>(`${BASE}/ExportPDF`, { Html: html });
  }

  exportExcel(req: ExcelExportReq): Observable<{ url: string }> {
    return this.api.post<{ url: string }>(`${BASE}/ExportExcel`, req);
  }
}

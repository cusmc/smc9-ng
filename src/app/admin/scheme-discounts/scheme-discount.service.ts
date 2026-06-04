import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import { SchemeItem, DropdownItem, SchDiscountRow, SchDiscountSaveDto } from './scheme-discount.models';

const BASE = '/api/jMedilan/SchDiscountAPI';

@Injectable({ providedIn: 'root' })
export class SchemeDiscountService {
  constructor(private api: ApiService) {}

  getSchemeList(): Observable<SchemeItem[]> {
    return this.api.get<SchemeItem[]>('/api/jMedilan/schmastsAPI/GetList');
  }

  getSgroupList(): Observable<DropdownItem[]> {
    return this.api.get<DropdownItem[]>('/api/jMedilan/SgroupsAPI/GetDatas_Dropdown');
  }

  getHeadList(): Observable<DropdownItem[]> {
    return this.api.get<DropdownItem[]>('/api/jMedilan/HeadmastsAPI/GetDatas_Dropdown');
  }

  getByScheme(schmastId: number): Observable<SchDiscountRow[]> {
    return this.api.get<SchDiscountRow[]>(`${BASE}/GetByScheme`, { schmast_id: schmastId });
  }

  getById(id: number): Observable<SchDiscountRow> {
    return this.api.get<SchDiscountRow>(`${BASE}/GetDatabyId`, { id });
  }

  save(data: SchDiscountSaveDto): Observable<any> {
    return this.api.post<any>(`${BASE}/SaveData`, data);
  }

  remove(id: number): Observable<any> {
    return this.api.post<any>(`${BASE}/DeleteData?id=${id}`, {});
  }
}

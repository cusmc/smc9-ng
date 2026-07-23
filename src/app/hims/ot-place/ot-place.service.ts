import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import { AcItem } from '../../shared/autocomplete/autocomplete.component';
import { Otplace, OprTableRow } from './ot-place.models';

const ROOM_BASE = '/api/jMedilan/otPlaceAPI';
const TABLE_BASE = '/api/jMedilan/OprTablesAPI';

@Injectable({ providedIn: 'root' })
export class OtPlaceService {
  constructor(private api: ApiService) {}

  // Rooms (Otplace)
  getAll(): Observable<Otplace[]> {
    return this.api.get<Otplace[]>(`${ROOM_BASE}/GetDatas1`);
  }

  getById(id: number): Observable<Otplace> {
    return this.api.get<Otplace>(`${ROOM_BASE}/GetDataById`, { id });
  }

  save(data: Partial<Otplace>): Observable<number> {
    return this.api.post<number>(`${ROOM_BASE}/SaveData`, data);
  }

  delete(id: number): Observable<any> {
    return this.api.post<any>(`${ROOM_BASE}/DeleteData?id=${id}`, null);
  }

  // Tables (OprTable + OtPlaceDept, synced server-side)
  getTablesByOtplaceId(otplaceId: number): Observable<OprTableRow[]> {
    return this.api.get<OprTableRow[]>(`${TABLE_BASE}/GetTablesByOtplaceId`, { otplaceId });
  }

  saveTable(row: Partial<OprTableRow>): Observable<number> {
    return this.api.post<number>(`${TABLE_BASE}/SaveData`, row);
  }

  deleteTable(id: number): Observable<any> {
    return this.api.post<any>(`${TABLE_BASE}/DeleteData?id=${id}`, null);
  }

  // Departments lookup
  getDepts(): Observable<AcItem[]> {
    return this.api.get<AcItem[]>('/api/HMSAPI/getHDepts');
  }
}

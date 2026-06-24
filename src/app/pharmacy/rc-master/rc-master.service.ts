import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import { IdNm, RcMastListItem, RcMastSaveDto } from './rc-master.models';

@Injectable({ providedIn: 'root' })
export class RcMasterService {
  private base = '/api/Pharmacy/rcmastsAPI';

  constructor(private api: ApiService) {}

  getList(firm: string): Observable<RcMastListItem[]> {
    return this.api.get<RcMastListItem[]>(`${this.base}/GetDatas`, { firm });
  }

  getById(firm: string, id: number): Observable<RcMastSaveDto> {
    return this.api.get<RcMastSaveDto>(`${this.base}/GetDatabyId1`, { firm, id });
  }

  save(firm: string, dto: RcMastSaveDto): Observable<number> {
    return this.api.post<number>(`${this.base}/SaveData1?firm=${encodeURIComponent(firm)}`, dto);
  }

  delete(firm: string, id: number): Observable<number> {
    return this.api.get<number>(`${this.base}/DeleteData`, { firm, id });
  }

  getMfgList(firm: string): Observable<IdNm[]> {
    return this.api.get<IdNm[]>(`${this.base}/GetMfgList_Drp`, { firm });
  }

  getPartyList(firm: string): Observable<IdNm[]> {
    return this.api.get<IdNm[]>('/api/Pharmacy/PoRegisterAPI/GetPartyList', { firm });
  }

  getProductList(firm: string): Observable<IdNm[]> {
    return this.api.get<IdNm[]>('/api/Pharmacy/PoRegisterAPI/GetProductList', { firm });
  }

  getRcTypeList(): Observable<IdNm[]> {
    return this.api.get<IdNm[]>('/api/Common/CodemastsAPI/GetCodeListIdbyCodenm', { codenm: 'RCTYPE' });
  }
}

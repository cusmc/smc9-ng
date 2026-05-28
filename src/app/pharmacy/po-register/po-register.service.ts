import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import { MfgItem, PartyItem, PoListItem, PrintRegBody, ProductItem } from './po-register.models';

@Injectable({ providedIn: 'root' })
export class PoRegisterService {
  constructor(private api: ApiService) {}

  getDatas(firm: string, year: string, status: string, prodId: number, partyId: number, mfgId: number): Observable<PoListItem[]> {
    return this.api.get<PoListItem[]>('/api/Pharmacy/PoRegisterAPI/GetDatas', {
      firm, year, status, prodId, partyId, mfgId
    });
  }

  getMfgList(firm: string): Observable<MfgItem[]> {
    return this.api.get<MfgItem[]>('/api/Pharmacy/PoRegisterAPI/GetMfgList', { firm });
  }

  getPartyList(firm: string): Observable<PartyItem[]> {
    return this.api.get<PartyItem[]>('/api/Pharmacy/PoRegisterAPI/GetPartyList', { firm });
  }

  getProductList(firm: string): Observable<ProductItem[]> {
    return this.api.get<ProductItem[]>('/api/Pharmacy/PoRegisterAPI/GetProductList', { firm });
  }

  printReg(body: PrintRegBody): Observable<string> {
    return this.api.post<string>('/api/Pharmacy/PoRegisterAPI/PrintReg', body);
  }
}

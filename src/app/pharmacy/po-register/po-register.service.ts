import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import { MfgItem, PoListItem, PrintRegBody } from './po-register.models';

@Injectable({ providedIn: 'root' })
export class PoRegisterService {
  constructor(private api: ApiService) {}

  getFirm(): Observable<string> {
    return this.api.get<string>('/api/Pharmacy/PoRegisterAPI/GetFirm');
  }

  setFirm(firm: string): Observable<string> {
    return this.api.post<string>(`/api/Pharmacy/PoRegisterAPI/SetFirm?firm=${encodeURIComponent(firm)}`, null);
  }

  getDatas(status: string, mfgId: number): Observable<PoListItem[]> {
    return this.api.get<PoListItem[]>('/api/Pharmacy/PoRegisterAPI/GetDatas', {
      status,
      prodId: 0,
      partyId: 0,
      mfgId
    });
  }

  getMfgList(): Observable<MfgItem[]> {
    return this.api.get<MfgItem[]>('/api/Pharmacy/PoRegisterAPI/GetMfgList');
  }

  printReg(body: PrintRegBody): Observable<string> {
    return this.api.post<string>('/api/Pharmacy/PoRegisterAPI/PrintReg', body);
  }
}

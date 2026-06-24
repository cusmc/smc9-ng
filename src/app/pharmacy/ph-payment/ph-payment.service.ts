import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import { AcTranRow, PayDetailRow, PhSendRequest, PhNotifyResult } from './ph-payment.models';

const BASE = '/api/Pharmacy/PhPaymentAPI';

@Injectable({ providedIn: 'root' })
export class PhPaymentService {
  constructor(private api: ApiService) {}

  getTranList(firmx: string, yrx: string, fdate: string, tdate: string): Observable<AcTranRow[]> {
    return this.api.get<AcTranRow[]>(`${BASE}/GetTranList`, { firmx, yrx, fdate, tdate });
  }

  getDetail(firmx: string, yrx: string, tranId: number): Observable<PayDetailRow[]> {
    return this.api.get<PayDetailRow[]>(`${BASE}/GetDetail`, { firmx, yrx, tranId });
  }

  sendNotification(req: PhSendRequest): Observable<PhNotifyResult[]> {
    return this.api.post<PhNotifyResult[]>(`${BASE}/SendNotification`, req);
  }
}

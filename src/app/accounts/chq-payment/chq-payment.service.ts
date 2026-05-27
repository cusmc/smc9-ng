import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import {
  LotListItem, ChqSummaryRow, ChqDetailRow,
  SendNotificationRequest, NotifyResult
} from './chq-payment.models';

const BASE = '/api/Acc/ChqPrnAPI';

@Injectable({ providedIn: 'root' })
export class ChqPaymentService {
  constructor(private api: ApiService) {}

  getLotList(): Observable<LotListItem[]> {
    return this.api.get<LotListItem[]>(`${BASE}/GetLotList`);
  }

  getSummary(lotId: number): Observable<ChqSummaryRow[]> {
    return this.api.get<ChqSummaryRow[]>(`${BASE}/GetChqSummary`, { lotId });
  }

  getDetail(lotId: number): Observable<ChqDetailRow[]> {
    return this.api.get<ChqDetailRow[]>(`${BASE}/GetChqDetail`, { lotId });
  }

  sendNotification(req: SendNotificationRequest): Observable<NotifyResult[]> {
    return this.api.post<NotifyResult[]>(`${BASE}/SendNotification`, req);
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import { DischargeQueueItem } from './discharge-queue.models';

export interface DischargeQueueFilter {
  disFdate?: string | null;
  disTdate?: string | null;
  nustno?:   number | null;
  doctId?:   number | null;
  unit?:     string | null;
}

@Injectable({ providedIn: 'root' })
export class DischargeQueueService {
  constructor(private api: ApiService) {}

  getQueue(filter: DischargeQueueFilter = {}): Observable<DischargeQueueItem[]> {
    const params: Record<string, any> = { Type: 'Pharmacy' };
    if (filter.disFdate != null) params['DisFdate'] = filter.disFdate;
    if (filter.disTdate != null) params['DisTdate'] = filter.disTdate;
    if (filter.nustno   != null) params['Nustno']   = filter.nustno;
    if (filter.doctId   != null) params['DoctId']   = filter.doctId;
    if (filter.unit     != null) params['Unit']      = filter.unit;
    return this.api.get<DischargeQueueItem[]>('/api/IndMastsAPI/GetDischargeQueue', params);
  }
}

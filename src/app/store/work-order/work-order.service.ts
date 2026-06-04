import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import {
  DeptItem,
  PartyItem,
  ProductItem,
  TenderItem,
  WorkOrderDetailDto,
  WorkOrderListItem,
  WorkOrderSaveDto
} from './work-order.models';

@Injectable({ providedIn: 'root' })
export class WorkOrderService {
  constructor(private api: ApiService) {}

  getList(fromDt: string, toDt: string, partyId: number, status: string): Observable<WorkOrderListItem[]> {
    return this.api.get<WorkOrderListItem[]>('/api/Store/WorkOrderAPI/GetList', { fromDt, toDt, partyId, status });
  }

  getById(id: number): Observable<WorkOrderDetailDto> {
    return this.api.get<WorkOrderDetailDto>(`/api/Store/WorkOrderAPI/GetById/${id}`);
  }

  getNextWoNo(): Observable<number> {
    return this.api.get<number>('/api/Store/WorkOrderAPI/GetNextWoNo');
  }

  save(dto: WorkOrderSaveDto): Observable<{ Pk_id: number; Entryno: number }> {
    return this.api.post('/api/Store/WorkOrderAPI/Save', dto);
  }

  update(id: number, dto: WorkOrderSaveDto): Observable<void> {
    return this.api.put(`/api/Store/WorkOrderAPI/Update/${id}`, dto);
  }

  remove(id: number): Observable<void> {
    return this.api.delete(`/api/Store/WorkOrderAPI/Delete/${id}`);
  }

  getPartyList(): Observable<PartyItem[]> {
    return this.api.get<PartyItem[]>('/api/PartymasAPI/GetData');
  }

  getProductList(): Observable<ProductItem[]> {
    return this.api.get<ProductItem[]>('/api/Store/WorkOrderAPI/GetProducts');
  }

  getDeptList(): Observable<DeptItem[]> {
    return this.api.get<DeptItem[]>('/api/Store/WorkOrderAPI/GetDepts');
  }

  getTenderList(): Observable<TenderItem[]> {
    return this.api.get<TenderItem[]>('/api/Store/WorkOrderAPI/GetTenders');
  }
}

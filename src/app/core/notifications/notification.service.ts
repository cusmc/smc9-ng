import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import { AcItem } from '../../shared/autocomplete/autocomplete.component';
import { NotificationItem, NotificationPayload } from './notification.models';

const BASE = '/api/Common/notificationssAPI';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private api: ApiService) {}

  getUnreadForUser(): Observable<NotificationItem[]> {
    return this.api.post<NotificationItem[]>(`${BASE}/GetNotificationbyUser`, {});
  }

  markRead(id: number): Observable<any> {
    return this.api.post<any>(`${BASE}/ReadNotificationbyId?Id=${id}`, {});
  }

  getAll(): Observable<NotificationItem[]> {
    return this.api.post<NotificationItem[]>(`${BASE}/GetDatas`, {});
  }

  getById(id: number): Observable<NotificationItem> {
    return this.api.post<NotificationItem>(`${BASE}/GetDatabyId?id=${id}`, {});
  }

  save(payload: NotificationPayload): Observable<any> {
    return this.api.post<any>(`${BASE}/SaveData`, payload);
  }

  deleteNotification(id: number): Observable<any> {
    return this.api.post<any>(`${BASE}/DeleteData?id=${id}`, {});
  }

  getEmpPicker(): Observable<AcItem[]> {
    return this.api.get<AcItem[]>(`${BASE}/EmpListForPicker`);
  }
}

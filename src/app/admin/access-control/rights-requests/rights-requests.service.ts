import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/api.service';
import { RightsReqView, RoleDto, ApproveDto, ApproveRoleDto } from './rights-requests.models';

const BASE = '/api/Admin/RightsRequestAPI';

@Injectable({ providedIn: 'root' })
export class RightsRequestsService {
  constructor(private api: ApiService) {}

  getPending(): Observable<RightsReqView[]> {
    return this.api.get<RightsReqView[]>(`${BASE}/GetPending`);
  }

  getHistory(): Observable<RightsReqView[]> {
    return this.api.get<RightsReqView[]>(`${BASE}/GetHistory`);
  }

  getUserRoles(username: string): Observable<RoleDto[]> {
    return this.api.get<RoleDto[]>(`${BASE}/GetUserRoles`, { username });
  }

  approveUser(dto: ApproveDto): Observable<any> {
    return this.api.post<any>(`${BASE}/ApproveUser`, dto);
  }

  approveRole(dto: ApproveRoleDto): Observable<any> {
    return this.api.post<any>(`${BASE}/ApproveRole`, dto);
  }

  reject(dto: ApproveDto): Observable<any> {
    return this.api.post<any>(`${BASE}/Reject`, dto);
  }
}

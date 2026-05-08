import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import { UserDetail, AppUser, RoleItem, UserSaveDto, UserRightsRecord } from './user-listing.models';

const BASE = '/api/UsersAPI';
const WRIGHTS_BASE = '/api/Admin/WmodulesAPI';

@Injectable({ providedIn: 'root' })
export class UserListingService {
  constructor(private api: ApiService) {}

  getSelUsers(userId: string, userName: string, status: string): Observable<UserDetail[]> {
    return this.api.get<UserDetail[]>(`${BASE}/getSelUsers`, {
      userid: userId || 'undefined',
      username: userName || 'undefined',
      Status: status || 'undefined',
    });
  }

  getById(username: string): Observable<AppUser> {
    return this.api.get<AppUser>(`${BASE}/GetDatabyId`, { id: username });
  }

  getAllRoles(): Observable<RoleItem[]> {
    return this.api.get<RoleItem[]>(`${BASE}/getAllRoles`);
  }

  saveUser(data: UserSaveDto): Observable<any> {
    return this.api.post<any>(`${BASE}/SaveUser`, data);
  }

  resetPwdAuto(username: string): Observable<any> {
    return this.api.get<any>(`${BASE}/ResetPwdAuto`, { username });
  }

  getRightsByUser(username: string): Observable<UserRightsRecord[]> {
    return this.api.get<UserRightsRecord[]>(`${WRIGHTS_BASE}/GetRightsByUserName`, { id: username });
  }
}

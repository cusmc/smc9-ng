import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/api.service';
import { Wmodule, UserWright, GroupWright, RightsRecord } from './web-modules.models';

const BASE = '/api/Admin/WmodulesAPI';

@Injectable({ providedIn: 'root' })
export class WebModulesService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Wmodule[]> {
    return this.api.get<Wmodule[]>(`${BASE}/GetDatas`);
  }

  getById(id: number): Observable<Wmodule> {
    return this.api.get<Wmodule>(`${BASE}/GetDatabyId`, { id });
  }

  save(data: Partial<Wmodule>): Observable<any> {
    return this.api.post<any>(`${BASE}/SaveData`, data);
  }

  delete(id: number): Observable<any> {
    return this.api.post<any>(`${BASE}/DeleteData`, id);
  }

  getAllUsers(wmoduleId: number): Observable<UserWright[]> {
    return this.api.get<UserWright[]>(`${BASE}/getAllUsers`, { wmodule_id: wmoduleId });
  }

  getAllGroups(wmoduleId: number): Observable<GroupWright[]> {
    return this.api.get<GroupWright[]>(`${BASE}/getAllGroups`, { wmodule_id: wmoduleId });
  }

  saveUserRights(wmoduleId: number, rights: UserWright[]): Observable<any> {
    return this.api.post<any>(`${BASE}/SaveUserData`, { wmodule_id: wmoduleId, data: rights });
  }

  saveRoleRights(roleId: string, rights: GroupWright[]): Observable<any> {
    return this.api.post<any>(`${BASE}/SaveModulesByrole`, { roleid: roleId, data: rights });
  }

  getRightsByModule(id: number): Observable<RightsRecord[]> {
    return this.api.get<RightsRecord[]>(`${BASE}/GetRightsByModuleID`, { id });
  }

  saveLabels(id: number, labels: string[]): Observable<any> {
    return this.api.post<any>(`${BASE}/SaveLabels?id=${id}`, { Labels: JSON.stringify(labels) });
  }
}

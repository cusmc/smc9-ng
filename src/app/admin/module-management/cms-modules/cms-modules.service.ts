import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/api.service';
import { Cmodule, UserWright, GroupWright, RightsRecord } from './cms-modules.models';

const CMS_BASE = '/api/Admin/cmodulessAPI';
const WRIGHTS_BASE = '/api/Admin/WmodulesAPI';

@Injectable({ providedIn: 'root' })
export class CmsModulesService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Cmodule[]> {
    return this.api.get<Cmodule[]>(`${CMS_BASE}/GetDatas`);
  }

  save(data: Partial<Cmodule>): Observable<any> {
    return this.api.post<any>(`${CMS_BASE}/SaveData`, data);
  }

  delete(id: number): Observable<any> {
    return this.api.post<any>(`${CMS_BASE}/DeleteData`, id);
  }

  // User/Group/Rights delegates to WmodulesAPI using Module_id as wmodule_id
  getAllUsers(moduleId: number): Observable<UserWright[]> {
    return this.api.get<UserWright[]>(`${WRIGHTS_BASE}/getAllUsers`, { wmodule_id: moduleId });
  }

  getAllGroups(moduleId: number): Observable<GroupWright[]> {
    return this.api.get<GroupWright[]>(`${WRIGHTS_BASE}/getAllGroups`, { wmodule_id: moduleId });
  }

  saveUserRights(moduleId: number, rights: UserWright[]): Observable<any> {
    return this.api.post<any>(`${WRIGHTS_BASE}/SaveUserData`, { wmodule_id: moduleId, data: rights });
  }

  saveRoleRights(roleId: string, rights: GroupWright[]): Observable<any> {
    return this.api.post<any>(`${WRIGHTS_BASE}/SaveModulesByrole`, { roleid: roleId, data: rights });
  }

  getRightsByModule(id: number): Observable<RightsRecord[]> {
    return this.api.get<RightsRecord[]>(`${WRIGHTS_BASE}/GetRightsByModuleID`, { id });
  }
}

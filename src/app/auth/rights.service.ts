import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from '../shared/api.service';
import { ModuleRightsResponse, RightModal } from './rights.models';

@Injectable({ providedIn: 'root' })
export class RightsService {
  private cache = new Map<string, string>(); // key: "cont|view", value: 8-char permission string

  constructor(private api: ApiService) {}

  getPermission(cont: string, view: string): Observable<string> {
    const key = `${cont.toLowerCase()}|${view.toLowerCase()}`;
    if (this.cache.has(key)) {
      return of(this.cache.get(key)!);
    }
    return this.api.get<ModuleRightsResponse>(
      '/api/Admin/UserRightsAPI/GetModuleRights',
      { cont, view }
    ).pipe(
      map(res => res.Permission ?? 'NNNNNNNN'),
      tap(perm => this.cache.set(key, perm))
    );
  }

  hasRights(cont: string, view: string): boolean {
    const key = `${cont.toLowerCase()}|${view.toLowerCase()}`;
    const perm = this.cache.get(key) ?? 'N';
    return perm.charAt(0) === 'Y';
  }

  getRightsModal(cont: string, view: string): RightModal {
    const key = `${cont.toLowerCase()}|${view.toLowerCase()}`;
    const p = this.cache.get(key) ?? 'NNNNNNNN';
    return {
      View:   p.charAt(0) === 'Y',
      Add:    p.charAt(1) === 'Y',
      Edit:   p.charAt(2) === 'Y',
      Delete: p.charAt(3) === 'Y',
      Auth1:  p.charAt(4) === 'Y',
      Auth2:  p.charAt(5) === 'Y',
      Sp1:    p.charAt(6) === 'Y',
      Sp2:    p.charAt(7) === 'Y',
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}

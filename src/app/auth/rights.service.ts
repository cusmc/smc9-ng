import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from '../shared/api.service';
import { ModuleRightsResponse, RightModal } from './rights.models';

@Injectable({ providedIn: 'root' })
export class RightsService {
  private cache = new Map<string, ModuleRightsResponse>(); // key: "cont|view|menupara"

  constructor(private api: ApiService) {}

  getModuleInfo(cont: string, view: string, menupara = ''): Observable<ModuleRightsResponse> {
    const key = `${cont.toLowerCase()}|${view.toLowerCase()}|${menupara.toLowerCase()}`;
    if (this.cache.has(key)) {
      return of(this.cache.get(key)!);
    }
    const params: Record<string, string> = { cont, view };
    if (menupara) params['menupara'] = menupara;
    return this.api.get<ModuleRightsResponse>(
      '/api/Admin/UserRightsAPI/GetModuleRights', params
    ).pipe(tap(res => this.cache.set(key, res)));
  }

  getPermission(cont: string, view: string, menupara = ''): Observable<string> {
    return this.getModuleInfo(cont, view, menupara).pipe(
      map(res => res.Permission ?? 'NNNNNNNN')
    );
  }

  hasRights(cont: string, view: string, menupara = ''): boolean {
    const key = `${cont.toLowerCase()}|${view.toLowerCase()}|${menupara.toLowerCase()}`;
    return (this.cache.get(key)?.Permission ?? 'N').charAt(0) === 'Y';
  }

  getRightsModal(cont: string, view: string, menupara = ''): RightModal {
    const key = `${cont.toLowerCase()}|${view.toLowerCase()}|${menupara.toLowerCase()}`;
    const p = this.cache.get(key)?.Permission ?? 'NNNNNNNN';
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

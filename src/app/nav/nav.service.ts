import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NavModule, NavItem } from './nav.types';
import { APP_NAV } from './nav-config';
import { ApiService } from '../shared/api.service';

const LAST_MODULE_KEY = 'smc9_last_module';

@Injectable({ providedIn: 'root' })
export class NavService {
  private activeModuleSubject = new BehaviorSubject<NavModule | null>(null);
  readonly activeModule$ = this.activeModuleSubject.asObservable();

  /** Currently loaded/visible modules (dynamic tree + static Hospital), used to
   *  resolve the active module so the sidebar reflects real, permission-filtered
   *  data. */
  private currentModules: NavModule[] = APP_NAV;

  /** True when the active module was picked by fallback (last-used/first),
   *  not by an actual URL match or user click — so a later re-sync (e.g. once
   *  the real permission-filtered modules load) is allowed to replace it. */
  private isFallback = true;

  constructor(private router: Router, private api: ApiService) {
    // Sync active module from route on every navigation
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.syncFromUrl(e.urlAfterRedirects));

    // Sync on service init (page reload / direct URL entry)
    this.syncFromUrl(this.router.url);
  }

  /**
   * Fetches the permission-filtered (or, when showAll is true, unfiltered)
   * dynamic menu tree from the backend Wmodule/Wrights-driven endpoint.
   * Does not include the Hospital module — see getHospitalModule().
   */
  fetchMenuTree(showAll: boolean): Observable<NavModule[]> {
    return this.api.get<NavModule[]>('/api/Common/NavAPI/GetMenuTree', { all: showAll });
  }

  /**
   * Hospital is backed by the separate jMedilan/hModule permission system
   * (out of scope for the dynamic Wmodule-driven menu), so it keeps its
   * existing static, role-based visibility from nav-config.ts.
   */
  getHospitalModule(userRoles: string[]): NavModule[] {
    const hospital = APP_NAV.find((m) => m.id === 'hospital');
    if (!hospital) return [];
    if (!hospital.roles || hospital.roles.length === 0) return [hospital];
    return hospital.roles.some((r) => userRoles.includes(r)) ? [hospital] : [];
  }

  /**
   * Registers the currently loaded/visible modules so setActiveModule/
   * syncFromUrl resolve against real (permission-filtered) data, and
   * re-resolves the active module against the new list immediately.
   */
  setVisibleModules(modules: NavModule[]): void {
    this.currentModules = modules;
    this.syncFromUrl(this.router.url);
  }

  setActiveModule(moduleId: string): void {
    const mod = this.currentModules.find((m) => m.id === moduleId) ?? null;
    this.isFallback = false;
    this.activeModuleSubject.next(mod);
    if (mod) this.saveLastModule(mod.id);
  }

  navigateTo(item: NavItem): void {
    if (item.route) {
      this.router.navigate([item.route]);
    } else if (item.externalUrl) {
      window.open(item.externalUrl, '_blank');
    }
  }

  private syncFromUrl(url: string): void {
    const clean = url.split('?')[0].split('#')[0];
    const match = this.currentModules.find((m) => clean.startsWith(m.baseRoute));
    if (match) {
      this.isFallback = false;
      this.activeModuleSubject.next(match);
      this.saveLastModule(match.id);
      return;
    }

    // No module matches the current URL (e.g. landing on Home). Rather than
    // show an empty "Select a module" sidebar, keep whatever's already
    // active if it's a real selection; otherwise fall back to the last-used
    // module (or the first visible one) so the sidebar is never empty.
    if (!this.isFallback && this.activeModuleSubject.value) return;
    if (this.currentModules.length === 0) return;

    const lastId = this.getLastModule();
    const fallback =
      (lastId && this.currentModules.find((m) => m.id === lastId)) ||
      this.currentModules[0];

    this.isFallback = true;
    this.activeModuleSubject.next(fallback);
  }

  private saveLastModule(moduleId: string): void {
    try {
      localStorage.setItem(LAST_MODULE_KEY, moduleId);
    } catch {
      /* localStorage unavailable (e.g. private mode) — ignore */
    }
  }

  private getLastModule(): string | null {
    try {
      return localStorage.getItem(LAST_MODULE_KEY);
    } catch {
      return null;
    }
  }
}

import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NavModule, NavItem } from './nav.types';
import { APP_NAV } from './nav-config';

@Injectable({ providedIn: 'root' })
export class NavService {
  private activeModuleSubject = new BehaviorSubject<NavModule | null>(null);
  readonly activeModule$ = this.activeModuleSubject.asObservable();

  /** All modules in the config. Role filtering applied via getVisibleModules(). */
  readonly allModules: NavModule[] = APP_NAV;

  constructor(private router: Router) {
    // Sync active module from route on every navigation
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.syncFromUrl(e.urlAfterRedirects));

    // Sync on service init (page reload / direct URL entry)
    this.syncFromUrl(this.router.url);
  }

  /**
   * Returns modules visible to the given user roles.
   * Modules with no roles restriction are always shown.
   * Pass an empty array to show all non-role-restricted modules.
   */
  /**
   * Returns modules visible for the given roles.
   * When userRoles is empty (roles unknown), all modules are shown —
   * access control is enforced by the legacy app or route guards.
   */
  getVisibleModules(userRoles: string[]): NavModule[] {
    if (userRoles.length === 0) return APP_NAV;
    return APP_NAV.filter((m) => {
      if (!m.roles || m.roles.length === 0) return true;
      return m.roles.some((r) => userRoles.includes(r));
    });
  }

  setActiveModule(moduleId: string): void {
    const mod = APP_NAV.find((m) => m.id === moduleId) ?? null;
    this.activeModuleSubject.next(mod);
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
    const match = APP_NAV.find((m) => clean.startsWith(m.baseRoute));
    if (match) this.activeModuleSubject.next(match);
  }
}

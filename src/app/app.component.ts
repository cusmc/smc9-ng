import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterOutlet,
  RouterLink,
  NavigationEnd,
  NavigationError,
  NavigationCancel,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { NavService } from './nav/nav.service';
import { NavModule } from './nav/nav.types';
import { ModuleRailComponent } from './nav/module-rail/module-rail.component';
import { SidebarComponent } from './nav/sidebar/sidebar.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    ModuleRailComponent,
    SidebarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  isLoginPage = false;
  username = '';
  sidenavOpen = false;
  userImageUrl: string | null = null;
  ProfileName = '';
  userRoles: string[] = [];
  dbgNavEvent = '—';
  dbgNavError = '—';
  serverUnavailable = false;
  serverErrorMsg = '';

  visibleModules: NavModule[] = [];
  activeModule: NavModule | null = null;
  profileMenuOpen = false;

  defaultAvatar =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNlMGUwZTAiLz4KPHBhdGggZD0iTTIwIDIwYzIuNzYxNCAwIDUtMi4yMzg2IDUtNXMtMi4yMzg2LTUtNS01LTUgMi4yMzg2LTUgNSA1IDUgNSA1eiIgZmlsbD0iIzk5OTk5OSIvPgo8cGF0aCBkPSJNMTIgMzJ2LTNjMC00LjQxODMgMy41ODE3LTggOC04czggMy41ODE3IDggOHYzaC0xNnoiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    public nav: NavService,
  ) {}

  // ngOnInit(): void {
  //   // Track login page so shell never wraps the login form, regardless of isLoggedIn timing
  //   this.isLoginPage = this.router.url.startsWith('/login');
  //   this.router.events
  //     .pipe(filter((e) => e instanceof NavigationEnd))
  //     .subscribe((e: NavigationEnd) => {
  //       this.isLoginPage = e.urlAfterRedirects.startsWith('/login');
  //     });

  //   this.router.events.subscribe((e) => {
  //     if (e instanceof NavigationEnd) {
  //       this.dbgNavEvent = 'END → ' + e.urlAfterRedirects;
  //     } else if (e instanceof NavigationError) {
  //       this.dbgNavError = e.url + ' | ' + (e.error?.message || e.error);
  //     } else if (e instanceof NavigationCancel) {
  //       this.dbgNavEvent = 'CANCEL ' + e.url + ' | ' + e.reason;
  //     }
  //   });

  //   this.authService.isLoggedIn$().subscribe((loggedIn) => {
  //     this.isLoggedIn = loggedIn;
  //     this.username = this.authService.getUsername() || '';

  //     if (loggedIn) {
  //       this.sidenavOpen = true;
  //       this.loadUserProfile();
  //     } else {
  //       this.userRoles = [];
  //       this.visibleModules = [];
  //     }
  //   });

  //   this.nav.activeModule$.subscribe((mod) => {
  //     this.activeModule = mod;
  //   });
  // }

  ngOnInit(): void {
    // Track login page
    this.isLoginPage = this.router.url.startsWith('/login');

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.isLoginPage = e.urlAfterRedirects.startsWith('/login');
      });

    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.dbgNavEvent = 'END → ' + e.urlAfterRedirects;
      } else if (e instanceof NavigationError) {
        this.dbgNavError = e.url + ' | ' + (e.error?.message || e.error);
      } else if (e instanceof NavigationCancel) {
        this.dbgNavEvent = 'CANCEL ' + e.url + ' | ' + e.reason;
      }
    });

    this.authService.isLoggedIn$().subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      this.username = this.authService.getUsername() || '';

      if (loggedIn) {
        this.sidenavOpen = true;
        this.refreshAllData();
      } else {
        this.userRoles = [];
        this.visibleModules = [];
      }
    });

    this.nav.activeModule$.subscribe((mod) => {
      this.activeModule = mod;
    });
  }

  /**
   * Reload all application data
   */
  refreshAllData(): void {
    this.loadUserProfile();

    // Add other API calls here
    // this.loadDashboardData();
    // this.loadNotifications();
    // this.loadMenus();
    this.loadUserProfile();
  }

  onRefreshClick(): void {
    this.refreshAllData();
  }

  loadUserProfile(): void {
    const path = '/api/ECampusAPI/getUserDetail2';
    const base = (environment.apiUrl || '').replace(/\/$/, '');
    const url = base ? `${base}${path}` : path;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.serverUnavailable = false;
        this.serverErrorMsg = '';
        const data = Array.isArray(res) ? res[0] : res;
        const raw: string | undefined = data?.ImgProfile;
        this.ProfileName = data?.ProfileName || this.username || '';

        // Derive visible modules from usertype returned by the API
        const usertype: string = data?.usertype || '';
        this.userRoles = this.resolveRoles(usertype);
        this.visibleModules = this.nav.getVisibleModules(this.userRoles);

        let src: string | null = null;
        if (raw) {
          if (raw.startsWith('data:image')) {
            src = raw;
          } else {
            const base64Like =
              /^[A-Za-z0-9+/=]+$/.test(raw) && raw.length > 100;
            if (base64Like) {
              src = `data:image/jpeg;base64,${raw}`;
            }
          }
        }
        this.userImageUrl = src || this.defaultAvatar;
      },
      error: (err: HttpErrorResponse) => {
        this.ProfileName = this.username;
        this.visibleModules = this.nav.allModules;
        this.userImageUrl = this.defaultAvatar;
        this.serverUnavailable = true;
        this.serverErrorMsg =
          err.status === 0
            ? 'Cannot reach the server. Please check your network or contact IT.'
            : 'Server error (' +
              err.status +
              '). Some features may not work correctly.';
      },
    });
  }

  /**
   * Maps ASP.NET Identity usertype/role strings to the role names used
   * in nav-config role guards. Extend this as new role names are identified.
   */
  private resolveRoles(usertype: string): string[] {
    const roles: string[] = [];
    if (!usertype) return roles;

    const t = usertype.toLowerCase();
    if (t.includes('admin')) roles.push('Admin');
    if (t.includes('cashier')) roles.push('Cashier');
    if (t.includes('hospital')) roles.push('Hospital');
    if (t.includes('pharmacy')) roles.push('PharmacyMenu');
    if (t.includes('mis')) roles.push('MISMenu');
    if (t.includes('student')) roles.push('Student');
    if (t.includes('class4')) roles.push('Class4');
    if (t.includes('employee')) {
      // Employees can see most modules
      roles.push('Admin', 'Cashier', 'Hospital');
    }
    return [...new Set(roles)];
  }

  onModuleSelected(moduleId: string): void {
    this.nav.setActiveModule(moduleId);
    const mod = this.nav.allModules.find((m) => m.id === moduleId);
    if (mod?.migrated) {
      // Navigate to first item of first group
      const firstRoute = mod.groups[0]?.items[0]?.route;
      if (firstRoute) this.router.navigate([firstRoute]);
    }
  }

  closeSidenavOnMobile(): void {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 1380px)').matches
    ) {
      this.sidenavOpen = false;
    }
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultAvatar;
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  @HostListener('document:click')
  closeProfileMenu(): void {
    this.profileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  retryProfile(): void {
    this.serverUnavailable = false;
    this.loadUserProfile();
  }

  get currentUrl(): string {
    return this.router.url;
  }
  get hasToken(): boolean {
    return !!this.authService.getToken();
  }
}

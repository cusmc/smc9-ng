import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { NavService } from './nav/nav.service';
import { NavModule } from './nav/nav.types';
import { ModuleRailComponent } from './nav/module-rail/module-rail.component';
import { SidebarComponent } from './nav/sidebar/sidebar.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ModuleRailComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  username = '';
  sidenavOpen = false;
  userImageUrl: string | null = null;
  ProfileName = '';
  userRoles: string[] = [];

  visibleModules: NavModule[] = [];
  activeModule: NavModule | null = null;

  defaultAvatar =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNlMGUwZTAiLz4KPHBhdGggZD0iTTIwIDIwYzIuNzYxNCAwIDUtMi4yMzg2IDUtNXMtMi4yMzg2LTUtNS01LTUgMi4yMzg2LTUgNSA1IDUgNSA1eiIgZmlsbD0iIzk5OTk5OSIvPgo8cGF0aCBkPSJNMTIgMzJ2LTNjMC00LjQxODMgMy41ODE3LTggOC04czggMy41ODE3IDggOHYzaC0xNnoiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    public nav: NavService,
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$().subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      this.username = this.authService.getUsername() || '';

      if (loggedIn) {
        this.sidenavOpen = true;
        this.loadUserProfile();
      } else {
        this.userRoles = [];
        this.visibleModules = [];
      }
    });

    this.nav.activeModule$.subscribe((mod) => {
      this.activeModule = mod;
    });
  }

  loadUserProfile(): void {
    const path = '/api/ECampusAPI/getUserDetail2';
    const base = (environment.apiUrl || '').replace(/\/$/, '');
    const url = base ? `${base}${path}` : path;

    this.http.get<any>(url).subscribe({
      next: (res) => {
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
            const base64Like = /^[A-Za-z0-9+/=]+$/.test(raw) && raw.length > 100;
            if (base64Like) {
              src = `data:image/jpeg;base64,${raw}`;
            }
          }
        }
        this.userImageUrl = src || this.defaultAvatar;
      },
      error: () => {
        // If the profile API fails, show all non-role-restricted modules
        this.visibleModules = this.nav.getVisibleModules([]);
        this.userImageUrl = this.defaultAvatar;
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
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1279px)').matches) {
      this.sidenavOpen = false;
    }
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultAvatar;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

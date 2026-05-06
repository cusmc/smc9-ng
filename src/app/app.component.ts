import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  username = '';
  sidenavOpen = false;
  userImageUrl: string | null = null;
  ProfileName = '';
  Course_id = '';
  UGPG = '';

  defaultAvatar =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNlMGUwZTAiLz4KPHBhdGggZD0iTTIwIDIwYzIuNzYxNCAwIDUtMi4yMzg2IDUtNXMtMi4yMzg2LTUtNS01LTUgMi4yMzg2LTUgNSA1IDUgNSA1eiIgZmlsbD0iIzk5OTk5OSIvPgo8cGF0aCBkPSJNMTIgMzJ2LTNjMC00LjQxODMgMy41ODE3LTggOC04czggMy41ODE3IDggOHYzaC0xNnoiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+';

  readonly navGroups = [
    {
      label: 'Assessment',
      icon: 'assignment',
      items: [
        { label: 'Activities', route: '/elogbook/activities', icon: 'task' },
        {
          label: 'Competency Assessment',
          route: '/elogbook/competency-assessment',
          icon: 'verified',
        },
        {
          label: 'Examination',
          route: '/elogbook/examination-assessment',
          icon: 'quiz',
        },
        {
          label: 'Rotational Posting',
          route: '/elogbook/posting',
          icon: 'swap_horiz',
        },
        {
          label: 'Student Appraisal',
          route: '/elogbook/appraisal',
          icon: 'rate_review',
        },
      ],
    },
    {
      label: 'Masters',
      icon: 'settings',
      items: [
        {
          label: 'Competency',
          route: '/elogbook/master/competency',
          icon: 'library_books',
        },
        {
          label: 'Sub-group (Section)',
          route: '/elogbook/master/subgroup/Section',
          icon: 'category',
        },
        {
          label: 'Sub-group (Speciality)',
          route: '/elogbook/master/subgroup/Speciality',
          icon: 'category',
        },
        {
          label: 'Exam Master',
          route: '/elogbook/master/exam',
          icon: 'school',
        },
        {
          label: 'Approving Authority',
          route: '/elogbook/master/approving-authority',
          icon: 'manage_accounts',
        },
        {
          label: 'Appraisal Parameters',
          route: '/elogbook/master/appraisal-params',
          icon: 'tune',
        },
      ],
    },
    {
      label: 'Reports',
      icon: 'bar_chart',
      items: [
        {
          label: 'ElogBook Report',
          route: '/elogbook/reports/elogbook',
          icon: 'picture_as_pdf',
        },
        {
          label: 'Old Data Report',
          route: '/elogbook/reports/old-data',
          icon: 'history',
        },
      ],
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$().subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      this.username = this.authService.getUsername() || '';

      if (loggedIn) {
        this.sidenavOpen = true;
        this.loadUserProfile();
      }
    });
  }

  loadUserProfile(): void {
    const path = '/api/ECampusAPI/getUserDetail2';
    const base = (environment.apiUrl || '').replace(/\/$/, '');
    const url = base ? `${base}${path}` : path;

    // Authorization: Bearer … is applied by authInterceptor using access_token (same as other APIs).
    this.http.get<any>(url).subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res[0] : res;

        const raw: string | undefined = data?.ImgProfile;

        this.ProfileName = data?.ProfileName || this.username || '';
        this.UGPG = data?.UGPG || '';
        this.Course_id = data?.Course_id || '';

        let src: string | null = null;

        if (raw) {
          if (raw.startsWith('data:image')) {
            src = raw;
          } else {
            const base64Like =
              /^[A-Za-z0-9+/=]+$/.test(raw) && raw.length > 100;

            if (base64Like) {
              src = `data:image/jpeg;base64,${raw}`;
            } else {
              const rel = raw.startsWith('/') ? raw : `/${raw}`;
              // src = `${this.API_BASE.replace(/\/$/, '')}${rel}`;
            }
          }
        }

        this.userImageUrl = src || this.defaultAvatar;
      },

      error: (err) => {
        console.error('User API failed:', err);
        this.userImageUrl = this.defaultAvatar;
      },
    });
  }

  closeSidenavOnMobile(): void {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 1279px)').matches
    ) {
      this.sidenavOpen = false;
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultAvatar;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

import { Routes } from '@angular/router';
import { HospPerfComponent } from './hosp-perf/hosp-perf.component';
import { HostelDashboardComponent } from './hostel-dashboard/hostel-dashboard.component';
import { rightsGuard } from '../auth/rights.guard';

export const MIS_ROUTES: Routes = [
  {
    path: 'hosp-perf',
    component: HospPerfComponent,
    canActivate: [rightsGuard],
    data: { cont: 'Mis', view: 'HospPerf' },
  },
  {
    path: 'hostel-dashboard',
    component: HostelDashboardComponent,
    canActivate: [rightsGuard],
    data: { cont: 'Mis', view: 'HostelDashboard' },
  },
  { path: '', redirectTo: 'hosp-perf', pathMatch: 'full' },
];

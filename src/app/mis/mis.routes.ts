import { Routes } from '@angular/router';
import { HospPerfComponent } from './hosp-perf/hosp-perf.component';
import { DoctPerfComponent } from './doct-perf/doct-perf.component';
import { HostelDashboardComponent } from './hostel-dashboard/hostel-dashboard.component';
import { AlosReportsComponent } from './alos-reports/alos-reports.component';
import { FactSheetComponent } from './fact-sheet/fact-sheet.component';
import { rightsGuard } from '../auth/rights.guard';

export const MIS_ROUTES: Routes = [
  {
    path: 'hosp-perf',
    component: HospPerfComponent,
    canActivate: [rightsGuard],
    data: { cont: 'Mis', view: 'HospPerf' },
  },
  {
    path: 'alos-reports',
    component: AlosReportsComponent,
    canActivate: [rightsGuard],
    data: { cont: 'Mis', view: 'AlosReports' },
  },
  {
    path: 'fact-sheet',
    component: FactSheetComponent,
    canActivate: [rightsGuard],
    data: { cont: 'Mis', view: 'FactSheet' },
  },
  {
    path: 'doct-perf',
    component: DoctPerfComponent,
    canActivate: [rightsGuard],
    data: { cont: 'Mis', view: 'DoctPerf' },
  },
  {
    path: 'hostel-dashboard',
    component: HostelDashboardComponent,
    canActivate: [rightsGuard],
    data: { cont: 'Mis', view: 'HostelDashboard' },
  },
  { path: '', redirectTo: 'hosp-perf', pathMatch: 'full' },
];

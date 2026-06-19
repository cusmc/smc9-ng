import { Routes } from '@angular/router';
import { HospPerfComponent } from './hosp-perf/hosp-perf.component';
import { rightsGuard } from '../auth/rights.guard';

export const MIS_ROUTES: Routes = [
  {
    path: 'hosp-perf',
    component: HospPerfComponent,
    canActivate: [rightsGuard],
    data: { cont: 'Mis', view: 'HospPerf' },
  },
  { path: '', redirectTo: 'hosp-perf', pathMatch: 'full' },
];

import { Routes } from '@angular/router';
import { HimsDashboardComponent } from './dashboard/dashboard.component';
import { rightsGuard } from '../auth/rights.guard';

export const HIMS_ROUTES: Routes = [
  {
    path: 'dashboard',
    component: HimsDashboardComponent,
    canActivate: [rightsGuard],
    data: { cont: 'Hims', view: 'Dashboard' }
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

import { Routes } from '@angular/router';
import { HimsDashboardComponent } from './dashboard/dashboard.component';
import { OtPlaceComponent } from './ot-place/ot-place.component';
import { rightsGuard } from '../auth/rights.guard';

export const HIMS_ROUTES: Routes = [
  {
    path: 'dashboard',
    component: HimsDashboardComponent,
    canActivate: [rightsGuard],
    data: { cont: 'Hims', view: 'Dashboard' }
  },
  {
    path: 'ot-place',
    component: OtPlaceComponent,
    canActivate: [rightsGuard],
    data: { cont: 'HMS', view: 'otPlace' }
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

import { Routes } from '@angular/router';
import { HimsDashboardComponent } from './dashboard/dashboard.component';

export const HIMS_ROUTES: Routes = [
  { path: 'dashboard', component: HimsDashboardComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

import { Routes } from '@angular/router';
import { rightsGuard } from '../auth/rights.guard';

export const STORE_ROUTES: Routes = [
  {
    path: 'work-order',
    canActivate: [rightsGuard],
    data: { cont: 'Store', view: 'WorkOrder' },
    loadComponent: () =>
      import('./work-order/work-order.component').then(m => m.WorkOrderComponent)
  },
  { path: '', redirectTo: 'work-order', pathMatch: 'full' }
];

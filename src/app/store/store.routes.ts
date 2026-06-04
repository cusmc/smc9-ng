import { Routes } from '@angular/router';

export const STORE_ROUTES: Routes = [
  {
    path: 'work-order',
    loadComponent: () =>
      import('./work-order/work-order.component').then(m => m.WorkOrderComponent)
  },
  { path: '', redirectTo: 'work-order', pathMatch: 'full' }
];

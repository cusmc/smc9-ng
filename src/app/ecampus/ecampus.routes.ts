import { Routes } from '@angular/router';
import { CertiReqComponent } from './certi-req/certi-req.component';
import { rightsGuard } from '../auth/rights.guard';

export const ECAMPUS_ROUTES: Routes = [
  {
    path: 'certi-req',
    component: CertiReqComponent,
    canActivate: [rightsGuard],
    data: { cont: 'ECampus', view: 'CertiReq' },
  },
  { path: '', redirectTo: 'certi-req', pathMatch: 'full' },
];

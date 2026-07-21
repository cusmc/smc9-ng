import { Routes } from '@angular/router';
import { DocuAuthComponent } from './docu-auth/docu-auth.component';
import { DeclarationFormComponent } from '../shared/declaration-form/declaration-form.component';
import { CanteenScanComponent } from './canteen/canteen-scan.component';
import { CanteenRateComponent } from './canteen/canteen-rate.component';
import { CanteenReportComponent } from './canteen/canteen-report.component';
import { authGuard } from '../auth/auth.guard';
import { rightsGuard } from '../auth/rights.guard';

export const HR_ROUTES: Routes = [
  { path: 'docu-auth',
    component: DocuAuthComponent,
    canActivate: [rightsGuard],
  data: { cont: 'HR', view: 'DocuAuth' },
  },
  { path: 'declaration-form',
    component: DeclarationFormComponent,
    canActivate: [rightsGuard],
  data: { cont: 'HR', view: 'DeclarationForm' },
  },
  { path: 'canteen',
    component: CanteenScanComponent,
    canActivate: [rightsGuard],
  data: { cont: 'HR', view: 'Canteen' },
  },
  { path: 'canteen-rates',
    component: CanteenRateComponent,
    canActivate: [rightsGuard],
  data: { cont: 'HR', view: 'Canteen' },
  },
  { path: 'canteen-report',
    component: CanteenReportComponent,
    canActivate: [rightsGuard],
  data: { cont: 'HR', view: 'Canteen' },
  },
  { path: '', redirectTo: 'docu-auth', pathMatch: 'full' },
];

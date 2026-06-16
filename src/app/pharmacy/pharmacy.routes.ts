import { Routes } from '@angular/router';
import { PoRegisterComponent } from './po-register/po-register.component';
import { DischargeQueueComponent } from './discharge-queue/discharge-queue.component';
import { rightsGuard } from '../auth/rights.guard';

export const PHARMACY_ROUTES: Routes = [
  { path: 'po-register',     component: PoRegisterComponent,     canActivate: [rightsGuard], data: { cont: 'Pharmacy', view: 'PoRegister' } },
  { path: 'discharge-queue', component: DischargeQueueComponent, canActivate: [rightsGuard], data: { cont: 'HMS', view: 'DischargeQueue' } },
  { path: '', redirectTo: 'po-register', pathMatch: 'full' }
];
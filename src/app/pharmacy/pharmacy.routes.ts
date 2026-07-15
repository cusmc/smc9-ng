import { Routes } from '@angular/router';
import { PoRegisterComponent } from './po-register/po-register.component';
import { DischargeQueueComponent } from './discharge-queue/discharge-queue.component';
import { PhPaymentComponent } from './ph-payment/ph-payment.component';
import { RcMasterComponent } from './rc-master/rc-master.component';
import { rightsGuard } from '../auth/rights.guard';
import { CwapMasterComponent } from './cwap-master/cwap-master.component';

export const PHARMACY_ROUTES: Routes = [
  { path: 'po-register', component: PoRegisterComponent, canActivate: [rightsGuard], data: { cont: 'Pharmacy', view: 'PoRegister' } },
  { path: 'discharge-queue', component: DischargeQueueComponent, canActivate: [rightsGuard], data: { cont: 'HMS', view: 'DischargeQueue' } },
  { path: 'ph-payment', component: PhPaymentComponent, canActivate: [rightsGuard], data: { cont: 'Pharmacy', view: 'PhPayment' } },
  { path: 'rc-master', component: RcMasterComponent, canActivate: [rightsGuard], data: { cont: 'Pharmacy', view: 'Rcmast' } },
  { path: 'cwap-master', component: CwapMasterComponent, canActivate: [rightsGuard], data: { cont: 'Pharmacy', view: 'cwap' } },
  { path: '', redirectTo: 'po-register', pathMatch: 'full' }
];
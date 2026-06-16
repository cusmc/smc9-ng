import { Routes } from '@angular/router';
import { ChqPaymentComponent } from './chq-payment/chq-payment.component';
import { rightsGuard } from '../auth/rights.guard';

export const ACCOUNTS_ROUTES: Routes = [
  { path: 'chq-payment', component: ChqPaymentComponent, canActivate: [rightsGuard], data: { cont: 'Accounts', view: 'ChqPayment' } },
  { path: '', redirectTo: 'chq-payment', pathMatch: 'full' }
];

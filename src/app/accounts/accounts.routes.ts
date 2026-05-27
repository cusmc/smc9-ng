import { Routes } from '@angular/router';
import { ChqPaymentComponent } from './chq-payment/chq-payment.component';

export const ACCOUNTS_ROUTES: Routes = [
  { path: 'chq-payment', component: ChqPaymentComponent },
  { path: '', redirectTo: 'chq-payment', pathMatch: 'full' }
];

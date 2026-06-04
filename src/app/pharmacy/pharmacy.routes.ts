import { Routes } from '@angular/router';
import { PoRegisterComponent } from './po-register/po-register.component';
import { DischargeQueueComponent } from './discharge-queue/discharge-queue.component';

export const PHARMACY_ROUTES: Routes = [
  { path: 'po-register',      component: PoRegisterComponent },
  { path: 'discharge-queue',  component: DischargeQueueComponent },
  { path: '', redirectTo: 'po-register', pathMatch: 'full' }
];
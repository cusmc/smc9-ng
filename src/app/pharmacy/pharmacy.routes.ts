import { Routes } from '@angular/router';
import { PoRegisterComponent } from './po-register/po-register.component';

export const PHARMACY_ROUTES: Routes = [
  { path: 'po-register', component: PoRegisterComponent },
  { path: '', redirectTo: 'po-register', pathMatch: 'full' }
];
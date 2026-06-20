import { Routes } from '@angular/router';
import { DocuAuthComponent } from './docu-auth/docu-auth.component';
import { authGuard } from '../auth/auth.guard';

export const HR_ROUTES: Routes = [
  { path: 'docu-auth', component: DocuAuthComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'docu-auth', pathMatch: 'full' },
];

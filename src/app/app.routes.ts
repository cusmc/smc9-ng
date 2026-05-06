import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'elogbook',
    canActivate: [authGuard],
    loadChildren: () => import('./elogbook/elogbook.routes').then(m => m.ELOGBOOK_ROUTES)
  },
  { path: '', redirectTo: '/elogbook/activities', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

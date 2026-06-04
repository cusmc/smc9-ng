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
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'student',
    canActivate: [authGuard],
    loadChildren: () => import('./student/student.routes').then(m => m.STUDENT_ROUTES)
  },
  {
    path: 'pharmacy',
    canActivate: [authGuard],
    loadChildren: () => import('./pharmacy/pharmacy.routes').then(m => m.PHARMACY_ROUTES)
  },
  {
    path: 'accounts',
    canActivate: [authGuard],
    loadChildren: () => import('./accounts/accounts.routes').then(m => m.ACCOUNTS_ROUTES)
  },
  {
    path: 'store',
    canActivate: [authGuard],
    loadChildren: () => import('./store/store.routes').then(m => m.STORE_ROUTES)
  },
  { path: '', redirectTo: '/elogbook/activities', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

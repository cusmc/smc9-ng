import { Routes } from '@angular/router';
import { ProfileDocumentsComponent } from './profile-documents/profile-documents.component';
import { authGuard } from '../auth/auth.guard';

export const PROFILE_ROUTES: Routes = [
  { path: 'documents', component: ProfileDocumentsComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'documents', pathMatch: 'full' },
];

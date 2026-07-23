import { Routes } from '@angular/router';
import { ProfileDocumentsComponent } from './profile-documents/profile-documents.component';
import { ProfilePublicationsComponent } from './profile-publications/profile-publications.component';
import { DeclarationFormComponent } from '../shared/declaration-form/declaration-form.component';
import { authGuard } from '../auth/auth.guard';

export const PROFILE_ROUTES: Routes = [
  { path: 'documents', component: ProfileDocumentsComponent, canActivate: [authGuard] },
  { path: 'publications', component: ProfilePublicationsComponent, canActivate: [authGuard] },
  { path: 'declaration-form', component: DeclarationFormComponent, canActivate: [authGuard], data: { lockToSelf: true } },
  { path: '', redirectTo: 'documents', pathMatch: 'full' },
];

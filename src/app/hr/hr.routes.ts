import { Routes } from '@angular/router';
import { DocuAuthComponent } from './docu-auth/docu-auth.component';
import { DeclarationFormComponent } from './declaration-form/declaration-form.component';
import { authGuard } from '../auth/auth.guard';
import { rightsGuard } from '../auth/rights.guard';

export const HR_ROUTES: Routes = [
  { path: 'docu-auth',
    component: DocuAuthComponent,
    canActivate: [rightsGuard],
  data: { cont: 'HR', view: 'DocuAuth' },
  },
  { path: 'declaration-form',
    component: DeclarationFormComponent,
    canActivate: [rightsGuard],
  data: { cont: 'HR', view: 'DeclarationForm' },
  },
  { path: '', redirectTo: 'docu-auth', pathMatch: 'full' },
];

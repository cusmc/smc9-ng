import { Routes } from '@angular/router';
import { StudentViewComponent } from './students/student-view.component';
import { CertiReqComponent } from '../ecampus/certi-req/certi-req.component';
import { rightsGuard } from '../auth/rights.guard';

export const STUDENT_ROUTES: Routes = [
  { path: 'students',  component: StudentViewComponent, canActivate: [rightsGuard], data: { cont: 'ECampus', view: 'Student' } },
  { path: 'certi-req', component: CertiReqComponent,   canActivate: [rightsGuard], data: { cont: 'ECampus', view: 'CertiReq' } },
  { path: '', redirectTo: 'students', pathMatch: 'full' },
];

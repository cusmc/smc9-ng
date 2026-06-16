import { Routes } from '@angular/router';
import { StudentViewComponent } from './students/student-view.component';
import { rightsGuard } from '../auth/rights.guard';

export const STUDENT_ROUTES: Routes = [
  { path: 'students', component: StudentViewComponent, canActivate: [rightsGuard], data: { cont: 'ECampus', view: 'Student' } },
  { path: '', redirectTo: 'students', pathMatch: 'full' },
];

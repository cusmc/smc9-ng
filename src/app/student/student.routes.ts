import { Routes } from '@angular/router';
import { StudentViewComponent } from './students/student-view.component';

export const STUDENT_ROUTES: Routes = [
  { path: 'students', component: StudentViewComponent },
  { path: '', redirectTo: 'students', pathMatch: 'full' },
];

import { Routes } from '@angular/router';
import { ActivitiesComponent } from './assessment/activities/activities.component';
import { CompetencyAssessmentComponent } from './assessment/competency-assessment/competency-assessment.component';
import { ExaminationComponent } from './assessment/examination/examination.component';
import { PostingComponent } from './assessment/posting/posting.component';
import { AppraisalComponent } from './assessment/appraisal/appraisal.component';
import { CompetencyMasterComponent } from './master/competency/competency-master.component';
import { SubgroupMasterComponent } from './master/subgroup/subgroup-master.component';
import { ExamMasterComponent } from './master/exam/exam-master.component';
import { ApprovingAuthorityMasterComponent } from './master/approving-authority/approving-authority-master.component';
import { AppraisalParametersMasterComponent } from './master/appraisal-params/appraisal-params-master.component';
import { ElogbookReportComponent } from './reports/elogbook-report/elogbook-report.component';
import { OldDataReportComponent } from './reports/old-data-report/old-data-report.component';

export const ELOGBOOK_ROUTES: Routes = [
  // Phase 1 - Activities Assessment
  { path: 'activities', component: ActivitiesComponent },

  // Phase 2 - Assessment Screens
  { path: 'competency-assessment', component: CompetencyAssessmentComponent },
  { path: 'examination-assessment', component: ExaminationComponent },
  { path: 'posting', component: PostingComponent },
  { path: 'appraisal', component: AppraisalComponent },

  // Phase 3 - Master Screens
  { path: 'master/competency', component: CompetencyMasterComponent },
  { path: 'master/subgroup/:type', component: SubgroupMasterComponent },
  { path: 'master/exam', component: ExamMasterComponent },
  { path: 'master/approving-authority', component: ApprovingAuthorityMasterComponent },
  { path: 'master/appraisal-params', component: AppraisalParametersMasterComponent },

  // Phase 4 - Reports
  { path: 'reports/elogbook', component: ElogbookReportComponent },
  { path: 'reports/old-data', component: OldDataReportComponent },

  { path: '', redirectTo: 'activities', pathMatch: 'full' }
];

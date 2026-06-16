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
import { rightsGuard } from '../auth/rights.guard';

export const ELOGBOOK_ROUTES: Routes = [
  // Phase 1 - Activities Assessment
  { path: 'activities', component: ActivitiesComponent, canActivate: [rightsGuard], data: { cont: 'ECampus', view: 'Activities' } },

  // Phase 2 - Assessment Screens
  { path: 'competency-assessment', component: CompetencyAssessmentComponent, canActivate: [rightsGuard], data: { cont: 'ECampus', view: 'Studentcompetency' } },
  { path: 'examination-assessment', component: ExaminationComponent, canActivate: [rightsGuard], data: { cont: 'ECampus', view: 'Examination' } },
  { path: 'posting', component: PostingComponent, canActivate: [rightsGuard], data: { cont: 'ECampus', view: 'Posting_logbook' } },
  { path: 'appraisal', component: AppraisalComponent, canActivate: [rightsGuard], data: { cont: 'ECampus', view: 'StudApprisalHeader' } },

  // Phase 3 - Master Screens
  { path: 'master/competency', component: CompetencyMasterComponent, canActivate: [rightsGuard], data: { cont: 'ECampus', view: 'Competencie' } },
  { path: 'master/subgroup/:type', component: SubgroupMasterComponent, canActivate: [rightsGuard], data: { cont: 'ECampus', view: 'Subgrp_logbook' } },
  { path: 'master/exam', component: ExamMasterComponent, canActivate: [rightsGuard], data: { cont: 'ECampus', view: 'Exammast' } },
  { path: 'master/approving-authority', component: ApprovingAuthorityMasterComponent, canActivate: [rightsGuard], data: { cont: 'ECampus', view: 'ApprovingAuthority' } },
  { path: 'master/appraisal-params', component: AppraisalParametersMasterComponent, canActivate: [rightsGuard], data: { cont: 'ECampus', view: 'AppraisalMaster' } },

  // Phase 4 - Reports
  { path: 'reports/elogbook', component: ElogbookReportComponent, canActivate: [rightsGuard], data: { cont: 'ECampus', view: 'ElogbookRpt' } },
  { path: 'reports/old-data', component: OldDataReportComponent, canActivate: [rightsGuard], data: { cont: 'ECampus', view: 'LogBookOldData' } },

  { path: '', redirectTo: 'activities', pathMatch: 'full' }
];

import { Routes } from '@angular/router';
import { WebModulesComponent } from './module-management/web-modules/web-modules.component';
import { CmsModulesComponent } from './module-management/cms-modules/cms-modules.component';
import { RightsRequestsComponent } from './access-control/rights-requests/rights-requests.component';
import { AccessReviewComponent } from './access-control/access-review/access-review.component';
import { UserListingComponent } from './users/user-listing.component';
import { WebpagesComponent } from './website/webpages/webpages.component';
import { SchemeDiscountsComponent } from './scheme-discounts/scheme-discount.component';
import { NotificationMgmtComponent } from './notifications/notification-mgmt.component';
import { InstComponent } from './inst/inst.component';
import { rightsGuard } from '../auth/rights.guard';

export const ADMIN_ROUTES: Routes = [
  { path: 'module-management/web-modules', component: WebModulesComponent, canActivate: [rightsGuard], data: { cont: 'Admin', view: 'Wmodule' } },
  { path: 'module-management/cms-modules', component: CmsModulesComponent, canActivate: [rightsGuard], data: { cont: 'Admin', view: 'Cmodule' } },
  { path: 'access-control/rights-requests', component: RightsRequestsComponent, canActivate: [rightsGuard], data: { cont: 'Admin', view: 'RightsRequests' } },
  { path: 'access-control/access-review', component: AccessReviewComponent, canActivate: [rightsGuard], data: { cont: 'Admin', view: 'AccessReview' } },
  { path: 'users', component: UserListingComponent, canActivate: [rightsGuard], data: { cont: 'Admin', view: 'Users' } },
  { path: 'website/webpages', component: WebpagesComponent, canActivate: [rightsGuard], data: { cont: 'Admin', view: 'Webpages' } },
  { path: 'scheme-discounts', component: SchemeDiscountsComponent, canActivate: [rightsGuard], data: { cont: 'Admin', view: 'SchemeDiscounts' } },
  { path: 'notifications', component: NotificationMgmtComponent, canActivate: [rightsGuard], data: { cont: 'Admin', view: 'Notifications' } },
  { path: 'institute', component: InstComponent, canActivate: [rightsGuard], data: { cont: 'DMS', view: 'Instmast' } },
  { path: '', redirectTo: 'module-management/web-modules', pathMatch: 'full' },
];

import { Routes } from '@angular/router';
import { WebModulesComponent } from './module-management/web-modules/web-modules.component';
import { CmsModulesComponent } from './module-management/cms-modules/cms-modules.component';
import { RightsRequestsComponent } from './access-control/rights-requests/rights-requests.component';
import { UserListingComponent } from './users/user-listing.component';
import { WebpagesComponent } from './website/webpages/webpages.component';
import { SchemeDiscountsComponent } from './scheme-discounts/scheme-discount.component';

export const ADMIN_ROUTES: Routes = [
  { path: 'module-management/web-modules', component: WebModulesComponent },
  { path: 'module-management/cms-modules', component: CmsModulesComponent },
  { path: 'access-control/rights-requests', component: RightsRequestsComponent },
  { path: 'users', component: UserListingComponent },
  { path: 'website/webpages', component: WebpagesComponent },
  { path: 'scheme-discounts', component: SchemeDiscountsComponent },
  { path: '', redirectTo: 'module-management/web-modules', pathMatch: 'full' },
];

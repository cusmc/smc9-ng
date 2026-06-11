import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/api.service';
import { AccessReviewRow, UserReviewRow } from './access-review.models';

const BASE = '/api/UsersAPI';

@Injectable({ providedIn: 'root' })
export class AccessReviewService {
  constructor(private api: ApiService) {}

  getUsers(): Observable<UserReviewRow[]> {
    return this.api.get<UserReviewRow[]>(`${BASE}/GetUsersForReview`);
  }

  getAccessMatrix(): Observable<AccessReviewRow[]> {
    return this.api.get<AccessReviewRow[]>(`${BASE}/GetAccessReviewMatrix`);
  }
}

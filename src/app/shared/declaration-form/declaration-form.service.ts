import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';

const BASE = '/api/HR/DeclarationFormAPI';

@Injectable({ providedIn: 'root' })
export class DeclarationFormService {
  constructor(private api: ApiService) {}

  // Returns the .docx bytes directly rather than a URL to fetch separately -- a plain <a href>
  // navigation to a static file URL carries no Bearer token (only requests made through
  // HttpClient's auth interceptor do), so this app's cookie-based auth would otherwise redirect
  // that unauthenticated request to the login page instead of serving the file.
  generateWord(empid: number, withSign: boolean, withAtt: boolean): Observable<Blob> {
    return this.api.getBlob(`${BASE}/GenerateWord`, { empid, withSign, withAtt });
  }

  // Self-service: no empid parameter -- the backend resolves the caller's own employee
  // identity from the auth token, so there is nothing here for a client to tamper with.
  generateMyWord(withSign: boolean, withAtt: boolean): Observable<Blob> {
    return this.api.getBlob(`${BASE}/GenerateMyWord`, { withSign, withAtt });
  }
}

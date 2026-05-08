import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import {
  StudentListItem,
  StudentWithPhoto,
  StudentLedgerRecord,
  StudentResultRecord,
} from './student-view.models';

@Injectable({ providedIn: 'root' })
export class StudentViewService {
  private readonly CAMPUS_BASE = '/api/Campus/StudentsAPI';
  private readonly ECAMPUS_BASE = '/api/ECampusAPI';

  constructor(private api: ApiService) {}

  getAll(): Observable<StudentListItem[]> {
    return this.api.get<StudentListItem[]>(`${this.ECAMPUS_BASE}/StudList`);
  }

  getById(no: number): Observable<StudentWithPhoto> {
    return this.api.get<StudentWithPhoto>(`${this.CAMPUS_BASE}/GetStudent?id=${no}`);
  }

  getLedger(studId: number, instId: number): Observable<StudentLedgerRecord[]> {
    const instStr = '000' + instId;
    return this.api.get<StudentLedgerRecord[]>(
      `${this.CAMPUS_BASE}/GetStudLedger?StudId=${studId}&Inst_id='${instStr}'`,
    );
  }

  getResult(id: number, instId: number): Observable<StudentResultRecord[]> {
    const instStr = '000' + instId;
    return this.api.get<StudentResultRecord[]>(
      `${this.CAMPUS_BASE}/GetStudResult?id=${id}&Inst_id=${instStr}`,
    );
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/api.service';
import {
  GuideList,
  StudGuide,
  Student,
} from './approving-authority-master.models';
import { LookupService } from '../../shared/lookup.service';

@Injectable({
  providedIn: 'root',
})
export class ApprovingAuthorityMasterService {
  constructor(
    private apiService: ApiService,
    private lookupService: LookupService,
  ) {}

  getStudGuidesByStudent(studNo: string): Observable<StudGuide[]> {
    return this.apiService.get<StudGuide[]>(
      '/api/Campus/studguidesAPI/GetDatasByStudNo',
      { Studno: studNo },
    );
  }

  getStudGidesList(): Observable<GuideList[]> {
    console.log(
      this.apiService.get<GuideList[]>(
        'api/Common/CodemastsAPI/GetCodeListbyCodenm?codenm=StudGuide',
      ),
    );
    return this.apiService.get<GuideList[]>(
      'api/Common/CodemastsAPI/GetCodeListbyCodenm?codenm=StudGuide',
    );
  }

  saveStudGuides(guides: StudGuide[]): Observable<any> {
    return this.apiService.post<any>(
      '/api/Campus/studguidesAPI/SaveData',
      guides,
    );
  }

  getAllStudents(): Observable<Student[]> {
    return this.lookupService.getAllStudents();
  }
}

import { of, throwError } from 'rxjs';
import { FormBuilder } from '@angular/forms';

import { ExaminationComponent } from './examination.component';
import { AuthService } from '../../../auth/auth.service';
import { ExaminationService } from './examination.service';
import { LookupService } from '../../shared/lookup.service';
import { ToastService } from '../../../core/toast/toast.service';
import { ExamResult } from './examination.models';

describe('ExaminationComponent', () => {
  let component: ExaminationComponent;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockService: jasmine.SpyObj<ExaminationService>;
  let mockLookup: jasmine.SpyObj<LookupService>;
  let mockToast: jasmine.SpyObj<ToastService>;

  const makeRows = (statuses: string[]): ExamResult[] =>
    statuses.map((Status, i) => ({
      Examres_id: i,
      Status,
      Studname: `Student${i}`,
      Exam_nm: `Exam${i}`,
      Course_nm: `Course${i}`,
      Create_by: `user${i}`,
      Create_dt: '2026-01-01'
    } as ExamResult));

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['getUsername']);
    mockAuthService.getUsername.and.returnValue('jdoe');

    mockService = jasmine.createSpyObj<ExaminationService>('ExaminationService', [
      'getExamResults', 'authExamResult'
    ]);
    mockService.getExamResults.and.returnValue(of([]));
    mockService.authExamResult.and.returnValue(of(null));

    mockLookup = jasmine.createSpyObj<LookupService>('LookupService', [
      'getSubjectsByEmpid', 'getStudentsByCourse'
    ]);
    mockLookup.getSubjectsByEmpid.and.returnValue(of([]));
    mockLookup.getStudentsByCourse.and.returnValue(of([]));

    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    component = new ExaminationComponent(
      mockAuthService, mockService, mockLookup, new FormBuilder(), mockToast
    );
  });

  describe('ngOnInit()', () => {
    it('sets username from authService', () => {
      component.ngOnInit();
      expect(component.username).toBe('jdoe');
    });

    it('loads subjects via getSubjectsByEmpid()', () => {
      component.ngOnInit();
      expect(mockLookup.getSubjectsByEmpid).toHaveBeenCalledWith('jdoe');
    });
  });

  describe('setStatus()', () => {
    beforeEach(() => {
      component.allData = makeRows(['P', 'A', 'R', 'P']);
    });

    it('filters to status A', () => {
      component.setStatus('A');
      expect(component.filteredData.every(r => r.Status === 'A')).toBeTrue();
    });

    it('shows all records when status is X', () => {
      component.setStatus('X');
      expect(component.filteredData.length).toBe(4);
    });

    it('resets currentPage to 1', () => {
      component.currentPage = 3;
      component.setStatus('P');
      expect(component.currentPage).toBe(1);
    });
  });

  describe('openAuth()', () => {
    it('sets authRow to the provided row', () => {
      const row = makeRows(['P'])[0];
      component.openAuth(row);
      expect(component.authRow).toBe(row);
    });

    it('resets authForm comments', () => {
      component.authForm.patchValue({ Comments: 'old comment' });
      component.openAuth(makeRows(['P'])[0]);
      expect(component.authForm.get('Comments')?.value).toBeNull();
    });
  });

  describe('closeAuth()', () => {
    it('sets authRow to null', () => {
      component.authRow = makeRows(['P'])[0];
      component.closeAuth();
      expect(component.authRow).toBeNull();
    });
  });

  describe('searchedData', () => {
    beforeEach(() => {
      component.allData = makeRows(['P', 'A']);
      component.setStatus('X');
    });

    it('returns all when search is empty', () => {
      expect(component.searchedData.length).toBe(2);
    });

    it('filters by Studname case-insensitively', () => {
      component.search.Studname = 'student0';
      expect(component.searchedData.length).toBe(1);
      expect(component.searchedData[0].Studname).toBe('Student0');
    });
  });

  describe('pagedData and totalPages', () => {
    it('slices correctly', () => {
      component.filteredData = makeRows(Array(15).fill('P'));
      component.currentPage = 1;
      expect(component.pagedData.length).toBe(10);
    });

    it('calculates totalPages', () => {
      component.filteredData = makeRows(Array(21).fill('P'));
      expect(component.totalPages).toBe(3);
    });
  });
});

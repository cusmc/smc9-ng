import { of, throwError } from 'rxjs';
import { FormBuilder } from '@angular/forms';

import { CompetencyAssessmentComponent } from './competency-assessment.component';
import { AuthService } from '../../../auth/auth.service';
import { CompetencyAssessmentService } from './competency-assessment.service';
import { LookupService } from '../../shared/lookup.service';
import { ToastService } from '../../../core/toast/toast.service';
import { StudentCompetency, CodeListItem } from './competency-assessment.models';

describe('CompetencyAssessmentComponent', () => {
  let component: CompetencyAssessmentComponent;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockService: jasmine.SpyObj<CompetencyAssessmentService>;
  let mockLookup: jasmine.SpyObj<LookupService>;
  let mockToast: jasmine.SpyObj<ToastService>;

  const ratingList: CodeListItem[] = [
    { Cd: 'E', vals: 'Excellent' },
    { Cd: 'M', vals: 'Meets' }
  ];

  const makeRows = (statuses: string[]): StudentCompetency[] =>
    statuses.map((Status, i) => ({ Pk_id: i, Status } as StudentCompetency));

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['getUsername']);
    mockAuthService.getUsername.and.returnValue('jdoe');

    mockService = jasmine.createSpyObj<CompetencyAssessmentService>('CompetencyAssessmentService', [
      'getCompetencies', 'save'
    ]);
    mockService.getCompetencies.and.returnValue(of([]));
    mockService.save.and.returnValue(of(null));

    mockLookup = jasmine.createSpyObj<LookupService>('LookupService', [
      'getCodeList', 'getSubjectsByEmpid', 'getStudentsByCourse'
    ]);
    mockLookup.getCodeList.and.returnValue(of(ratingList));
    mockLookup.getSubjectsByEmpid.and.returnValue(of([]));
    mockLookup.getStudentsByCourse.and.returnValue(of([]));

    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    component = new CompetencyAssessmentComponent(
      mockAuthService, mockService, mockLookup, new FormBuilder(), mockToast
    );
  });

  describe('ngOnInit()', () => {
    it('sets username from authService', () => {
      component.ngOnInit();
      expect(component.username).toBe('jdoe');
    });

    it('loads decisionList and ratingList via getCodeList()', () => {
      component.ngOnInit();
      expect(mockLookup.getCodeList).toHaveBeenCalledWith('Decision');
      expect(mockLookup.getCodeList).toHaveBeenCalledWith('RATING_C');
    });

    it('loads subjects via getSubjectsByEmpid()', () => {
      component.ngOnInit();
      expect(mockLookup.getSubjectsByEmpid).toHaveBeenCalledWith('jdoe');
    });
  });

  describe('setStatus()', () => {
    it('filters to matching status', () => {
      component.allData = makeRows(['P', 'C', 'P', 'R']);
      component.setStatus('P');
      expect(component.filteredData.every(r => r.Status === 'P')).toBeTrue();
      expect(component.filteredData.length).toBe(2);
    });

    it('shows all when status is A', () => {
      component.allData = makeRows(['P', 'C', 'R']);
      component.setStatus('A');
      expect(component.filteredData.length).toBe(3);
    });

    it('resets currentPage to 1', () => {
      component.currentPage = 3;
      component.setStatus('C');
      expect(component.currentPage).toBe(1);
    });
  });

  describe('getLabel()', () => {
    it('returns the label for a known code', () => {
      expect(component.getLabel(ratingList, 'E')).toBe('Excellent');
    });

    it('returns the code itself for an unknown code', () => {
      expect(component.getLabel(ratingList, 'Z')).toBe('Z');
    });

    it('returns empty string for undefined code', () => {
      expect(component.getLabel(ratingList, undefined)).toBe('');
    });
  });

  describe('pagedData and totalPages', () => {
    it('returns 10 items on first page', () => {
      component.filteredData = makeRows(Array(15).fill('P'));
      component.currentPage = 1;
      expect(component.pagedData.length).toBe(10);
    });

    it('calculates totalPages correctly', () => {
      component.filteredData = makeRows(Array(22).fill('P'));
      expect(component.totalPages).toBe(3);
    });
  });

  describe('update()', () => {
    it('calls service.save() when user confirms', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const row = makeRows(['P'])[0];
      mockService.save.and.returnValue(of(null));
      spyOn(component, 'loadData');
      component.update(row, 'U');
      expect(mockService.save).toHaveBeenCalledOnceWith(row, 'U');
    });

    it('does not call service.save() when user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.update(makeRows(['P'])[0], 'U');
      expect(mockService.save).not.toHaveBeenCalled();
    });
  });
});

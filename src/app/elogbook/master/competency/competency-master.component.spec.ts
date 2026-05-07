import { of, throwError } from 'rxjs';

import { CompetencyMasterComponent } from './competency-master.component';
import { CompetencyMasterService } from './competency-master.service';
import { LookupService } from '../../shared/lookup.service';
import { AuthService } from '../../../auth/auth.service';
import { Dialog } from '@angular/cdk/dialog';
import { ToastService } from '../../../core/toast/toast.service';
import { Competency } from './competency-master.models';

describe('CompetencyMasterComponent', () => {
  let component: CompetencyMasterComponent;
  let mockService: jasmine.SpyObj<CompetencyMasterService>;
  let mockLookup: jasmine.SpyObj<LookupService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDialog: jasmine.SpyObj<Dialog>;
  let mockToast: jasmine.SpyObj<ToastService>;

  const makeCompetencies = (count: number): Competency[] =>
    Array.from({ length: count }, (_, i) => ({
      Competencyid: i,
      Description: `Desc ${i}`,
      Section_nm: `Section ${i}`,
      Subdesc: `Sub ${i}`,
      Mode_nm: `Mode ${i}`,
      Yr: `${2020 + i}`,
      Create_by: `user${i}`,
      Create_dt: '2026-01-01'
    } as Competency));

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['getUsername']);
    mockAuthService.getUsername.and.returnValue('jdoe');

    mockLookup = jasmine.createSpyObj<LookupService>('LookupService', ['getSubjectsByEmpid']);
    mockLookup.getSubjectsByEmpid.and.returnValue(of([]));

    mockService = jasmine.createSpyObj<CompetencyMasterService>('CompetencyMasterService', [
      'getCompetencies', 'getCompetencyById', 'saveCompetency', 'deleteCompetency', 'importCompetencies', 'addSection'
    ]);
    mockService.getCompetencies.and.returnValue(of([]));
    mockService.deleteCompetency.and.returnValue(of(null));

    mockDialog = jasmine.createSpyObj<Dialog>('Dialog', ['open']);
    mockDialog.open.and.returnValue({ closed: of(null) } as any);

    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    component = new CompetencyMasterComponent(
      mockService, mockLookup, mockAuthService, mockDialog, mockToast
    );
  });

  describe('ngOnInit()', () => {
    it('loads subjects and competencies for the first subject', () => {
      mockLookup.getSubjectsByEmpid.and.returnValue(
        of([{ Subject_id: 7, Subject_nm: 'Med' }])
      );
      mockService.getCompetencies.and.returnValue(of(makeCompetencies(2)));
      component.ngOnInit();
      expect(component.selectedSubjectId).toBe(7);
      expect(component.competencies.length).toBe(2);
    });
  });

  describe('searchedData', () => {
    beforeEach(() => { component.competencies = makeCompetencies(3); });

    it('returns all when search is empty', () => {
      expect(component.searchedData.length).toBe(3);
    });

    it('filters by Description case-insensitively', () => {
      component.search.Description = 'desc 0';
      expect(component.searchedData.length).toBe(1);
    });

    it('filters by Section_nm', () => {
      component.search.Section_nm = 'section 2';
      expect(component.searchedData.length).toBe(1);
    });
  });

  describe('pagedCompetencies and totalPages', () => {
    it('returns 10 per page', () => {
      component.competencies = makeCompetencies(15);
      component.pageIndex = 0;
      expect(component.pagedCompetencies.length).toBe(10);
    });

    it('calculates totalPages', () => {
      component.competencies = makeCompetencies(21);
      expect(component.totalPages).toBe(3);
    });
  });

  describe('prevPage()', () => {
    it('decrements pageIndex', () => {
      component.pageIndex = 2;
      component.prevPage();
      expect(component.pageIndex).toBe(1);
    });

    it('does not go below 0', () => {
      component.pageIndex = 0;
      component.prevPage();
      expect(component.pageIndex).toBe(0);
    });
  });

  describe('nextPage()', () => {
    it('increments pageIndex', () => {
      component.competencies = makeCompetencies(25);
      component.pageIndex = 0;
      component.nextPage();
      expect(component.pageIndex).toBe(1);
    });

    it('does not exceed last page', () => {
      component.competencies = makeCompetencies(10);
      component.pageIndex = 0;
      component.nextPage();
      expect(component.pageIndex).toBe(0);
    });
  });

  describe('onSearchChange()', () => {
    it('resets pageIndex to 0', () => {
      component.pageIndex = 3;
      component.onSearchChange();
      expect(component.pageIndex).toBe(0);
    });
  });

  describe('deleteCompetency()', () => {
    it('calls service.deleteCompetency and reloads when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(component, 'loadCompetencies');
      component.deleteCompetency(5);
      expect(mockService.deleteCompetency).toHaveBeenCalledWith(5);
      expect(component.loadCompetencies).toHaveBeenCalled();
    });

    it('does not delete when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.deleteCompetency(5);
      expect(mockService.deleteCompetency).not.toHaveBeenCalled();
    });
  });
});

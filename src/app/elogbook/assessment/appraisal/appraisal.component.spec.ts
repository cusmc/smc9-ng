import { of, throwError } from 'rxjs';

import { AppraisalComponent } from './appraisal.component';
import { AuthService } from '../../../auth/auth.service';
import { AppraisalService } from './appraisal.service';
import { Dialog } from '@angular/cdk/dialog';
import { ToastService } from '../../../core/toast/toast.service';
import { AppraisalHeader } from './appraisal.models';

describe('AppraisalComponent', () => {
  let component: AppraisalComponent;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockAppraisalService: jasmine.SpyObj<AppraisalService>;
  let mockDialog: jasmine.SpyObj<Dialog>;
  let mockToast: jasmine.SpyObj<ToastService>;

  const makeRecords = (count: number): AppraisalHeader[] =>
    Array.from({ length: count }, (_, i) => ({
      Studno: `S00${i}`,
      Courseid: i,
      Appraisaldate: '2026-01-01',
      Overallcomments: `Comment ${i}`,
      Create_dt: '2026-01-01',
      Create_by: `user${i}`
    } as AppraisalHeader));

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['getUsername']);
    mockAuthService.getUsername.and.returnValue('jdoe');

    mockAppraisalService = jasmine.createSpyObj<AppraisalService>('AppraisalService', [
      'getAppraisals', 'getAppraisalByStudno', 'saveAppraisal', 'getCourses', 'getParamsByCourse'
    ]);
    mockAppraisalService.getAppraisals.and.returnValue(of([]));

    mockDialog = jasmine.createSpyObj<Dialog>('Dialog', ['open']);
    mockDialog.open.and.returnValue({ closed: of(null) } as any);

    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    component = new AppraisalComponent(mockAuthService, mockAppraisalService, mockDialog, mockToast);
  });

  describe('ngOnInit()', () => {
    it('sets username from authService', () => {
      component.ngOnInit();
      expect(component.username).toBe('jdoe');
    });
  });

  describe('loadData()', () => {
    it('populates dataSource on success', () => {
      const data = makeRecords(3);
      mockAppraisalService.getAppraisals.and.returnValue(of(data));
      component.loadData();
      expect(component.dataSource).toEqual(data);
    });

    it('shows error toast on failure', () => {
      mockAppraisalService.getAppraisals.and.returnValue(throwError(() => new Error('oops')));
      component.loadData();
      expect(mockToast.show).toHaveBeenCalledWith(
        jasmine.stringContaining('Failed'),
        jasmine.objectContaining({ variant: 'error' })
      );
    });

    it('resets currentPage to 1', () => {
      component.currentPage = 5;
      component.loadData();
      expect(component.currentPage).toBe(1);
    });
  });

  describe('searchedData', () => {
    beforeEach(() => {
      component.dataSource = makeRecords(3);
    });

    it('returns all records when search is empty', () => {
      expect(component.searchedData.length).toBe(3);
    });

    it('filters by Studno case-insensitively', () => {
      component.dataSource = [
        { Studno: 'ABC123', Courseid: 1 } as AppraisalHeader,
        { Studno: 'XYZ999', Courseid: 2 } as AppraisalHeader
      ];
      component.search.Studno = 'abc';
      expect(component.searchedData.length).toBe(1);
      expect(component.searchedData[0].Studno).toBe('ABC123');
    });

    it('filters by Courseid as string match', () => {
      component.dataSource = [
        { Studno: 'A', Courseid: 101 } as AppraisalHeader,
        { Studno: 'B', Courseid: 202 } as AppraisalHeader
      ];
      component.search.Courseid = '101';
      expect(component.searchedData.length).toBe(1);
    });
  });

  describe('pagedData and totalPages', () => {
    it('returns the correct page slice', () => {
      component.dataSource = makeRecords(25);
      component.currentPage = 2;
      expect(component.pagedData.length).toBe(10);
    });

    it('calculates totalPages correctly', () => {
      component.dataSource = makeRecords(25);
      expect(component.totalPages).toBe(3);
    });
  });

  describe('onSearchChange()', () => {
    it('resets currentPage to 1', () => {
      component.currentPage = 4;
      component.onSearchChange();
      expect(component.currentPage).toBe(1);
    });
  });

  describe('openDialog()', () => {
    it('calls dialog.open with the given studno', () => {
      component.openDialog('S001');
      expect(mockDialog.open).toHaveBeenCalledWith(
        jasmine.anything(),
        jasmine.objectContaining({ data: jasmine.objectContaining({ Studno: 'S001' }) })
      );
    });

    it('calls loadData when dialog closes with a truthy result', () => {
      mockDialog.open.and.returnValue({ closed: of(true) } as any);
      spyOn(component, 'loadData');
      component.openDialog('S001');
      expect(component.loadData).toHaveBeenCalled();
    });

    it('does not call loadData when dialog closes with falsy result', () => {
      mockDialog.open.and.returnValue({ closed: of(null) } as any);
      spyOn(component, 'loadData');
      component.openDialog('S001');
      expect(component.loadData).not.toHaveBeenCalled();
    });
  });
});

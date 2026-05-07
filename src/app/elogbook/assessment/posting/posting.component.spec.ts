import { of, throwError } from 'rxjs';
import { FormBuilder } from '@angular/forms';

import { PostingComponent } from './posting.component';
import { AuthService } from '../../../auth/auth.service';
import { PostingService } from './posting.service';
import { LookupService } from '../../shared/lookup.service';
import { Dialog } from '@angular/cdk/dialog';
import { ToastService } from '../../../core/toast/toast.service';
import { PostingRow } from './posting.models';

describe('PostingComponent', () => {
  let component: PostingComponent;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockService: jasmine.SpyObj<PostingService>;
  let mockLookup: jasmine.SpyObj<LookupService>;
  let mockDialog: jasmine.SpyObj<Dialog>;
  let mockToast: jasmine.SpyObj<ToastService>;

  const makePostings = (count: number): PostingRow[] =>
    Array.from({ length: count }, (_, i) => ({
      Pk_id: i,
      Name: `Student${i}`,
      Specialty_nm: `Spec${i}`,
      Startdate: '2026-01-01',
      Enddate: '2026-02-01',
      FacultyName: `Faculty${i}`,
      Create_by: `user${i}`,
      Create_dt: '2026-01-01'
    } as PostingRow));

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['getUsername']);
    mockAuthService.getUsername.and.returnValue('jdoe');

    mockService = jasmine.createSpyObj<PostingService>('PostingService', [
      'getPostings', 'getPostingsByStudno', 'getSpecialities', 'savePostings', 'saveSpeciality'
    ]);
    mockService.getPostings.and.returnValue(of([]));

    mockLookup = jasmine.createSpyObj<LookupService>('LookupService', [
      'getSubjectsByEmpid', 'getStudentsByCourse', 'getFacultyBySubject'
    ]);
    mockLookup.getSubjectsByEmpid.and.returnValue(of([]));
    mockLookup.getStudentsByCourse.and.returnValue(of([]));

    mockDialog = jasmine.createSpyObj<Dialog>('Dialog', ['open']);
    mockDialog.open.and.returnValue({ closed: of(null) } as any);

    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    component = new PostingComponent(
      mockAuthService, mockService, mockLookup, new FormBuilder(), mockDialog, mockToast
    );
  });

  describe('ngOnInit()', () => {
    it('sets username', () => {
      component.ngOnInit();
      expect(component.username).toBe('jdoe');
    });

    it('loads subjects', () => {
      component.ngOnInit();
      expect(mockLookup.getSubjectsByEmpid).toHaveBeenCalledWith('jdoe');
    });
  });

  describe('loadData()', () => {
    it('does nothing when no Subject_id is selected', () => {
      component.filterForm.patchValue({ Subject_id: null });
      component.loadData();
      expect(mockService.getPostings).not.toHaveBeenCalled();
    });

    it('populates dataSource on success', () => {
      const data = makePostings(3);
      mockService.getPostings.and.returnValue(of(data));
      component.filterForm.patchValue({ Subject_id: 5 });
      component.loadData();
      expect(component.dataSource).toEqual(data);
    });

    it('shows toast on error', () => {
      mockService.getPostings.and.returnValue(throwError(() => new Error()));
      component.filterForm.patchValue({ Subject_id: 5 });
      component.loadData();
      expect(mockToast.show).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.objectContaining({ variant: 'error' })
      );
    });
  });

  describe('searchedData', () => {
    beforeEach(() => { component.dataSource = makePostings(3); });

    it('returns all records when search is empty', () => {
      expect(component.searchedData.length).toBe(3);
    });

    it('filters by Name case-insensitively', () => {
      component.search.Name = 'student0';
      expect(component.searchedData.length).toBe(1);
    });

    it('filters by Specialty_nm', () => {
      component.search.Specialty_nm = 'spec1';
      expect(component.searchedData.length).toBe(1);
    });
  });

  describe('pagedData and totalPages', () => {
    it('returns 10 on first page of 15', () => {
      component.dataSource = makePostings(15);
      component.currentPage = 1;
      expect(component.pagedData.length).toBe(10);
    });

    it('calculates totalPages', () => {
      component.dataSource = makePostings(11);
      expect(component.totalPages).toBe(2);
    });
  });

  describe('openDialog()', () => {
    it('calls dialog.open with the correct Pk_id', () => {
      component.openDialog(42);
      expect(mockDialog.open).toHaveBeenCalledWith(
        jasmine.anything(),
        jasmine.objectContaining({ data: jasmine.objectContaining({ Pk_id: 42 }) })
      );
    });

    it('reloads on dialog close with truthy result', () => {
      mockDialog.open.and.returnValue({ closed: of(true) } as any);
      spyOn(component, 'loadData');
      component.openDialog(1);
      expect(component.loadData).toHaveBeenCalled();
    });
  });
});

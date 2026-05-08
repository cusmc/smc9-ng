import { of, throwError } from 'rxjs';

import { StudentViewComponent } from './student-view.component';
import { StudentViewService } from './student-view.service';
import { Dialog } from '@angular/cdk/dialog';
import { ToastService } from '../../core/toast/toast.service';
import { StudentListItem } from './student-view.models';
import { StudentLedgerDialogComponent } from './student-ledger-dialog.component';
import { StudentDetailsDialogComponent } from './student-details-dialog.component';
import { StudentResultDialogComponent } from './student-result-dialog.component';

describe('StudentViewComponent', () => {
  let component: StudentViewComponent;
  let mockService: jasmine.SpyObj<StudentViewService>;
  let mockDialog: jasmine.SpyObj<Dialog>;
  let mockToast: jasmine.SpyObj<ToastService>;

  const makeStudents = (count: number): StudentListItem[] =>
    Array.from({ length: count }, (_, i) => ({
      no: i + 1,
      name: `Student ${i}`,
      stat: 'E',
      admyear: 2020 + i,
      Inst_id: 1,
      batch_id: null,
      cursem: '',
      semrollno: '',
    }));

  beforeEach(() => {
    mockService = jasmine.createSpyObj<StudentViewService>('StudentViewService', [
      'getAll', 'getById', 'getLedger', 'getResult',
    ]);
    mockService.getAll.and.returnValue(of([]));

    mockDialog = jasmine.createSpyObj<Dialog>('Dialog', ['open']);
    mockDialog.open.and.returnValue({ closed: of(null) } as any);

    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    component = new StudentViewComponent(mockService, mockDialog, mockToast);
  });

  describe('ngOnInit()', () => {
    it('calls load()', () => {
      spyOn(component, 'load');
      component.ngOnInit();
      expect(component.load).toHaveBeenCalled();
    });
  });

  describe('load()', () => {
    it('populates students on success', () => {
      const data = makeStudents(3);
      mockService.getAll.and.returnValue(of(data));
      component.load();
      expect(component.students).toEqual(data);
    });

    it('sets loading to false on success', () => {
      component.load();
      expect(component.loading).toBeFalse();
    });

    it('resets currentPage to 1', () => {
      component.currentPage = 5;
      component.load();
      expect(component.currentPage).toBe(1);
    });

    it('shows error toast on failure', () => {
      mockService.getAll.and.returnValue(throwError(() => new Error('fail')));
      component.load();
      expect(mockToast.show).toHaveBeenCalledWith(
        jasmine.stringContaining('Error'),
        jasmine.objectContaining({ variant: 'error' }),
      );
    });

    it('sets loading to false on failure', () => {
      mockService.getAll.and.returnValue(throwError(() => new Error('fail')));
      component.load();
      expect(component.loading).toBeFalse();
    });
  });

  describe('searchedData', () => {
    beforeEach(() => {
      component.students = makeStudents(5);
    });

    it('returns all records when search is empty', () => {
      expect(component.searchedData.length).toBe(5);
    });

    it('filters by no (substring match)', () => {
      component.search.no = '3';
      expect(component.searchedData.length).toBe(1);
      expect(component.searchedData[0].no).toBe(3);
    });

    it('filters by name case-insensitively', () => {
      component.search.name = 'student 2';
      expect(component.searchedData.length).toBe(1);
      expect(component.searchedData[0].name).toBe('Student 2');
    });

    it('filters by stat case-insensitively', () => {
      component.students[0] = { ...component.students[0], stat: 'L' };
      component.search.stat = 'l';
      expect(component.searchedData.length).toBe(1);
    });

    it('filters by admyear (substring match)', () => {
      component.search.admyear = '2022';
      expect(component.searchedData.length).toBe(1);
      expect(component.searchedData[0].admyear).toBe(2022);
    });
  });

  describe('totalPages', () => {
    it('returns 3 for 31 records', () => {
      component.students = makeStudents(31);
      expect(component.totalPages).toBe(3);
    });

    it('returns 1 for exactly 15 records', () => {
      component.students = makeStudents(15);
      expect(component.totalPages).toBe(1);
    });

    it('returns minimum 1 for 0 records', () => {
      component.students = [];
      expect(component.totalPages).toBe(1);
    });
  });

  describe('pagedData', () => {
    it('returns first 15 on page 1 of 30', () => {
      component.students = makeStudents(30);
      component.currentPage = 1;
      expect(component.pagedData.length).toBe(15);
      expect(component.pagedData[0].no).toBe(1);
    });

    it('returns records 16–30 on page 2 of 30', () => {
      component.students = makeStudents(30);
      component.currentPage = 2;
      expect(component.pagedData.length).toBe(15);
      expect(component.pagedData[0].no).toBe(16);
    });
  });

  describe('prevPage()', () => {
    it('does not go below 1', () => {
      component.currentPage = 1;
      component.prevPage();
      expect(component.currentPage).toBe(1);
    });

    it('decrements currentPage', () => {
      component.currentPage = 3;
      component.prevPage();
      expect(component.currentPage).toBe(2);
    });
  });

  describe('nextPage()', () => {
    it('does not exceed totalPages', () => {
      component.students = makeStudents(5);
      component.currentPage = 1;
      component.nextPage();
      expect(component.currentPage).toBe(1);
    });

    it('increments currentPage when not at last page', () => {
      component.students = makeStudents(30);
      component.currentPage = 1;
      component.nextPage();
      expect(component.currentPage).toBe(2);
    });
  });

  describe('openLedger()', () => {
    it('opens StudentLedgerDialogComponent with student data', () => {
      const student = makeStudents(1)[0];
      component.openLedger(student);
      expect(mockDialog.open).toHaveBeenCalledWith(
        StudentLedgerDialogComponent,
        jasmine.objectContaining({ data: student }),
      );
    });
  });

  describe('openDetails()', () => {
    it('opens StudentDetailsDialogComponent with student data', () => {
      const student = makeStudents(1)[0];
      component.openDetails(student);
      expect(mockDialog.open).toHaveBeenCalledWith(
        StudentDetailsDialogComponent,
        jasmine.objectContaining({ data: student }),
      );
    });
  });

  describe('openResult()', () => {
    it('opens StudentResultDialogComponent with student data', () => {
      const student = makeStudents(1)[0];
      component.openResult(student);
      expect(mockDialog.open).toHaveBeenCalledWith(
        StudentResultDialogComponent,
        jasmine.objectContaining({ data: student }),
      );
    });
  });

  describe('openUploadDocu()', () => {
    it('opens a new window with StudDocuUpload URL', () => {
      spyOn(window, 'open');
      const student = makeStudents(1)[0];
      component.openUploadDocu(student);
      expect(window.open).toHaveBeenCalledWith(
        jasmine.stringContaining('/ECampus/StudDocuUpload'),
      );
    });

    it('includes Studno in the URL', () => {
      spyOn(window, 'open');
      const student = makeStudents(1)[0];
      component.openUploadDocu(student);
      expect(window.open).toHaveBeenCalledWith(
        jasmine.stringContaining(`Studno=${student.no}`),
      );
    });
  });
});

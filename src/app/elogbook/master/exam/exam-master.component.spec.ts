import { of, throwError } from 'rxjs';

import { ExamMasterComponent } from './exam-master.component';
import { ExamMasterService } from './exam-master.service';
import { Dialog } from '@angular/cdk/dialog';
import { ToastService } from '../../../core/toast/toast.service';
import { ExamMast } from './exam-master.models';

describe('ExamMasterComponent', () => {
  let component: ExamMasterComponent;
  let mockService: jasmine.SpyObj<ExamMasterService>;
  let mockDialog: jasmine.SpyObj<Dialog>;
  let mockToast: jasmine.SpyObj<ToastService>;

  const makeExams = (count: number): ExamMast[] =>
    Array.from({ length: count }, (_, i) => ({
      Exam_id: i,
      Exam_nm: `Exam ${i}`,
      Course_id: i,
      Admyear: `${2020 + i}`,
      Course_nm: `Course ${i}`,
      Create_by: `user${i}`,
      Create_dt: '2026-01-01'
    } as ExamMast));

  beforeEach(() => {
    mockService = jasmine.createSpyObj<ExamMasterService>('ExamMasterService', [
      'getExams', 'getExamById', 'saveExam', 'deleteExam', 'getCourses',
      'getSubjectsByCourse', 'getSectionsBySubject', 'getCourseById'
    ]);
    mockService.getExams.and.returnValue(of([]));
    mockService.getCourses.and.returnValue(of([]));
    mockService.getSubjectsByCourse.and.returnValue(of([]));
    mockService.deleteExam.and.returnValue(of(null));

    mockDialog = jasmine.createSpyObj<Dialog>('Dialog', ['open']);
    mockDialog.open.and.returnValue({ closed: of(null) } as any);

    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    component = new ExamMasterComponent(mockService, mockDialog, mockToast);
  });

  describe('ngOnInit()', () => {
    it('calls loadExams()', () => {
      spyOn(component, 'loadExams');
      component.ngOnInit();
      expect(component.loadExams).toHaveBeenCalled();
    });
  });

  describe('loadExams()', () => {
    it('populates exams on success', () => {
      const data = makeExams(3);
      mockService.getExams.and.returnValue(of(data));
      component.loadExams();
      expect(component.exams).toEqual(data);
    });

    it('resets currentPage to 1', () => {
      component.currentPage = 5;
      component.loadExams();
      expect(component.currentPage).toBe(1);
    });

    it('shows toast on error', () => {
      mockService.getExams.and.returnValue(throwError(() => new Error()));
      component.loadExams();
      expect(mockToast.show).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.objectContaining({ variant: 'error' })
      );
    });
  });

  describe('searchedData', () => {
    beforeEach(() => { component.exams = makeExams(3); });

    it('returns all when search is empty', () => {
      expect(component.searchedData.length).toBe(3);
    });

    it('filters by Exam_nm case-insensitively', () => {
      component.search.Exam_nm = 'exam 0';
      expect(component.searchedData.length).toBe(1);
    });

    it('filters by Admyear as substring', () => {
      component.search.Admyear = '2020';
      expect(component.searchedData.length).toBe(1);
    });
  });

  describe('pagedExams and totalPages', () => {
    it('returns 10 per page', () => {
      component.exams = makeExams(15);
      component.currentPage = 1;
      expect(component.pagedExams.length).toBe(10);
    });

    it('calculates totalPages', () => {
      component.exams = makeExams(11);
      expect(component.totalPages).toBe(2);
    });
  });

  describe('onSearchChange()', () => {
    it('resets currentPage to 1', () => {
      component.currentPage = 3;
      component.onSearchChange();
      expect(component.currentPage).toBe(1);
    });
  });

  describe('deleteExam()', () => {
    it('calls service.deleteExam and reloads when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(component, 'loadExams');
      component.deleteExam(3);
      expect(mockService.deleteExam).toHaveBeenCalledWith(3);
      expect(component.loadExams).toHaveBeenCalled();
    });

    it('does not delete when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.deleteExam(3);
      expect(mockService.deleteExam).not.toHaveBeenCalled();
    });
  });

  describe('openAddDialog()', () => {
    it('calls dialog.open with null data', () => {
      component.openAddDialog();
      expect(mockDialog.open).toHaveBeenCalledWith(
        jasmine.anything(),
        jasmine.objectContaining({ data: null })
      );
    });
  });

  describe('openEditDialog()', () => {
    it('calls dialog.open with exam data', () => {
      const exam = makeExams(1)[0];
      component.openEditDialog(exam);
      expect(mockDialog.open).toHaveBeenCalledWith(
        jasmine.anything(),
        jasmine.objectContaining({ data: exam })
      );
    });
  });
});

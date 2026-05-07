import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { ExamMasterDialogComponent } from './exam-master-dialog.component';
import { ExamMasterService } from './exam-master.service';
import { ToastService } from '../../../core/toast/toast.service';
import { ExamMast } from './exam-master.models';

describe('ExamMasterDialogComponent', () => {
  let mockService: jasmine.SpyObj<ExamMasterService>;
  let mockDialogRef: jasmine.SpyObj<DialogRef<boolean, ExamMasterDialogComponent>>;
  let mockToast: jasmine.SpyObj<ToastService>;

  function setup(data: ExamMast | null) {
    mockService = jasmine.createSpyObj<ExamMasterService>('ExamMasterService', [
      'getExams', 'getExamById', 'saveExam', 'deleteExam', 'getCourses',
      'getSubjectsByCourse', 'getSectionsBySubject', 'getCourseById'
    ]);
    mockService.getCourses.and.returnValue(of([]));
    mockService.getExamById.and.returnValue(of(data as ExamMast));
    mockService.saveExam.and.returnValue(of(null));
    mockService.deleteExam.and.returnValue(of(null));
    mockService.getSubjectsByCourse.and.returnValue(of([]));
    mockService.getSectionsBySubject.and.returnValue(of([]));

    mockDialogRef = jasmine.createSpyObj<DialogRef<boolean, ExamMasterDialogComponent>>('DialogRef', ['close']);
    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    TestBed.configureTestingModule({
      imports: [ExamMasterDialogComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: data },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: ExamMasterService, useValue: mockService },
        { provide: ToastService, useValue: mockToast }
      ]
    });

    const fixture = TestBed.createComponent(ExamMasterDialogComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('form validation', () => {
    it('is invalid when Exam_nm and Course_id are empty', () => {
      const component = setup(null);
      expect(component.form.invalid).toBeTrue();
    });

    it('is valid when required fields are filled', () => {
      const component = setup(null);
      component.form.patchValue({ Exam_nm: 'Final', Course_id: 1 });
      expect(component.form.valid).toBeTrue();
    });
  });

  describe('ngOnInit()', () => {
    it('calls getCourses()', () => {
      setup(null);
      expect(mockService.getCourses).toHaveBeenCalled();
    });

    it('calls getExamById when editing', () => {
      const exam = { Exam_id: 10, Exam_nm: 'Test', Course_id: 1 } as ExamMast;
      setup(exam);
      expect(mockService.getExamById).toHaveBeenCalledWith(10);
    });

    it('does not call getExamById in add mode', () => {
      setup(null);
      expect(mockService.getExamById).not.toHaveBeenCalled();
    });
  });

  describe('onCourseChange()', () => {
    it('loads subjects for the selected course', () => {
      const component = setup(null);
      component.form.patchValue({ Course_id: 2 });
      component.onCourseChange();
      expect(mockService.getSubjectsByCourse).toHaveBeenCalledWith(2);
    });

    it('clears subject and section fields', () => {
      const component = setup(null);
      component.form.patchValue({ Course_id: 1, Subject_id: 5, Section_id: 3 });
      component.onCourseChange();
      expect(component.form.get('Subject_id')?.value).toBe('');
      expect(component.form.get('Section_id')?.value).toBe('');
    });
  });

  describe('onSubjectChange()', () => {
    it('loads sections for the selected subject', () => {
      const component = setup(null);
      component.form.patchValue({ Subject_id: 7 });
      component.onSubjectChange();
      expect(mockService.getSectionsBySubject).toHaveBeenCalledWith(7);
    });
  });

  describe('onSave()', () => {
    it('does nothing when form is invalid', () => {
      const component = setup(null);
      component.onSave();
      expect(mockService.saveExam).not.toHaveBeenCalled();
    });

    it('calls saveExam and closes with true on success', () => {
      const component = setup(null);
      component.form.patchValue({ Exam_nm: 'Final', Course_id: 1 });
      component.onSave();
      expect(mockService.saveExam).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('shows toast on error', () => {
      const component = setup(null);
      mockService.saveExam.and.returnValue(throwError(() => new Error()));
      component.form.patchValue({ Exam_nm: 'Final', Course_id: 1 });
      component.onSave();
      expect(mockToast.show).toHaveBeenCalled();
    });
  });

  describe('onDelete()', () => {
    it('calls deleteExam and closes when confirmed', () => {
      const exam = { Exam_id: 10, Exam_nm: 'Test', Course_id: 1 } as ExamMast;
      const component = setup(exam);
      spyOn(window, 'confirm').and.returnValue(true);
      component.onDelete();
      expect(mockService.deleteExam).toHaveBeenCalledWith(10);
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('does not delete when cancelled', () => {
      const exam = { Exam_id: 10, Exam_nm: 'Test', Course_id: 1 } as ExamMast;
      const component = setup(exam);
      spyOn(window, 'confirm').and.returnValue(false);
      component.onDelete();
      expect(mockService.deleteExam).not.toHaveBeenCalled();
    });
  });

  describe('onCancel()', () => {
    it('closes dialog', () => {
      const component = setup(null);
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});

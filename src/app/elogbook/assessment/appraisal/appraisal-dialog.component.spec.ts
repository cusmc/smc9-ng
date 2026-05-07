import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { AppraisalDialogComponent } from './appraisal-dialog.component';
import { AppraisalService } from './appraisal.service';
import { LookupService } from '../../shared/lookup.service';
import { ToastService } from '../../../core/toast/toast.service';

describe('AppraisalDialogComponent', () => {
  let component: AppraisalDialogComponent;
  let mockAppraisalService: jasmine.SpyObj<AppraisalService>;
  let mockLookup: jasmine.SpyObj<LookupService>;
  let mockDialogRef: jasmine.SpyObj<DialogRef<boolean, AppraisalDialogComponent>>;
  let mockToast: jasmine.SpyObj<ToastService>;

  const dialogData = { Studno: -1, username: 'jdoe' };

  beforeEach(async () => {
    mockAppraisalService = jasmine.createSpyObj<AppraisalService>('AppraisalService', [
      'getCourses', 'getAppraisalByStudno', 'getParamsByCourse', 'saveAppraisal'
    ]);
    mockAppraisalService.getCourses.and.returnValue(of([]));
    mockAppraisalService.saveAppraisal.and.returnValue(of(null));

    mockLookup = jasmine.createSpyObj<LookupService>('LookupService', ['getStudentsByCourse']);
    mockLookup.getStudentsByCourse.and.returnValue(of([]));

    mockDialogRef = jasmine.createSpyObj<DialogRef<boolean, AppraisalDialogComponent>>('DialogRef', ['close']);

    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    await TestBed.configureTestingModule({
      imports: [AppraisalDialogComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: dialogData },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: AppraisalService, useValue: mockAppraisalService },
        { provide: LookupService, useValue: mockLookup },
        { provide: ToastService, useValue: mockToast }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppraisalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('form initialization', () => {
    it('has Courseid, Studno, Remarks and Details controls', () => {
      expect(component.form.get('Courseid')).toBeTruthy();
      expect(component.form.get('Studno')).toBeTruthy();
      expect(component.form.get('Remarks')).toBeTruthy();
      expect(component.details).toBeTruthy();
    });

    it('Details FormArray starts empty', () => {
      expect(component.details.length).toBe(0);
    });
  });

  describe('ngOnInit()', () => {
    it('calls getCourses()', () => {
      expect(mockAppraisalService.getCourses).toHaveBeenCalled();
    });
  });

  describe('visibleDetails', () => {
    it('excludes rows where CanTag is Y', () => {
      const fb = (component as any).fb;
      component.details.push(fb.group({ CanTag: ['N'], Descr: ['A'] }));
      component.details.push(fb.group({ CanTag: ['Y'], Descr: ['B'] }));
      expect(component.visibleDetails.length).toBe(1);
      expect(component.visibleDetails[0].get('Descr')?.value).toBe('A');
    });
  });

  describe('save()', () => {
    it('calls saveAppraisal and closes with true on success', () => {
      component.save();
      expect(mockAppraisalService.saveAppraisal).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('shows toast on error and does not close', () => {
      mockAppraisalService.saveAppraisal.and.returnValue(throwError(() => new Error('fail')));
      component.save();
      expect(mockToast.show).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.objectContaining({ variant: 'error' })
      );
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('cancel()', () => {
    it('closes dialog with false', () => {
      component.cancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });
  });
});

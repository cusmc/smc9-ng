import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { PostingDialogComponent } from './posting-dialog.component';
import { PostingService } from './posting.service';
import { LookupService } from '../../shared/lookup.service';
import { ToastService } from '../../../core/toast/toast.service';

describe('PostingDialogComponent', () => {
  let component: PostingDialogComponent;
  let mockPostingService: jasmine.SpyObj<PostingService>;
  let mockLookup: jasmine.SpyObj<LookupService>;
  let mockDialogRef: jasmine.SpyObj<DialogRef<boolean, PostingDialogComponent>>;
  let mockToast: jasmine.SpyObj<ToastService>;

  const dialogData = { Pk_id: -1, username: 'jdoe' };

  beforeEach(async () => {
    mockPostingService = jasmine.createSpyObj<PostingService>('PostingService', [
      'getPostings', 'getPostingsByStudno', 'getSpecialities', 'savePostings', 'saveSpeciality'
    ]);
    mockPostingService.getPostingsByStudno.and.returnValue(of([]));
    mockPostingService.getSpecialities.and.returnValue(of([]));
    mockPostingService.savePostings.and.returnValue(of(null));

    mockLookup = jasmine.createSpyObj<LookupService>('LookupService', [
      'getSubjectsByEmpid', 'getStudentsByCourse', 'getFacultyBySubject'
    ]);
    mockLookup.getSubjectsByEmpid.and.returnValue(of([]));
    mockLookup.getStudentsByCourse.and.returnValue(of([]));
    mockLookup.getFacultyBySubject.and.returnValue(of([]));

    mockDialogRef = jasmine.createSpyObj<DialogRef<boolean, PostingDialogComponent>>('DialogRef', ['close']);
    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    await TestBed.configureTestingModule({
      imports: [PostingDialogComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: dialogData },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: PostingService, useValue: mockPostingService },
        { provide: LookupService, useValue: mockLookup },
        { provide: ToastService, useValue: mockToast }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PostingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('form initialization', () => {
    it('requires Subject_id and Studno', () => {
      expect(component.form.get('Subject_id')?.errors?.['required']).toBeTruthy();
      expect(component.form.get('Studno')?.errors?.['required']).toBeTruthy();
    });
  });

  describe('addRow()', () => {
    it('appends a new row to the rows FormArray', () => {
      const before = component.rows.length;
      component.addRow();
      expect(component.rows.length).toBe(before + 1);
    });

    it('new row has Pk_id = 0 and CanTag = N', () => {
      component.addRow();
      const last = component.rows.at(component.rows.length - 1);
      expect(last.get('Pk_id')?.value).toBe(0);
      expect(last.get('CanTag')?.value).toBe('N');
    });
  });

  describe('removeRow()', () => {
    it('sets CanTag to Y on matching row', () => {
      component.addRow();
      const row = component.rows.at(0);
      const itemno = row.get('itemno')?.value;
      component.removeRow(itemno);
      expect(row.get('CanTag')?.value).toBe('Y');
    });
  });

  describe('visibleRows', () => {
    it('excludes rows with CanTag === Y', () => {
      component.addRow();
      component.addRow();
      const itemno = component.rows.at(0).get('itemno')?.value;
      component.removeRow(itemno);
      expect(component.visibleRows.length).toBe(1);
    });
  });

  describe('save()', () => {
    it('does nothing when form is invalid', () => {
      component.save();
      expect(mockPostingService.savePostings).not.toHaveBeenCalled();
    });

    it('calls savePostings and closes with true on success', () => {
      component.form.patchValue({ Subject_id: 1, Studno: 'S001' });
      component.save();
      expect(mockPostingService.savePostings).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('shows toast on error', () => {
      mockPostingService.savePostings.and.returnValue(throwError(() => new Error('fail')));
      component.form.patchValue({ Subject_id: 1, Studno: 'S001' });
      component.save();
      expect(mockToast.show).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.objectContaining({ variant: 'error' })
      );
    });
  });

  describe('cancel()', () => {
    it('closes dialog with false', () => {
      component.cancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });
  });
});

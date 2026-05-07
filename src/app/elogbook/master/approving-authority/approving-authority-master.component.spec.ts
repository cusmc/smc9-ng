import { of, throwError } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';

import { ApprovingAuthorityMasterComponent } from './approving-authority-master.component';
import { AuthService } from '../../../auth/auth.service';
import { LookupService } from '../../shared/lookup.service';
import { ApprovingAuthorityMasterService } from './approving-authority-master.service';
import { ToastService } from '../../../core/toast/toast.service';

describe('ApprovingAuthorityMasterComponent', () => {
  let component: ApprovingAuthorityMasterComponent;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockLookup: jasmine.SpyObj<LookupService>;
  let mockService: jasmine.SpyObj<ApprovingAuthorityMasterService>;
  let mockToast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['getUsername']);
    mockAuthService.getUsername.and.returnValue('jdoe');

    mockLookup = jasmine.createSpyObj<LookupService>('LookupService', [
      'getSubjectsByEmpid', 'getStudentsByCourse'
    ]);
    mockLookup.getSubjectsByEmpid.and.returnValue(of([]));
    mockLookup.getStudentsByCourse.and.returnValue(of([]));

    mockService = jasmine.createSpyObj<ApprovingAuthorityMasterService>(
      'ApprovingAuthorityMasterService',
      ['getStudGuidesByStudent', 'saveStudGuides', 'getStudGidesList', 'getAllStudents']
    );
    mockService.getStudGuidesByStudent.and.returnValue(of([]));
    mockService.saveStudGuides.and.returnValue(of(null));

    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    component = new ApprovingAuthorityMasterComponent(
      mockAuthService, mockLookup, new FormBuilder(), mockService, mockToast
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

  describe('guides getter', () => {
    it('returns the guides FormArray', () => {
      expect(component.guides).toBeTruthy();
      expect(component.guides.length).toBe(0);
    });
  });

  describe('addGuide()', () => {
    it('pushes a new guide row', () => {
      component.selectedStudentNo = 'S001';
      component.addGuide();
      expect(component.guides.length).toBe(1);
    });

    it('new row has Empid required validator', () => {
      component.selectedStudentNo = 'S001';
      component.addGuide();
      const ctrl = component.guides.at(0).get('Empid');
      ctrl?.setValue('');
      expect(ctrl?.errors?.['required']).toBeTruthy();
    });

    it('new row has Studno set to selectedStudentNo', () => {
      component.selectedStudentNo = 'S999';
      component.addGuide();
      expect(component.guides.at(0).get('Studno')?.value).toBe('S999');
    });
  });

  describe('markForDeletion()', () => {
    it('sets CanTag to true on the indexed guide', () => {
      component.selectedStudentNo = 'S001';
      component.addGuide();
      component.markForDeletion(0);
      expect(component.guides.at(0).get('CanTag')?.value).toBeTrue();
    });
  });

  describe('onSubjectChange()', () => {
    it('clears guides and loads students', () => {
      component.selectedStudentNo = 'S001';
      component.addGuide();
      component.selectedSubjectId = 5;
      component.onSubjectChange();
      expect(component.guides.length).toBe(0);
      expect(mockLookup.getStudentsByCourse).toHaveBeenCalledWith(5);
    });
  });

  describe('onSave()', () => {
    it('maps CanTag boolean to Y/N and calls saveStudGuides', () => {
      component.selectedStudentNo = 'S001';
      component.addGuide();
      component.guides.at(0).patchValue({ Empid: 'E001', CanTag: true });
      component.onSave();
      const payload = mockService.saveStudGuides.calls.mostRecent().args[0];
      expect(payload[0].CanTag).toBe('Y');
    });

    it('shows success toast on save', () => {
      component.onSave();
      expect(mockToast.show).toHaveBeenCalledWith(
        jasmine.stringContaining('saved'),
        jasmine.objectContaining({ variant: 'success' })
      );
    });

    it('shows error toast on failure', () => {
      mockService.saveStudGuides.and.returnValue(throwError(() => new Error()));
      component.onSave();
      expect(mockToast.show).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.objectContaining({ variant: 'error' })
      );
    });
  });
});

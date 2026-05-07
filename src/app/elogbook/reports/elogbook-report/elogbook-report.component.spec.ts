import { of, throwError } from 'rxjs';
import { FormBuilder } from '@angular/forms';

import { ElogbookReportComponent } from './elogbook-report.component';
import { ApiService } from '../../../shared/api.service';
import { LookupService } from '../../shared/lookup.service';
import { AuthService } from '../../../auth/auth.service';
import { ToastService } from '../../../core/toast/toast.service';

describe('ElogbookReportComponent', () => {
  let component: ElogbookReportComponent;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockLookup: jasmine.SpyObj<LookupService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockToast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['getUsername']);
    mockAuthService.getUsername.and.returnValue('E001');

    mockLookup = jasmine.createSpyObj<LookupService>('LookupService', [
      'getSubjectsByEmpid', 'getStudentsByCourse'
    ]);
    mockLookup.getSubjectsByEmpid.and.returnValue(of([]));
    mockLookup.getStudentsByCourse.and.returnValue(of([]));

    mockApiService = jasmine.createSpyObj<ApiService>('ApiService', ['postBlob']);
    mockApiService.postBlob.and.returnValue(of(new Blob(['pdf'], { type: 'application/pdf' })));

    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    component = new ElogbookReportComponent(
      new FormBuilder(), mockApiService, mockLookup, mockAuthService, mockToast
    );
  });

  describe('form', () => {
    it('is invalid when Subject_id and Studno are null', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('is valid when both fields are filled', () => {
      component.form.patchValue({ Subject_id: 1, Studno: 'S001' });
      expect(component.form.valid).toBeTrue();
    });
  });

  describe('ngOnInit()', () => {
    it('calls getSubjectsByEmpid with empid', () => {
      component.ngOnInit();
      expect(mockLookup.getSubjectsByEmpid).toHaveBeenCalledWith('E001');
    });

    it('loads students when Subject_id value changes', () => {
      component.ngOnInit();
      component.form.patchValue({ Subject_id: 5 });
      expect(mockLookup.getStudentsByCourse).toHaveBeenCalledWith(5);
    });
  });

  describe('generate()', () => {
    it('does nothing when form is invalid', () => {
      component.generate();
      expect(mockApiService.postBlob).not.toHaveBeenCalled();
    });

    it('calls postBlob with correct endpoint and values', () => {
      spyOn(window, 'open');
      spyOn(URL, 'createObjectURL').and.returnValue('blob:url');
      component.form.patchValue({ Subject_id: 5, Studno: 'S001' });
      component.generate();
      expect(mockApiService.postBlob).toHaveBeenCalledWith(
        '/api/Campus/competenciessAPI/ElogbookRpt',
        { Studno: 'S001', Subject_id: 5 }
      );
    });

    it('shows toast on error', () => {
      mockApiService.postBlob.and.returnValue(throwError(() => new Error()));
      component.form.patchValue({ Subject_id: 5, Studno: 'S001' });
      component.generate();
      expect(mockToast.show).toHaveBeenCalledWith(
        jasmine.stringContaining('Error'),
        jasmine.objectContaining({ variant: 'error' })
      );
    });
  });
});

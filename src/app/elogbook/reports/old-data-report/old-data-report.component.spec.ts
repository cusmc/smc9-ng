import { of, throwError } from 'rxjs';
import { FormBuilder } from '@angular/forms';

import { OldDataReportComponent } from './old-data-report.component';
import { ApiService } from '../../../shared/api.service';
import { LookupService } from '../../shared/lookup.service';
import { ToastService } from '../../../core/toast/toast.service';

describe('OldDataReportComponent', () => {
  let component: OldDataReportComponent;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockLookup: jasmine.SpyObj<LookupService>;
  let mockToast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    mockLookup = jasmine.createSpyObj<LookupService>('LookupService', [
      'getAllStudents', 'getCodeList'
    ]);
    mockLookup.getAllStudents.and.returnValue(of([]));
    mockLookup.getCodeList.and.returnValue(of([]));

    mockApiService = jasmine.createSpyObj<ApiService>('ApiService', ['getBlob']);
    mockApiService.getBlob.and.returnValue(of(new Blob(['data'], { type: 'application/pdf' })));

    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    component = new OldDataReportComponent(new FormBuilder(), mockApiService, mockLookup, mockToast);
  });

  describe('form', () => {
    it('is invalid when Studno and Output are null', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('is valid when both fields are filled', () => {
      component.form.patchValue({ Studno: 'S001', Output: 'PDF' });
      expect(component.form.valid).toBeTrue();
    });
  });

  describe('ngOnInit()', () => {
    it('calls getAllStudents()', () => {
      component.ngOnInit();
      expect(mockLookup.getAllStudents).toHaveBeenCalled();
    });

    it('calls getCodeList("OUTPUTTO")', () => {
      component.ngOnInit();
      expect(mockLookup.getCodeList).toHaveBeenCalledWith('OUTPUTTO');
    });
  });

  describe('generate()', () => {
    it('does nothing when form is invalid', () => {
      component.generate();
      expect(mockApiService.getBlob).not.toHaveBeenCalled();
    });

    it('calls getBlob with correct endpoint and params', () => {
      spyOn(window, 'open');
      spyOn(URL, 'createObjectURL').and.returnValue('blob:url');
      component.form.patchValue({ Studno: 'S001', Output: 'PDF' });
      component.generate();
      expect(mockApiService.getBlob).toHaveBeenCalledWith(
        '/api/Campus/studentcompetencysAPI/LogBookOldData',
        { Studno: 'S001', Output: 'PDF' }
      );
    });

    it('shows toast on error', () => {
      mockApiService.getBlob.and.returnValue(throwError(() => new Error()));
      component.form.patchValue({ Studno: 'S001', Output: 'PDF' });
      component.generate();
      expect(mockToast.show).toHaveBeenCalledWith(
        jasmine.stringContaining('Error'),
        jasmine.objectContaining({ variant: 'error' })
      );
    });
  });
});

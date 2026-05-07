import { TestBed } from '@angular/core/testing';
import { ToastrService, ActiveToast } from 'ngx-toastr';

import { ToastService } from './toast.service';

function makeToastReturn(id = 1): ActiveToast<any> {
  return { toastId: id } as ActiveToast<any>;
}

describe('ToastService', () => {
  let service: ToastService;
  let mockToastr: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    mockToastr = jasmine.createSpyObj<ToastrService>('ToastrService', [
      'success',
      'error',
      'warning',
      'info',
      'clear',
      'remove'
    ]);
    mockToastr.success.and.returnValue(makeToastReturn(1));
    mockToastr.error.and.returnValue(makeToastReturn(2));
    mockToastr.warning.and.returnValue(makeToastReturn(3));
    mockToastr.info.and.returnValue(makeToastReturn(4));

    TestBed.configureTestingModule({
      providers: [ToastService, { provide: ToastrService, useValue: mockToastr }]
    });
    service = TestBed.inject(ToastService);
  });

  describe('showSuccess()', () => {
    it('calls toastr.success with the provided message', () => {
      service.showSuccess('Saved!');
      expect(mockToastr.success).toHaveBeenCalledWith(
        'Saved!',
        'Success',
        jasmine.anything()
      );
    });
  });

  describe('showError()', () => {
    it('calls toastr.error with the provided message', () => {
      service.showError('Something went wrong.');
      expect(mockToastr.error).toHaveBeenCalledWith(
        'Something went wrong.',
        'Error',
        jasmine.anything()
      );
    });
  });

  describe('showWarning()', () => {
    it('calls toastr.warning with the provided message', () => {
      service.showWarning('Check your input.');
      expect(mockToastr.warning).toHaveBeenCalledWith(
        'Check your input.',
        'Warning',
        jasmine.anything()
      );
    });
  });

  describe('showInfo()', () => {
    it('calls toastr.info with the provided message', () => {
      service.showInfo('FYI.');
      expect(mockToastr.info).toHaveBeenCalledWith('FYI.', 'Information', jasmine.anything());
    });
  });

  describe('showSaveSuccess()', () => {
    it('calls toastr.success with an item-specific save message', () => {
      service.showSaveSuccess('Activity');
      expect(mockToastr.success).toHaveBeenCalledWith(
        'Activity saved successfully!',
        'Success',
        jasmine.anything()
      );
    });

    it('uses "Item" as default item name', () => {
      service.showSaveSuccess();
      expect(mockToastr.success).toHaveBeenCalledWith(
        'Item saved successfully!',
        jasmine.anything(),
        jasmine.anything()
      );
    });
  });

  describe('showLoginSuccess()', () => {
    it('includes the username in the welcome message when provided', () => {
      service.showLoginSuccess('jdoe');
      expect(mockToastr.success).toHaveBeenCalledWith(
        'Welcome back, jdoe!',
        jasmine.anything(),
        jasmine.anything()
      );
    });

    it('uses a generic message when no username is provided', () => {
      service.showLoginSuccess();
      expect(mockToastr.success).toHaveBeenCalledWith(
        'Login successful!',
        jasmine.anything(),
        jasmine.anything()
      );
    });
  });

  describe('showServerError()', () => {
    it('calls toastr.error with a default server error message', () => {
      service.showServerError();
      expect(mockToastr.error).toHaveBeenCalledWith(
        jasmine.stringContaining('Server error'),
        'Server Error',
        jasmine.anything()
      );
    });

    it('calls toastr.error with a custom message when provided', () => {
      service.showServerError('DB unavailable');
      expect(mockToastr.error).toHaveBeenCalledWith(
        'DB unavailable',
        'Server Error',
        jasmine.anything()
      );
    });
  });

  describe('clearAll()', () => {
    it('calls toastr.clear with no arguments', () => {
      service.clearAll();
      expect(mockToastr.clear).toHaveBeenCalledWith();
    });
  });

  describe('clearToast()', () => {
    it('calls toastr.clear with the specific toast id', () => {
      service.clearToast(7);
      expect(mockToastr.clear).toHaveBeenCalledWith(7);
    });
  });

  describe('show()', () => {
    it('delegates to toastr.info by default', () => {
      service.show('Hello');
      expect(mockToastr.info).toHaveBeenCalled();
    });

    it('delegates to toastr.success when variant is success', () => {
      service.show('Done', { variant: 'success' });
      expect(mockToastr.success).toHaveBeenCalled();
    });

    it('returns the toast id as a string', () => {
      const id = service.show('Hi', { variant: 'error' });
      expect(typeof id).toBe('string');
    });
  });

  describe('dismiss()', () => {
    it('calls toastr.remove when given a numeric string id', () => {
      service.dismiss('3');
      expect(mockToastr.remove).toHaveBeenCalledWith(3);
    });

    it('calls toastr.clear when given a non-numeric id', () => {
      service.dismiss('non-numeric-id');
      expect(mockToastr.clear).toHaveBeenCalled();
    });
  });
});

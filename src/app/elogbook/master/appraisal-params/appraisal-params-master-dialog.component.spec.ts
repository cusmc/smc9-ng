import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { AppraisalParametersMasterDialogComponent } from './appraisal-params-master-dialog.component';
import { AppraisalParametersMasterService } from './appraisal-params-master.service';
import { ToastService } from '../../../core/toast/toast.service';
import { AppraisalParameter } from './appraisal-params-master.models';

describe('AppraisalParametersMasterDialogComponent', () => {
  let mockService: jasmine.SpyObj<AppraisalParametersMasterService>;
  let mockDialogRef: jasmine.SpyObj<DialogRef<boolean, AppraisalParametersMasterDialogComponent>>;
  let mockToast: jasmine.SpyObj<ToastService>;

  function setup(data: AppraisalParameter | null) {
    mockService = jasmine.createSpyObj<AppraisalParametersMasterService>(
      'AppraisalParametersMasterService',
      ['getParameters', 'saveParameter', 'deleteParameter', 'getParameterById', 'importParameters']
    );
    mockService.saveParameter.and.returnValue(of(null));
    mockService.deleteParameter.and.returnValue(of(null));

    mockDialogRef = jasmine.createSpyObj<DialogRef<boolean, AppraisalParametersMasterDialogComponent>>('DialogRef', ['close']);
    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    TestBed.configureTestingModule({
      imports: [AppraisalParametersMasterDialogComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: data },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: AppraisalParametersMasterService, useValue: mockService },
        { provide: ToastService, useValue: mockToast }
      ]
    });

    const fixture = TestBed.createComponent(AppraisalParametersMasterDialogComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('when data is null (add mode)', () => {
    let component: AppraisalParametersMasterDialogComponent;
    beforeEach(() => { component = setup(null); });

    it('initializes form with default empty values', () => {
      expect(component.form.get('Parameterid')?.value).toBe(0);
      expect(component.form.get('Code')?.value).toBe('');
      expect(component.form.get('Isactive')?.value).toBe('Y');
    });
  });

  describe('when data is provided (edit mode)', () => {
    let component: AppraisalParametersMasterDialogComponent;
    const param: AppraisalParameter = {
      Parameterid: 5, Code: 'P01', Descr: 'Test', Course_id: 1,
      Maxscore: 10, Isheader: 'N', Ismandatory: 'Y', Displayorder: 1, Isactive: 'Y'
    };
    beforeEach(() => { component = setup(param); });

    it('pre-fills form with parameter values', () => {
      expect(component.form.get('Parameterid')?.value).toBe(5);
      expect(component.form.get('Code')?.value).toBe('P01');
      expect(component.form.get('Ismandatory')?.value).toBe('Y');
    });
  });

  describe('onSave()', () => {
    let component: AppraisalParametersMasterDialogComponent;
    beforeEach(() => { component = setup(null); });

    it('calls saveParameter and closes with true on success', () => {
      component.onSave();
      expect(mockService.saveParameter).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('shows toast and does not close on error', () => {
      mockService.saveParameter.and.returnValue(throwError(() => new Error()));
      component.onSave();
      expect(mockToast.show).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.objectContaining({ variant: 'error' })
      );
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('onDelete()', () => {
    let component: AppraisalParametersMasterDialogComponent;
    const param: AppraisalParameter = {
      Parameterid: 5, Code: 'P01', Descr: 'Test', Course_id: 1,
      Maxscore: 10, Isheader: 'N', Ismandatory: 'N', Displayorder: 1, Isactive: 'Y'
    };
    beforeEach(() => { component = setup(param); });

    it('calls deleteParameter and closes with true when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.onDelete();
      expect(mockService.deleteParameter).toHaveBeenCalledWith(5);
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('does not delete when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.onDelete();
      expect(mockService.deleteParameter).not.toHaveBeenCalled();
    });
  });

  describe('onCancel()', () => {
    it('closes dialog without argument', () => {
      const component = setup(null);
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });
  });
});

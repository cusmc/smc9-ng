import { of, throwError } from 'rxjs';
import { FormBuilder } from '@angular/forms';

import { AppraisalParametersMasterComponent } from './appraisal-params-master.component';
import { AuthService } from '../../../auth/auth.service';
import { LookupService } from '../../shared/lookup.service';
import { AppraisalParametersMasterService } from './appraisal-params-master.service';
import { Dialog } from '@angular/cdk/dialog';
import { ToastService } from '../../../core/toast/toast.service';
import { AppraisalParameter } from './appraisal-params-master.models';

describe('AppraisalParametersMasterComponent', () => {
  let component: AppraisalParametersMasterComponent;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockLookup: jasmine.SpyObj<LookupService>;
  let mockService: jasmine.SpyObj<AppraisalParametersMasterService>;
  let mockDialog: jasmine.SpyObj<Dialog>;
  let mockToast: jasmine.SpyObj<ToastService>;

  const makeParams = (count: number): AppraisalParameter[] =>
    Array.from({ length: count }, (_, i) => ({
      Parameterid: i,
      Code: `CODE${i}`,
      Descr: `Description ${i}`,
      Course_nm: `Course${i}`,
      Displayorder: i,
      Isactive: i % 2 === 0 ? 'Y' : 'N',
      Ismandatory: 'N',
      Isheader: 'N'
    } as AppraisalParameter));

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['getUsername']);
    mockAuthService.getUsername.and.returnValue('jdoe');

    mockLookup = jasmine.createSpyObj<LookupService>('LookupService', ['getSubjectsByEmpid']);
    mockLookup.getSubjectsByEmpid.and.returnValue(of([]));

    mockService = jasmine.createSpyObj<AppraisalParametersMasterService>(
      'AppraisalParametersMasterService',
      ['getParameters', 'saveParameter', 'deleteParameter', 'getParameterById', 'importParameters']
    );
    mockService.getParameters.and.returnValue(of([]));

    mockDialog = jasmine.createSpyObj<Dialog>('Dialog', ['open']);
    mockDialog.open.and.returnValue({ closed: of(null) } as any);

    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    component = new AppraisalParametersMasterComponent(
      mockAuthService, mockLookup, mockService, mockDialog, mockToast, new FormBuilder()
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

  describe('searchedData', () => {
    beforeEach(() => { component.parameters = makeParams(3); });

    it('returns all when search is empty', () => {
      expect(component.searchedData.length).toBe(3);
    });

    it('filters by Code case-insensitively', () => {
      component.search.Code = 'code0';
      expect(component.searchedData.length).toBe(1);
    });

    it('filters by Descr case-insensitively', () => {
      component.search.Descr = 'description 1';
      expect(component.searchedData.length).toBe(1);
    });
  });

  describe('pagedParameters and totalPages', () => {
    it('returns page slice', () => {
      component.parameters = makeParams(15);
      component.currentPage = 1;
      expect(component.pagedParameters.length).toBe(10);
    });

    it('calculates totalPages', () => {
      component.parameters = makeParams(11);
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

  describe('openAddDialog()', () => {
    it('calls dialog.open with null data', () => {
      component.openAddDialog();
      expect(mockDialog.open).toHaveBeenCalledWith(
        jasmine.anything(),
        jasmine.objectContaining({ data: null })
      );
    });

    it('reloads on dialog save', () => {
      mockDialog.open.and.returnValue({ closed: of(true) } as any);
      spyOn(component, 'loadParameters');
      component.openAddDialog();
      expect(component.loadParameters).toHaveBeenCalled();
    });
  });

  describe('openEditDialog()', () => {
    it('calls dialog.open with parameter data', () => {
      const param = makeParams(1)[0];
      component.openEditDialog(param);
      expect(mockDialog.open).toHaveBeenCalledWith(
        jasmine.anything(),
        jasmine.objectContaining({ data: param })
      );
    });
  });

  describe('formatBoolean()', () => {
    it('returns Yes for Y', () => { expect(component.formatBoolean('Y')).toBe('Yes'); });
    it('returns Yes for true', () => { expect(component.formatBoolean(true)).toBe('Yes'); });
    it('returns No for N', () => { expect(component.formatBoolean('N')).toBe('No'); });
  });

  describe('formatActive()', () => {
    it('returns Active for Y', () => { expect(component.formatActive('Y')).toBe('Active'); });
    it('returns Inactive for N', () => { expect(component.formatActive('N')).toBe('Inactive'); });
  });
});

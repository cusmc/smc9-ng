import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { SubgroupMasterComponent } from './subgroup-master.component';
import { SubgroupMasterService } from './subgroup-master.service';
import { LookupService } from '../../shared/lookup.service';
import { AuthService } from '../../../auth/auth.service';
import { Dialog } from '@angular/cdk/dialog';
import { ToastService } from '../../../core/toast/toast.service';
import { Subgroup } from './subgroup-master.models';

describe('SubgroupMasterComponent', () => {
  let component: SubgroupMasterComponent;
  let mockService: jasmine.SpyObj<SubgroupMasterService>;
  let mockLookup: jasmine.SpyObj<LookupService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRoute: { params: any };
  let mockDialog: jasmine.SpyObj<Dialog>;
  let mockToast: jasmine.SpyObj<ToastService>;

  const makeSubgroups = (count: number): Subgroup[] =>
    Array.from({ length: count }, (_, i) => ({
      Subgroup_id: i,
      Subgroup_nm: `Group ${i}`,
      Subgroup_type: 'Section',
      Create_by: `user${i}`,
      Create_dt: '2026-01-01'
    } as Subgroup));

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['getUsername']);
    mockAuthService.getUsername.and.returnValue('jdoe');

    mockLookup = jasmine.createSpyObj<LookupService>('LookupService', ['getSubjectsByEmpid']);
    mockLookup.getSubjectsByEmpid.and.returnValue(of([]));

    mockService = jasmine.createSpyObj<SubgroupMasterService>('SubgroupMasterService', [
      'getSubgroups', 'getSubgroupById', 'saveSubgroup', 'deleteSubgroup'
    ]);
    mockService.getSubgroups.and.returnValue(of([]));
    mockService.deleteSubgroup.and.returnValue(of(null));

    mockRoute = { params: of({ type: 'Section' }) };

    mockDialog = jasmine.createSpyObj<Dialog>('Dialog', ['open']);
    mockDialog.open.and.returnValue({ closed: of(null) } as any);

    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    component = new SubgroupMasterComponent(
      mockService, mockLookup, mockAuthService,
      mockRoute as unknown as ActivatedRoute,
      mockDialog, mockToast
    );
  });

  describe('ngOnInit()', () => {
    it('reads subgroupType from route params', () => {
      component.ngOnInit();
      expect(component.subgroupType).toBe('Section');
    });

    it('loads subjects', () => {
      component.ngOnInit();
      expect(mockLookup.getSubjectsByEmpid).toHaveBeenCalledWith('jdoe');
    });
  });

  describe('getTypeLabel()', () => {
    it('capitalizes the first letter of subgroupType', () => {
      component.subgroupType = 'speciality';
      expect(component.getTypeLabel()).toBe('Speciality');
    });
  });

  describe('searchedData', () => {
    beforeEach(() => { component.subgroups = makeSubgroups(3); });

    it('returns all when search is empty', () => {
      expect(component.searchedData.length).toBe(3);
    });

    it('filters by Subgroup_nm case-insensitively', () => {
      component.search.Subgroup_nm = 'group 1';
      expect(component.searchedData.length).toBe(1);
    });
  });

  describe('pagedSubgroups and totalPages', () => {
    it('returns 10 per page', () => {
      component.subgroups = makeSubgroups(15);
      component.currentPage = 1;
      expect(component.pagedSubgroups.length).toBe(10);
    });

    it('calculates totalPages', () => {
      component.subgroups = makeSubgroups(21);
      expect(component.totalPages).toBe(3);
    });
  });

  describe('onSubjectChange()', () => {
    it('updates selectedSubjectId and reloads', () => {
      spyOn(component, 'loadSubgroups');
      component.onSubjectChange(9);
      expect(component.selectedSubjectId).toBe(9);
      expect(component.loadSubgroups).toHaveBeenCalled();
    });
  });

  describe('deleteSubgroup()', () => {
    it('confirms and calls service.deleteSubgroup', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(component, 'loadSubgroups');
      component.deleteSubgroup(4);
      expect(mockService.deleteSubgroup).toHaveBeenCalledWith(4);
    });

    it('does not delete when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.deleteSubgroup(4);
      expect(mockService.deleteSubgroup).not.toHaveBeenCalled();
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { SubgroupMasterDialogComponent } from './subgroup-master-dialog.component';
import { SubgroupMasterService } from './subgroup-master.service';
import { ToastService } from '../../../core/toast/toast.service';
import { Subgroup } from './subgroup-master.models';

describe('SubgroupMasterDialogComponent', () => {
  let mockService: jasmine.SpyObj<SubgroupMasterService>;
  let mockDialogRef: jasmine.SpyObj<DialogRef<boolean, SubgroupMasterDialogComponent>>;
  let mockToast: jasmine.SpyObj<ToastService>;

  function setup(subgroup: Subgroup | null) {
    mockService = jasmine.createSpyObj<SubgroupMasterService>('SubgroupMasterService', [
      'getSubgroups', 'getSubgroupById', 'saveSubgroup', 'deleteSubgroup'
    ]);
    mockService.saveSubgroup.and.returnValue(of(null));
    mockService.deleteSubgroup.and.returnValue(of(null));

    mockDialogRef = jasmine.createSpyObj<DialogRef<boolean, SubgroupMasterDialogComponent>>('DialogRef', ['close']);
    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    TestBed.configureTestingModule({
      imports: [SubgroupMasterDialogComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: { subgroupType: 'Section', subgroup } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: SubgroupMasterService, useValue: mockService },
        { provide: ToastService, useValue: mockToast }
      ]
    });

    const fixture = TestBed.createComponent(SubgroupMasterDialogComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('when subgroup is null (add mode)', () => {
    let component: SubgroupMasterDialogComponent;
    beforeEach(() => { component = setup(null); });

    it('initializes Subgroup_nm to empty string', () => {
      expect(component.form.get('Subgroup_nm')?.value).toBe('');
    });

    it('initializes Subgroup_type from dialog data', () => {
      expect(component.form.get('Subgroup_type')?.value).toBe('Section');
    });

    it('Subgroup_nm is required — form invalid when empty', () => {
      expect(component.form.invalid).toBeTrue();
    });
  });

  describe('when subgroup is provided (edit mode)', () => {
    let component: SubgroupMasterDialogComponent;
    const sg: Subgroup = {
      Subgroup_id: 3, Subgroup_nm: 'Group A', Subgroup_type: 'Section', Subject_id: 1
    } as Subgroup;
    beforeEach(() => { component = setup(sg); });

    it('pre-fills Subgroup_nm', () => {
      expect(component.form.get('Subgroup_nm')?.value).toBe('Group A');
    });

    it('pre-fills Subgroup_id', () => {
      expect(component.form.get('Subgroup_id')?.value).toBe(3);
    });
  });

  describe('onSave()', () => {
    it('does nothing when form is invalid', () => {
      const component = setup(null);
      component.onSave();
      expect(mockService.saveSubgroup).not.toHaveBeenCalled();
    });

    it('calls saveSubgroup and closes with true on success', () => {
      const component = setup(null);
      component.form.patchValue({ Subgroup_nm: 'New Group' });
      component.onSave();
      expect(mockService.saveSubgroup).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('shows toast on error and does not close', () => {
      const component = setup(null);
      mockService.saveSubgroup.and.returnValue(throwError(() => new Error()));
      component.form.patchValue({ Subgroup_nm: 'New Group' });
      component.onSave();
      expect(mockToast.show).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.objectContaining({ variant: 'error' })
      );
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('onDelete()', () => {
    let component: SubgroupMasterDialogComponent;
    const sg: Subgroup = {
      Subgroup_id: 5, Subgroup_nm: 'Del Group', Subgroup_type: 'Section', Subject_id: 1
    } as Subgroup;
    beforeEach(() => { component = setup(sg); });

    it('calls deleteSubgroup and closes with true when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.onDelete();
      expect(mockService.deleteSubgroup).toHaveBeenCalledWith(5);
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('does not delete when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.onDelete();
      expect(mockService.deleteSubgroup).not.toHaveBeenCalled();
    });
  });

  describe('onCancel()', () => {
    it('calls dialogRef.close()', () => {
      const component = setup(null);
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});

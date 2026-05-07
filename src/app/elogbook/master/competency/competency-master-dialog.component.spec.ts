import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { CompetencyMasterDialogComponent } from './competency-master-dialog.component';
import { CompetencyMasterService } from './competency-master.service';
import { ToastService } from '../../../core/toast/toast.service';
import { Competency } from './competency-master.models';

describe('CompetencyMasterDialogComponent', () => {
  let mockService: jasmine.SpyObj<CompetencyMasterService>;
  let mockDialogRef: jasmine.SpyObj<DialogRef<boolean, CompetencyMasterDialogComponent>>;
  let mockToast: jasmine.SpyObj<ToastService>;

  function setup(data: Competency | null) {
    mockService = jasmine.createSpyObj<CompetencyMasterService>('CompetencyMasterService', [
      'getCompetencies', 'getCompetencyById', 'saveCompetency', 'deleteCompetency', 'importCompetencies', 'addSection'
    ]);
    mockService.saveCompetency.and.returnValue(of(null));
    mockService.deleteCompetency.and.returnValue(of(null));
    mockService.getCompetencyById.and.returnValue(of(data as Competency));

    mockDialogRef = jasmine.createSpyObj<DialogRef<boolean, CompetencyMasterDialogComponent>>('DialogRef', ['close']);
    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    TestBed.configureTestingModule({
      imports: [CompetencyMasterDialogComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: data },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: CompetencyMasterService, useValue: mockService },
        { provide: ToastService, useValue: mockToast }
      ]
    });

    const fixture = TestBed.createComponent(CompetencyMasterDialogComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('when data is null (add mode)', () => {
    let component: CompetencyMasterDialogComponent;
    beforeEach(() => { component = setup(null); });

    it('initializes Competencyid to 0', () => {
      expect(component.form.get('Competencyid')?.value).toBe(0);
    });

    it('does not call getCompetencyById', () => {
      expect(mockService.getCompetencyById).not.toHaveBeenCalled();
    });
  });

  describe('when data is provided (edit mode)', () => {
    let component: CompetencyMasterDialogComponent;
    const comp: Competency = {
      Competencyid: 3, Description: 'Test comp', Subdesc: 'Sub',
      Section_id: 1, Course_id: 2, Subject_id: 5, Mode_id: 3, Yr: '2025'
    };
    beforeEach(() => { component = setup(comp); });

    it('pre-fills Description', () => {
      expect(component.form.get('Description')?.value).toBe('Test comp');
    });

    it('calls getCompetencyById on ngOnInit', () => {
      expect(mockService.getCompetencyById).toHaveBeenCalledWith(3);
    });
  });

  describe('onSave()', () => {
    let component: CompetencyMasterDialogComponent;
    beforeEach(() => { component = setup(null); });

    it('calls saveCompetency and closes with true', () => {
      component.onSave();
      expect(mockService.saveCompetency).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('shows toast on error and does not close', () => {
      mockService.saveCompetency.and.returnValue(throwError(() => new Error()));
      component.onSave();
      expect(mockToast.show).toHaveBeenCalled();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('onDelete()', () => {
    let component: CompetencyMasterDialogComponent;
    const comp = { Competencyid: 7, Description: 'Del' } as Competency;
    beforeEach(() => { component = setup(comp); });

    it('calls deleteCompetency and closes with true when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.onDelete();
      expect(mockService.deleteCompetency).toHaveBeenCalledWith(7);
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('does not delete when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.onDelete();
      expect(mockService.deleteCompetency).not.toHaveBeenCalled();
    });
  });

  describe('onCancel()', () => {
    it('closes dialog', () => {
      const component = setup(null);
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { of, throwError, Observable } from 'rxjs';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { StudentLedgerDialogComponent } from './student-ledger-dialog.component';
import { StudentViewService } from './student-view.service';
import { ToastService } from '../../core/toast/toast.service';
import { StudentListItem, StudentLedgerRecord } from './student-view.models';

describe('StudentLedgerDialogComponent', () => {
  let mockService: jasmine.SpyObj<StudentViewService>;
  let mockDialogRef: jasmine.SpyObj<DialogRef<void, StudentLedgerDialogComponent>>;
  let mockToast: jasmine.SpyObj<ToastService>;

  const testStudent: StudentListItem = {
    no: 101, name: 'Alice', Inst_id: 1, stat: 'E',
    admyear: 2020, batch_id: null, cursem: '', semrollno: '',
  };

  const makeLedger = (overrides: Partial<StudentLedgerRecord>[] = []): StudentLedgerRecord[] =>
    overrides.map(r => ({
      Date: '2025-01-01', sem: '1', amt: 0, crdb: 1, receiptno: 0, narr: '', ...r,
    }));

  function setup(response$: Observable<StudentLedgerRecord[]>): StudentLedgerDialogComponent {
    mockService = jasmine.createSpyObj<StudentViewService>('StudentViewService', [
      'getAll', 'getById', 'getLedger', 'getResult',
    ]);
    mockService.getLedger.and.returnValue(response$);
    mockDialogRef = jasmine.createSpyObj<DialogRef<void, StudentLedgerDialogComponent>>('DialogRef', ['close']);
    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    TestBed.configureTestingModule({
      imports: [StudentLedgerDialogComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: testStudent },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: StudentViewService, useValue: mockService },
        { provide: ToastService, useValue: mockToast },
      ],
    });

    const fixture = TestBed.createComponent(StudentLedgerDialogComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('ngOnInit()', () => {
    it('calls getLedger with student no and Inst_id', () => {
      setup(of([]));
      expect(mockService.getLedger).toHaveBeenCalledWith(101, 1);
    });

    it('populates records on success', () => {
      const data = makeLedger([{ amt: 500, crdb: 1 }]);
      const component = setup(of(data));
      expect(component.records).toEqual(data);
    });

    it('sets loading to false on success', () => {
      const component = setup(of([]));
      expect(component.loading).toBeFalse();
    });

    it('shows error toast on failure', () => {
      setup(throwError(() => new Error('fail')));
      expect(mockToast.show).toHaveBeenCalledWith(
        jasmine.stringContaining('Error'),
        jasmine.objectContaining({ variant: 'error' }),
      );
    });

    it('sets loading to false on failure', () => {
      const component = setup(throwError(() => new Error('fail')));
      expect(component.loading).toBeFalse();
    });
  });

  describe('balance getter', () => {
    it('returns 0 for empty records', () => {
      const component = setup(of([]));
      expect(component.balance).toBe(0);
    });

    it('sums credits and subtracts debits', () => {
      const data = makeLedger([
        { amt: 1000, crdb: 1 },
        { amt: 200,  crdb: 0 },
        { amt: 300,  crdb: 1 },
      ]);
      const component = setup(of(data));
      expect(component.balance).toBe(1100);
    });

    it('returns negative balance when debits exceed credits', () => {
      const data = makeLedger([
        { amt: 500, crdb: 0 },
        { amt: 300, crdb: 0 },
      ]);
      const component = setup(of(data));
      expect(component.balance).toBe(-800);
    });
  });

  describe('onClose()', () => {
    it('closes the dialog', () => {
      const component = setup(of([]));
      component.onClose();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});

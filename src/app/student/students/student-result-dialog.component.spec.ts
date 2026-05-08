import { TestBed } from '@angular/core/testing';
import { of, throwError, Observable } from 'rxjs';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { StudentResultDialogComponent } from './student-result-dialog.component';
import { StudentViewService } from './student-view.service';
import { ToastService } from '../../core/toast/toast.service';
import { StudentListItem, StudentResultRecord } from './student-view.models';

describe('StudentResultDialogComponent', () => {
  let mockService: jasmine.SpyObj<StudentViewService>;
  let mockDialogRef: jasmine.SpyObj<DialogRef<void, StudentResultDialogComponent>>;
  let mockToast: jasmine.SpyObj<ToastService>;

  const testStudent: StudentListItem = {
    no: 101, name: 'Alice', Inst_id: 1, stat: 'E',
    admyear: 2020, batch_id: null, cursem: '', semrollno: '',
  };

  const makeResults = (count: number): StudentResultRecord[] =>
    Array.from({ length: count }, (_, i) => ({
      Result_id: i + 1, Result_dt: '2025-06-01', Subject_id: i + 10,
      Mbbs: null, Pext1: null, Pext2: null, Pres: null, Ptot: null,
      Text1: null, Text2: null, Tint: null, Tres: null, Ttot: null,
    }));

  function setup(response$: Observable<StudentResultRecord[]>): StudentResultDialogComponent {
    mockService = jasmine.createSpyObj<StudentViewService>('StudentViewService', [
      'getAll', 'getById', 'getLedger', 'getResult',
    ]);
    mockService.getResult.and.returnValue(response$);
    mockDialogRef = jasmine.createSpyObj<DialogRef<void, StudentResultDialogComponent>>('DialogRef', ['close']);
    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    TestBed.configureTestingModule({
      imports: [StudentResultDialogComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: testStudent },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: StudentViewService, useValue: mockService },
        { provide: ToastService, useValue: mockToast },
      ],
    });

    const fixture = TestBed.createComponent(StudentResultDialogComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('ngOnInit()', () => {
    it('calls getResult with student no and Inst_id', () => {
      setup(of([]));
      expect(mockService.getResult).toHaveBeenCalledWith(101, 1);
    });

    it('populates records on success', () => {
      const data = makeResults(3);
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

  describe('onClose()', () => {
    it('closes the dialog', () => {
      const component = setup(of([]));
      component.onClose();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});

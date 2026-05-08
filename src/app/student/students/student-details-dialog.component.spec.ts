import { TestBed } from '@angular/core/testing';
import { of, throwError, Observable } from 'rxjs';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { StudentDetailsDialogComponent } from './student-details-dialog.component';
import { StudentViewService } from './student-view.service';
import { ToastService } from '../../core/toast/toast.service';
import { StudentListItem, StudentWithPhoto, StudentDetail } from './student-view.models';

describe('StudentDetailsDialogComponent', () => {
  let mockService: jasmine.SpyObj<StudentViewService>;
  let mockDialogRef: jasmine.SpyObj<DialogRef<void, StudentDetailsDialogComponent>>;
  let mockToast: jasmine.SpyObj<ToastService>;

  const testStudent: StudentListItem = {
    no: 101, name: 'Alice', Inst_id: 1, stat: 'E',
    admyear: 2020, batch_id: null, cursem: '', semrollno: '',
  };

  const makeDetail = (overrides: Partial<StudentDetail> = {}): StudentDetail => ({
    Pk_id: 1, No: 101, Name: 'Alice', Address: '123 Main St', City: 'Jamnagar',
    Phone: '9999999999', Studmob1: null, Parmob1: null, Email: 'alice@test.com',
    Fname: 'Bob', Mname: 'Carol', Bnames: '', Snames: '', Empl_id: null,
    Sex: 'F', Birthdt: '2000-01-01', Birthpl: 'Jamnagar', Nation: 'Indian',
    Religion: 'Hindu', Cast: 'General', Mstatus: 'Single', Bgroup: 'O+',
    Catagory: 'Open', Idmarks: '', Allergic: '', Merit_no: null, Merit_mark: null,
    Gcet_marks: '', Hostel: 'N', Admdt: '2018-08-01', Admyear: 2018, Board: 'CBSE',
    Course_id: 1, Tdept_id: null, Quota: 'Open', Uni_no: 'U001', Fees: null,
    Remarks: '', Free_no: '', Free_dt: null, Cursem: '1', batch_id: null,
    Semrollno: '', JoinDate: null, Bank_id: null, Bankacno: '', Bankacnm: '',
    Stat: 'E', Inst_id: 1, ...overrides,
  });

  function setup(response$: Observable<StudentWithPhoto>): StudentDetailsDialogComponent {
    mockService = jasmine.createSpyObj<StudentViewService>('StudentViewService', [
      'getAll', 'getById', 'getLedger', 'getResult',
    ]);
    mockService.getById.and.returnValue(response$);
    mockDialogRef = jasmine.createSpyObj<DialogRef<void, StudentDetailsDialogComponent>>('DialogRef', ['close']);
    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    TestBed.configureTestingModule({
      imports: [StudentDetailsDialogComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: testStudent },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: StudentViewService, useValue: mockService },
        { provide: ToastService, useValue: mockToast },
      ],
    });

    const fixture = TestBed.createComponent(StudentDetailsDialogComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('ngOnInit()', () => {
    it('calls getById with student no', () => {
      setup(of({ student: makeDetail(), base64String1: '' }));
      expect(mockService.getById).toHaveBeenCalledWith(101);
    });

    it('sets student from response', () => {
      const detail = makeDetail({ Name: 'Alice Smith' });
      const component = setup(of({ student: detail, base64String1: '' }));
      expect(component.student).toEqual(detail);
    });

    it('sets loading to false on success', () => {
      const component = setup(of({ student: makeDetail(), base64String1: '' }));
      expect(component.loading).toBeFalse();
    });

    it('constructs photoUrl from base64 when present', () => {
      const component = setup(of({ student: makeDetail(), base64String1: 'abc123' }));
      expect(component.photoUrl).toBe('data:image/jpeg;base64,abc123');
    });

    it('sets photoUrl to empty string when base64 is empty', () => {
      const component = setup(of({ student: makeDetail(), base64String1: '' }));
      expect(component.photoUrl).toBe('');
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

  describe('activeTab', () => {
    it('starts at 1 after initialization', () => {
      const component = setup(of({ student: makeDetail(), base64String1: '' }));
      expect(component.activeTab).toBe(1);
    });
  });

  describe('onClose()', () => {
    it('closes the dialog', () => {
      const component = setup(of({ student: makeDetail(), base64String1: '' }));
      component.onClose();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});

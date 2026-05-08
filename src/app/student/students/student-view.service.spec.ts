import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { StudentViewService } from './student-view.service';
import { ApiService } from '../../shared/api.service';

describe('StudentViewService', () => {
  let service: StudentViewService;
  let mockApiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'post']);
    mockApiService.get.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        StudentViewService,
        { provide: ApiService, useValue: mockApiService },
      ],
    });
    service = TestBed.inject(StudentViewService);
  });

  describe('getAll()', () => {
    it('calls the StudList endpoint', () => {
      service.getAll().subscribe();
      expect(mockApiService.get).toHaveBeenCalledOnceWith('/api/ECampusAPI/StudList');
    });
  });

  describe('getById()', () => {
    it('calls GetStudent with the student no', () => {
      service.getById(42).subscribe();
      expect(mockApiService.get).toHaveBeenCalledOnceWith(
        '/api/Campus/StudentsAPI/GetStudent?id=42',
      );
    });
  });

  describe('getLedger()', () => {
    it('formats Inst_id as 000+instId wrapped in single quotes', () => {
      service.getLedger(123, 1).subscribe();
      expect(mockApiService.get).toHaveBeenCalledOnceWith(
        "/api/Campus/StudentsAPI/GetStudLedger?StudId=123&Inst_id='0001'",
      );
    });

    it('handles a two-digit institution id', () => {
      service.getLedger(55, 9).subscribe();
      expect(mockApiService.get).toHaveBeenCalledOnceWith(
        "/api/Campus/StudentsAPI/GetStudLedger?StudId=55&Inst_id='0009'",
      );
    });
  });

  describe('getResult()', () => {
    it('formats Inst_id as 000+instId without single quotes', () => {
      service.getResult(42, 1).subscribe();
      expect(mockApiService.get).toHaveBeenCalledOnceWith(
        '/api/Campus/StudentsAPI/GetStudResult?id=42&Inst_id=0001',
      );
    });
  });
});

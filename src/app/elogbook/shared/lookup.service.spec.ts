import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { LookupService } from './lookup.service';
import { ApiService } from '../../shared/api.service';

describe('LookupService', () => {
  let service: LookupService;
  let mockApiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'post']);
    mockApiService.get.and.returnValue(of([]));
    mockApiService.post.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [LookupService, { provide: ApiService, useValue: mockApiService }]
    });
    service = TestBed.inject(LookupService);
  });

  describe('getSubjectsByEmpid()', () => {
    it('calls the subject list endpoint with Inst_id and Empid', () => {
      service.getSubjectsByEmpid('E001').subscribe();

      expect(mockApiService.get).toHaveBeenCalledOnceWith(
        '/api/Campus/SubMstAPI/SubjListbyEmpid',
        { Inst_id: 1, Empid: 'E001' }
      );
    });
  });

  describe('getStudentsByCourse()', () => {
    it('POSTs to the student-by-course endpoint with Subject_id', () => {
      service.getStudentsByCourse(99).subscribe();

      expect(mockApiService.post).toHaveBeenCalledOnceWith(
        '/api/Campus/StudentsAPI/StudListbyCourse',
        { Subject_id: 99 }
      );
    });
  });

  describe('getAllStudents()', () => {
    it('calls the student list endpoint with Inst_id=-1', () => {
      service.getAllStudents().subscribe();

      expect(mockApiService.get).toHaveBeenCalledOnceWith(
        '/api/Campus/StudentsAPI/GetList1',
        { Inst_id: -1 }
      );
    });
  });

  describe('getCodeList()', () => {
    it('calls the code list endpoint with the provided code name', () => {
      service.getCodeList('RATING_C').subscribe();

      expect(mockApiService.get).toHaveBeenCalledOnceWith(
        '/api/Common/CodemastsAPI/GetCodeListbyCodenm',
        { codenm: 'RATING_C' }
      );
    });
  });

  describe('getCodeListById()', () => {
    it('calls the code-list-by-id endpoint with the provided code name', () => {
      service.getCodeListById('STATUS').subscribe();

      expect(mockApiService.get).toHaveBeenCalledOnceWith(
        '/api/Common/CodemastsAPI/GetCodeListIdbyCodenm',
        { codenm: 'STATUS' }
      );
    });
  });

  describe('getFacultyBySubject()', () => {
    it('calls the faculty list endpoint with Subject_id', () => {
      service.getFacultyBySubject(5).subscribe();

      expect(mockApiService.get).toHaveBeenCalledOnceWith(
        '/api/ECampusAPI/FacListbySubj_Id1',
        { Subject_id: 5 }
      );
    });
  });

  describe('getCourses()', () => {
    it('calls the courses endpoint with no params', () => {
      service.getCourses().subscribe();

      expect(mockApiService.get).toHaveBeenCalledOnceWith('/api/Store/CoursesAPI/GetDatas');
    });
  });

  describe('getSectionsBySubject()', () => {
    it('calls the sections endpoint with SubgroupType and Subject_id', () => {
      service.getSectionsBySubject(7).subscribe();

      expect(mockApiService.get).toHaveBeenCalledOnceWith(
        '/api/Campus/subgroupsAPI/GetList',
        { SubgroupType: 'Section', Subject_id: 7 }
      );
    });
  });
});

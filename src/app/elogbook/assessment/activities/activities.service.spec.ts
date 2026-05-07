import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ActivitiesService } from './activities.service';
import { ApiService } from '../../../shared/api.service';
import { Activity } from './activities.models';

describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let mockApiService: jasmine.SpyObj<ApiService>;

  const mockActivity: Activity = {
    Pk_id: 1,
    Studno: 'S001',
    Activityid: 10,
    Status: 'P',
    Grade: 'M',
    Comments: 'Good',
    Remarks: '',
    Edate: '2026-01-01',
    Empid: 'E001'
  };

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'post']);
    mockApiService.get.and.returnValue(of([]));
    mockApiService.post.and.returnValue(of(null));

    TestBed.configureTestingModule({
      providers: [ActivitiesService, { provide: ApiService, useValue: mockApiService }]
    });
    service = TestBed.inject(ActivitiesService);
  });

  describe('getActivities()', () => {
    it('calls the correct endpoint with empid and Activitytype_id=null', () => {
      service.getActivities('E001').subscribe();

      expect(mockApiService.get).toHaveBeenCalledWith(
        '/api/Campus/activitiessAPI/ActivityListbyEmpid',
        jasmine.objectContaining({ Empid: 'E001', Activitytype_id: 'null' })
      );
    });

    it('includes Studno in params when provided', () => {
      service.getActivities('E001', 'S001').subscribe();

      const [, params] = mockApiService.get.calls.mostRecent().args;
      expect(params['Studno']).toBe('S001');
    });

    it('includes Subject_id in params when provided', () => {
      service.getActivities('E001', undefined, 42).subscribe();

      const [, params] = mockApiService.get.calls.mostRecent().args;
      expect(params['Subject_id']).toBe(42);
    });

    it('omits Studno and Subject_id when not provided', () => {
      service.getActivities('E001').subscribe();

      const [, params] = mockApiService.get.calls.mostRecent().args;
      expect(params['Studno']).toBeUndefined();
      expect(params['Subject_id']).toBeUndefined();
    });
  });

  describe('saveActivity()', () => {
    it('POSTs the activity to the save endpoint', () => {
      service.saveActivity(mockActivity).subscribe();

      expect(mockApiService.post).toHaveBeenCalledOnceWith(
        '/api/Campus/activitiessAPI/SaveData',
        mockActivity
      );
    });
  });

  describe('revertActivity()', () => {
    it('POSTs the activity to the revert endpoint', () => {
      service.revertActivity(mockActivity).subscribe();

      expect(mockApiService.post).toHaveBeenCalledOnceWith(
        '/api/Campus/activitiessAPI/RevertStatus',
        mockActivity
      );
    });
  });

  describe('getStudentDetail()', () => {
    it('GETs student data with the provided id', () => {
      service.getStudentDetail('S001').subscribe();

      expect(mockApiService.get).toHaveBeenCalledOnceWith(
        '/api/Campus/StudentsAPI/GetStudent',
        { id: 'S001' }
      );
    });
  });
});

import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';

import { ActivitiesComponent } from './activities.component';
import { AuthService } from '../../../auth/auth.service';
import { ActivitiesService } from './activities.service';
import { LookupService } from '../../shared/lookup.service';
import { ToastService } from '../../../core/toast/toast.service';
import { ActivityDashboard, CodeListItem } from './activities.models';

describe('ActivitiesComponent', () => {
  let component: ActivitiesComponent;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockActivitiesService: jasmine.SpyObj<ActivitiesService>;
  let mockLookupService: jasmine.SpyObj<LookupService>;
  let mockToast: jasmine.SpyObj<ToastService>;

  const mockGrades: CodeListItem[] = [
    { Cd: 'E', vals: 'Exceeds' },
    { Cd: 'M', vals: 'Meets' },
    { Cd: 'B', vals: 'Below' }
  ];

  const makeActivities = (statuses: string[]): ActivityDashboard[] =>
    statuses.map((Status, i) => ({
      Pk_id: i,
      Studno: `S00${i}`,
      Activityid: i,
      Status,
      Grade: 'M',
      Comments: '',
      Remarks: '',
      Edate: '2026-01-01',
      Empid: 'E001'
    }));

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['getUsername']);
    mockAuthService.getUsername.and.returnValue('E001');

    mockActivitiesService = jasmine.createSpyObj<ActivitiesService>('ActivitiesService', [
      'getActivities', 'saveActivity', 'revertActivity', 'getStudentDetail'
    ]);
    mockActivitiesService.getActivities.and.returnValue(of([]));

    mockLookupService = jasmine.createSpyObj<LookupService>('LookupService', [
      'getCodeList', 'getSubjectsByEmpid', 'getStudentsByCourse'
    ]);
    mockLookupService.getCodeList.and.returnValue(of(mockGrades));
    mockLookupService.getSubjectsByEmpid.and.returnValue(of([]));
    mockLookupService.getStudentsByCourse.and.returnValue(of([]));

    mockToast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    component = new ActivitiesComponent(
      mockAuthService, mockActivitiesService, mockLookupService, new FormBuilder(), mockToast
    );
  });

  describe('ngOnInit()', () => {
    it('sets empid from authService.getUsername()', () => {
      component.ngOnInit();
      expect(component.empid).toBe('E001');
    });

    it('loads grades via getCodeList("RATING_C")', () => {
      component.ngOnInit();
      expect(mockLookupService.getCodeList).toHaveBeenCalledWith('RATING_C');
      expect(component.grades).toEqual(mockGrades);
    });

    it('loads subjects via getSubjectsByEmpid()', () => {
      component.ngOnInit();
      expect(mockLookupService.getSubjectsByEmpid).toHaveBeenCalledWith('E001');
    });
  });

  describe('setStatus()', () => {
    it('updates selectedStatus', () => {
      component.setStatus('P');
      expect(component.selectedStatus).toBe('P');
    });

    it('resets currentPage to 1', () => {
      component.currentPage = 3;
      component.setStatus('C');
      expect(component.currentPage).toBe(1);
    });

    it('filters filteredData to Pending when status is P', () => {
      component.allData = makeActivities(['P', 'C', 'P', 'C']);
      component.setStatus('P');
      expect(component.filteredData.every(r => r.Status === 'P')).toBeTrue();
      expect(component.filteredData.length).toBe(2);
    });

    it('shows all records when status is A', () => {
      component.allData = makeActivities(['P', 'C', 'P']);
      component.setStatus('A');
      expect(component.filteredData.length).toBe(3);
    });
  });

  describe('pagedData', () => {
    it('returns up to 10 items from filteredData', () => {
      component.filteredData = makeActivities(Array(15).fill('P'));
      component.currentPage = 1;
      expect(component.pagedData.length).toBe(10);
    });

    it('returns the second page items', () => {
      component.filteredData = makeActivities(Array(15).fill('P'));
      component.currentPage = 2;
      expect(component.pagedData.length).toBe(5);
    });
  });

  describe('totalPages', () => {
    it('calculates total pages correctly', () => {
      component.filteredData = makeActivities(Array(25).fill('P'));
      expect(component.totalPages).toBe(3);
    });

    it('returns 0 when no data', () => {
      component.filteredData = [];
      expect(component.totalPages).toBe(0);
    });
  });

  describe('getGradeLabel()', () => {
    beforeEach(() => component.ngOnInit());

    it('returns the label for a known code', () => {
      expect(component.getGradeLabel('E')).toBe('Exceeds');
    });

    it('returns the code itself for an unknown code', () => {
      expect(component.getGradeLabel('X')).toBe('X');
    });
  });
});

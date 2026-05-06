import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { ActivitiesService } from './activities.service';
import { LookupService } from '../../shared/lookup.service';
import { ActivityDashboard, Subject, Student, CodeListItem } from './activities.models';
import { ToastService } from '../../../core/toast/toast.service';

type StatusFilter = 'A' | 'P' | 'C';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})
export class ActivitiesComponent implements OnInit {
  allData: ActivityDashboard[] = [];
  filteredData: ActivityDashboard[] = [];

  subjects: Subject[] = [];
  students: Student[] = [];
  grades: CodeListItem[] = [];

  filterForm: FormGroup;

  selectedStatus: StatusFilter = 'A';
  loading = false;
  saving = false;
  empid = '';

  countAll = 0;
  countP = 0;
  countC = 0;

  currentPage = 1;
  readonly itemsPerPage = 10;

  constructor(
    private authService: AuthService,
    private activitiesService: ActivitiesService,
    private lookupService: LookupService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.filterForm = this.fb.group({
      Subject_id: [null],
      Studno: [null]
    });
  }

  ngOnInit(): void {
    this.empid = this.authService.getUsername() || '';

    this.lookupService.getCodeList('RATING_C').subscribe({
      next: (data) => {
        this.grades = data;
      },
      error: () => this.toast.show('Failed to load grades', { variant: 'error', duration: 5000 })
    });

    this.lookupService.getSubjectsByEmpid(this.empid).subscribe({
      next: (data) => {
        this.subjects = data;
        if (data.length > 0) {
          this.filterForm.patchValue({ Subject_id: data[0].Subject_id });
          this.loadStudents(data[0].Subject_id);
        }
      },
      error: () => this.toast.show('Failed to load subjects', { variant: 'error', duration: 5000 })
    });
  }

  onSubjectChange(): void {
    const subjectId = this.filterForm.get('Subject_id')?.value;
    this.filterForm.patchValue({ Studno: null });
    if (subjectId) {
      this.loadStudents(subjectId);
    } else {
      this.students = [];
    }
  }

  private loadStudents(subjectId: number): void {
    this.lookupService.getStudentsByCourse(subjectId).subscribe({
      next: (data) => {
        this.students = data;
      },
      error: () => this.toast.show('Failed to load students', { variant: 'error', duration: 5000 })
    });
  }

  loadActivities(): void {
    const { Subject_id, Studno } = this.filterForm.value;
    this.loading = true;

    this.activitiesService.getActivities(this.empid, Studno, Subject_id).subscribe({
      next: (data) => {
        this.allData = data.map((d) => ({
          ...d,
          Canverify: d.Status === 'P'
        }));
        this.computeCounts();
        this.applyFilter();
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Failed to load activities', { variant: 'error', duration: 5000 });
        this.loading = false;
      }
    });
  }

  private computeCounts(): void {
    this.countAll = this.allData.length;
    this.countP = this.allData.filter((d) => d.Status === 'P').length;
    this.countC = this.allData.filter((d) => d.Status === 'C').length;
  }

  setStatus(status: StatusFilter): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.selectedStatus === 'A') {
      this.filteredData = this.allData;
    } else {
      this.filteredData = this.allData.filter((d) => d.Status === this.selectedStatus);
    }
  }

  get pagedData(): ActivityDashboard[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  saveRow(row: ActivityDashboard): void {
    if (!row.Grade) return;

    if (!confirm('Save this activity?')) return;

    this.saving = true;
    this.activitiesService.saveActivity({ ...row, Action: 'U' }).subscribe({
      next: () => {
        this.toast.show('Activity saved', { variant: 'success', duration: 3000 });
        this.loadActivities();
        this.saving = false;
      },
      error: (err) => {
        this.toast.show(err?.error?.message || 'Save failed', { variant: 'error', duration: 5000 });
        this.saving = false;
      }
    });
  }

  revertRow(row: ActivityDashboard): void {
    if (!confirm('Revert this activity?')) return;

    this.saving = true;
    this.activitiesService.revertActivity(row).subscribe({
      next: () => {
        this.toast.show('Activity reverted', { variant: 'success', duration: 3000 });
        this.loadActivities();
        this.saving = false;
      },
      error: (err) => {
        this.toast.show(err?.error?.message || 'Revert failed', { variant: 'error', duration: 5000 });
        this.saving = false;
      }
    });
  }

  getGradeLabel(code: string): string {
    if (!code) return 'N/A';
    const grade = this.grades.find((g) => g['Cd'] === code);
    return grade ? grade['vals'] : code;
  }
}

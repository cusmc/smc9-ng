import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { CompetencyAssessmentService } from './competency-assessment.service';
import { LookupService } from '../../shared/lookup.service';
import {
  StudentCompetency,
  CodeListItem,
} from './competency-assessment.models';
import { ToastService } from '../../../core/toast/toast.service';

type StatusFilter = 'A' | 'P' | 'C' | 'R';

@Component({
  selector: 'app-competency-assessment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './competency-assessment.component.html',
  styleUrls: ['./competency-assessment.component.scss'],
})
export class CompetencyAssessmentComponent implements OnInit {
  allData: StudentCompetency[] = [];
  filteredData: StudentCompetency[] = [];

  subjects: any[] = [];
  students: any[] = [];
  decisionList: CodeListItem[] = [];
  ratingList: CodeListItem[] = [];

  filterForm: FormGroup;
  selectedStatus: StatusFilter = 'A';
  loading = false;
  saving = false;

  countAll = 0;
  countP = 0;
  countC = 0;
  countR = 0;
  username = '';

  currentPage = 1;
  readonly itemsPerPage = 10;

  constructor(
    private authService: AuthService,
    private service: CompetencyAssessmentService,
    private lookup: LookupService,
    private fb: FormBuilder,
    private toast: ToastService,
  ) {
    this.filterForm = this.fb.group({ Subject_id: [null], Studno: [null] });
  }

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
    this.lookup
      .getCodeList('Decision')
      .subscribe((d) => (this.decisionList = d));
    this.lookup.getCodeList('RATING_C').subscribe((d) => (this.ratingList = d));
    this.lookup.getSubjectsByEmpid(this.username).subscribe((data) => {
      this.subjects = data;
      if (data.length > 0) {
        this.filterForm.patchValue({ Subject_id: data[0].Subject_id });
        this.loadStudents(data[0].Subject_id);
      }
    });
  }

  onSubjectChange(): void {
    const id = this.filterForm.get('Subject_id')?.value;
    this.filterForm.patchValue({ Studno: null });
    if (id) this.loadStudents(id);
    else this.students = [];
  }

  private loadStudents(subjectId: number): void {
    this.lookup
      .getStudentsByCourse(subjectId)
      .subscribe((d) => (this.students = d));
  }

  loadData(): void {
    const { Subject_id, Studno } = this.filterForm.value;
    this.loading = true;
    this.service.getCompetencies(this.username, Subject_id, Studno).subscribe({
      next: (data) => {
        this.allData = data;
        this.countAll = data.length;
        this.countP = data.filter((d) => d.Status === 'P').length;
        this.countC = data.filter((d) => d.Status === 'C').length;
        this.countR = data.filter((d) => d.Status === 'R').length;
        this.applyFilter();
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Failed to load competencies', {
          variant: 'error',
          duration: 4000,
        });
        this.loading = false;
      },
    });
  }

  setStatus(s: StatusFilter): void {
    this.selectedStatus = s;
    this.currentPage = 1;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filteredData =
      this.selectedStatus === 'A'
        ? this.allData
        : this.allData.filter((d) => d.Status === this.selectedStatus);
  }

  get pagedData(): StudentCompetency[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  update(row: StudentCompetency, action: 'U' | 'R'): void {
    const label = action === 'U' ? 'Update' : 'Revert';
    if (!confirm(`${label} this competency?`)) return;
    this.saving = true;
    this.service.save(row, action).subscribe({
      next: () => {
        this.toast.show(`${label} successful`, {
          variant: 'success',
          duration: 3000,
        });
        this.loadData();
        this.saving = false;
      },
      error: (err) => {
        this.toast.show(err?.error?.message || `${label} failed`, {
          variant: 'error',
          duration: 4000,
        });
        this.saving = false;
      },
    });
  }

  getLabel(list: CodeListItem[], code: string | undefined): string {
    return list.find((i) => i['Cd'] === code)?.['vals'] || code || '';
  }
}

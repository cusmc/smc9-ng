import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { ExaminationService } from './examination.service';
import { LookupService } from '../../shared/lookup.service';
import { ExamResult } from './examination.models';
import { ToastService } from '../../../core/toast/toast.service';

type StatusFilter = 'P' | 'A' | 'R' | 'X';

@Component({
  selector: 'app-examination',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './examination.component.html',
  styleUrls: ['./examination.component.scss']
})
export class ExaminationComponent implements OnInit {
  allData: ExamResult[] = [];
  filteredData: ExamResult[] = [];

  subjects: any[] = [];
  students: any[] = [];
  filterForm: FormGroup;
  authForm: FormGroup;

  selectedStatus: StatusFilter = 'P';
  loading = false;
  saving = false;
  authRow: ExamResult | null = null;

  countAll = 0;
  countP = 0;
  countA = 0;
  countR = 0;
  username = '';

  search = { Exam_id: '', Studname: '', Exam_nm: '', Course_nm: '', Create_by: '', Create_dt: '' };
  currentPage = 1;
  readonly itemsPerPage = 10;

  constructor(
    private authService: AuthService,
    private service: ExaminationService,
    private lookup: LookupService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.filterForm = this.fb.group({ Subject_id: [null], Studno: [null] });
    this.authForm = this.fb.group({ Comments: [''] });
  }

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
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

  private loadStudents(id: number): void {
    this.lookup.getStudentsByCourse(id).subscribe((d) => (this.students = d));
  }

  loadData(): void {
    const { Subject_id, Studno } = this.filterForm.value;
    this.loading = true;
    this.service.getExamResults(Subject_id, Studno).subscribe({
      next: (data) => {
        this.allData = data;
        this.countAll = data.length;
        this.countP = data.filter((d) => d.Status === 'P').length;
        this.countA = data.filter((d) => d.Status === 'A').length;
        this.countR = data.filter((d) => d.Status === 'R').length;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.toast.show('Failed to load exam results', { variant: 'error', duration: 4000 });
        this.loading = false;
      }
    });
  }

  setStatus(s: StatusFilter): void {
    this.selectedStatus = s;
    this.currentPage = 1;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filteredData = this.selectedStatus === 'X' ? this.allData : this.allData.filter((d) => d.Status === this.selectedStatus);
  }

  get searchedData(): ExamResult[] {
    return this.filteredData.filter(r =>
      (!this.search.Exam_id    || String(r.Exam_id ?? '').includes(this.search.Exam_id)) &&
      (!this.search.Studname   || (r.Studname  ?? '').toLowerCase().includes(this.search.Studname.toLowerCase())) &&
      (!this.search.Exam_nm    || (r.Exam_nm   ?? '').toLowerCase().includes(this.search.Exam_nm.toLowerCase())) &&
      (!this.search.Course_nm  || (r.Course_nm ?? '').toLowerCase().includes(this.search.Course_nm.toLowerCase())) &&
      (!this.search.Create_by  || (r.Create_by ?? '').toLowerCase().includes(this.search.Create_by.toLowerCase())) &&
      (!this.search.Create_dt  || (r.Create_dt ?? '').includes(this.search.Create_dt))
    );
  }

  get pagedData(): ExamResult[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.searchedData.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.searchedData.length / this.itemsPerPage);
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  openAuth(row: ExamResult): void {
    this.authRow = row;
    this.authForm.reset();
  }

  closeAuth(): void {
    this.authRow = null;
  }

  authData(status: 'A' | 'R'): void {
    if (!this.authRow) return;
    this.saving = true;
    const payload = {
      Examres_id: this.authRow.Examres_id,
      Status: status,
      Comments: this.authForm.get('Comments')!.value || ''
    };
    this.service.authExamResult(payload).subscribe({
      next: () => {
        this.toast.show('Done', { variant: 'success', duration: 3000 });
        this.closeAuth();
        this.loadData();
        this.saving = false;
      },
      error: (err) => {
        this.toast.show(err?.error?.message || 'Failed', { variant: 'error', duration: 4000 });
        this.saving = false;
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { ExamMasterService } from './exam-master.service';
import { ExamMast } from './exam-master.models';
import { ExamMasterDialogComponent } from './exam-master-dialog.component';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-exam-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exam-master.component.html',
  styleUrls: ['./exam-master.component.scss']
})
export class ExamMasterComponent implements OnInit {
  exams: ExamMast[] = [];
  search = { Exam_nm: '', Admyear: '', Course_nm: '', Create_by: '', Create_dt: '' };
  currentPage = 1;
  readonly itemsPerPage = 10;
  loading = false;

  constructor(
    private service: ExamMasterService,
    private dialog: Dialog,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.loading = true;
    this.service.getExams().subscribe({
      next: (data) => {
        this.exams = data;
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error loading exams', { variant: 'error', duration: 3000 });
        this.loading = false;
      }
    });
  }

  get searchedData(): ExamMast[] {
    return this.exams.filter(e =>
      (!this.search.Exam_nm   || (e.Exam_nm   ?? '').toLowerCase().includes(this.search.Exam_nm.toLowerCase())) &&
      (!this.search.Admyear   || String(e.Admyear   ?? '').includes(this.search.Admyear)) &&
      (!this.search.Course_nm || (e.Course_nm ?? '').toLowerCase().includes(this.search.Course_nm.toLowerCase())) &&
      (!this.search.Create_by || (e.Create_by ?? '').toLowerCase().includes(this.search.Create_by.toLowerCase())) &&
      (!this.search.Create_dt || (e.Create_dt ?? '').includes(this.search.Create_dt))
    );
  }

  get pagedExams(): ExamMast[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.searchedData.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.searchedData.length / this.itemsPerPage);
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  openAddDialog(): void {
    const ref = this.dialog.open(ExamMasterDialogComponent, { width: '600px', data: null });
    ref.closed.subscribe((result) => {
      if (result) this.loadExams();
    });
  }

  openEditDialog(exam: ExamMast): void {
    const ref = this.dialog.open(ExamMasterDialogComponent, { width: '600px', data: exam });
    ref.closed.subscribe((result) => {
      if (result) this.loadExams();
    });
  }

  deleteExam(id: number): void {
    if (confirm('Are you sure you want to delete this exam?')) {
      this.service.deleteExam(id).subscribe({
        next: () => {
          this.toast.show('Exam deleted successfully', { variant: 'success', duration: 3000 });
          this.loadExams();
        },
        error: () => this.toast.show('Error deleting exam', { variant: 'error', duration: 3000 })
      });
    }
  }
}

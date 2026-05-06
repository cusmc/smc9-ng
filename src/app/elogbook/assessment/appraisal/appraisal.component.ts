import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { AuthService } from '../../../auth/auth.service';
import { AppraisalService } from './appraisal.service';
import { AppraisalHeader } from './appraisal.models';
import { AppraisalDialogComponent } from './appraisal-dialog.component';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-appraisal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appraisal.component.html',
  styleUrls: ['./appraisal.component.scss']
})
export class AppraisalComponent implements OnInit {
  dataSource: AppraisalHeader[] = [];
  loading = false;
  username = '';

  search = { Studno: '', Courseid: '', Appraisaldate: '', Overallcomments: '', Create_dt: '', Create_by: '' };
  currentPage = 1;
  readonly itemsPerPage = 10;

  constructor(
    private authService: AuthService,
    private service: AppraisalService,
    private dialog: Dialog,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
  }

  loadData(): void {
    this.loading = true;
    this.service.getAppraisals().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Failed to load appraisals', { variant: 'error', duration: 4000 });
        this.loading = false;
      }
    });
  }

  get searchedData(): AppraisalHeader[] {
    return this.dataSource.filter(r =>
      (!this.search.Studno          || (r.Studno          ?? '').toLowerCase().includes(this.search.Studno.toLowerCase())) &&
      (!this.search.Courseid        || String(r.Courseid  ?? '').includes(this.search.Courseid)) &&
      (!this.search.Appraisaldate   || (r.Appraisaldate   ?? '').includes(this.search.Appraisaldate)) &&
      (!this.search.Overallcomments || (r.Overallcomments ?? '').toLowerCase().includes(this.search.Overallcomments.toLowerCase())) &&
      (!this.search.Create_dt       || (r.Create_dt       ?? '').includes(this.search.Create_dt)) &&
      (!this.search.Create_by       || (r.Create_by       ?? '').toLowerCase().includes(this.search.Create_by.toLowerCase()))
    );
  }

  get pagedData(): AppraisalHeader[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.searchedData.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.searchedData.length / this.itemsPerPage);
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  openDialog(studno: string | number): void {
    const ref = this.dialog.open(AppraisalDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      disableClose: true,
      data: { Studno: studno, username: this.username }
    });
    ref.closed.subscribe((saved) => {
      if (saved) this.loadData();
    });
  }
}

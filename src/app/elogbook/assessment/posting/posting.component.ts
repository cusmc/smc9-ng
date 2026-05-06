import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { AuthService } from '../../../auth/auth.service';
import { PostingService } from './posting.service';
import { LookupService } from '../../shared/lookup.service';
import { PostingRow } from './posting.models';
import { PostingDialogComponent } from './posting-dialog.component';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-posting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './posting.component.html',
  styleUrls: ['./posting.component.scss']
})
export class PostingComponent implements OnInit {
  dataSource: PostingRow[] = [];

  subjects: any[] = [];
  filterForm: FormGroup;
  loading = false;
  username = '';

  search = { Name: '', Specialty_nm: '', Startdate: '', Enddate: '', FacultyName: '', Create_by: '', Create_dt: '' };
  currentPage = 1;
  readonly itemsPerPage = 10;

  constructor(
    private authService: AuthService,
    private service: PostingService,
    private lookup: LookupService,
    private fb: FormBuilder,
    private dialog: Dialog,
    private toast: ToastService
  ) {
    this.filterForm = this.fb.group({ Subject_id: [null] });
  }

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
    this.lookup.getSubjectsByEmpid(this.username).subscribe((data) => {
      this.subjects = data;
      if (data.length > 0) this.filterForm.patchValue({ Subject_id: data[0].Subject_id });
    });
  }

  loadData(): void {
    const subjectId = this.filterForm.get('Subject_id')?.value;
    if (!subjectId) return;
    this.loading = true;
    this.service.getPostings(subjectId).subscribe({
      next: (data) => {
        this.dataSource = data;
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Failed to load postings', { variant: 'error', duration: 4000 });
        this.loading = false;
      }
    });
  }

  get searchedData(): PostingRow[] {
    return this.dataSource.filter(r =>
      (!this.search.Name        || (r.Name        ?? '').toLowerCase().includes(this.search.Name.toLowerCase())) &&
      (!this.search.Specialty_nm|| (r.Specialty_nm ?? '').toLowerCase().includes(this.search.Specialty_nm.toLowerCase())) &&
      (!this.search.Startdate   || (r.Startdate    ?? '').includes(this.search.Startdate)) &&
      (!this.search.Enddate     || (r.Enddate      ?? '').includes(this.search.Enddate)) &&
      (!this.search.FacultyName || (r.FacultyName  ?? '').toLowerCase().includes(this.search.FacultyName.toLowerCase())) &&
      (!this.search.Create_by   || (r.Create_by    ?? '').toLowerCase().includes(this.search.Create_by.toLowerCase())) &&
      (!this.search.Create_dt   || (r.Create_dt    ?? '').includes(this.search.Create_dt))
    );
  }

  get pagedData(): PostingRow[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.searchedData.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.searchedData.length / this.itemsPerPage);
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  openDialog(pkId: number): void {
    const ref = this.dialog.open(PostingDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      disableClose: true,
      data: { Pk_id: pkId, username: this.username }
    });
    ref.closed.subscribe((saved) => {
      if (saved) this.loadData();
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { StudentViewService } from './student-view.service';
import { StudentListItem } from './student-view.models';
import { ToastService } from '../../core/toast/toast.service';
import { StudentLedgerDialogComponent } from './student-ledger-dialog.component';
import { StudentDetailsDialogComponent } from './student-details-dialog.component';
import { StudentResultDialogComponent } from './student-result-dialog.component';

@Component({
  selector: 'app-student-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-view.component.html',
  styleUrls: ['./student-view.component.scss'],
})
export class StudentViewComponent implements OnInit {
  students: StudentListItem[] = [];
  loading = false;

  search = { no: '', name: '', stat: '', admyear: '' };

  currentPage = 1;
  readonly itemsPerPage = 15;

  get searchedData(): StudentListItem[] {
    return this.students.filter(
      (s) =>
        (!this.search.no || String(s.no).includes(this.search.no)) &&
        (!this.search.name ||
          (s.name ?? '').toLowerCase().includes(this.search.name.toLowerCase())) &&
        (!this.search.stat ||
          (s.stat ?? '').toLowerCase().includes(this.search.stat.toLowerCase())) &&
        (!this.search.admyear ||
          String(s.admyear ?? '').includes(this.search.admyear)),
    );
  }

  get totalPages(): number {
    return Math.ceil(this.searchedData.length / this.itemsPerPage) || 1;
  }

  get pagedData(): StudentListItem[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.searchedData.slice(start, start + this.itemsPerPage);
  }

  constructor(
    private service: StudentViewService,
    private dialog: Dialog,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (data) => {
        this.students = data;
        this.loading = false;
        this.currentPage = 1;
      },
      error: () => {
        this.toast.show('Error loading students', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  openLedger(s: StudentListItem): void {
    this.dialog.open(StudentLedgerDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: s,
    });
  }

  openDetails(s: StudentListItem): void {
    this.dialog.open(StudentDetailsDialogComponent, {
      width: '820px',
      maxWidth: '95vw',
      data: s,
    });
  }

  openResult(s: StudentListItem): void {
    this.dialog.open(StudentResultDialogComponent, {
      width: '950px',
      maxWidth: '95vw',
      data: s,
    });
  }

  openUploadDocu(s: StudentListItem): void {
    window.open(`/ECampus/StudDocuUpload?Studno=${s.no}&Studnm=${encodeURIComponent(s.name)}`);
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }
}

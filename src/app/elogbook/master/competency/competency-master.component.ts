import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { CompetencyMasterService } from './competency-master.service';
import { Competency } from './competency-master.models';
import { CompetencyMasterDialogComponent } from './competency-master-dialog.component';
import { LookupService } from '../../shared/lookup.service';
import { AuthService } from '../../../auth/auth.service';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-competency-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './competency-master.component.html',
  styleUrls: ['./competency-master.component.scss']
})
export class CompetencyMasterComponent implements OnInit {
  competencies: Competency[] = [];
  subjects: any[] = [];
  selectedSubjectId: number | null = null;
  search = { Section_nm: '', Description: '', Subdesc: '', Mode_nm: '', Yr: '', Create_by: '', Create_dt: '' };
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 20, 50];
  loading = false;

  constructor(
    private service: CompetencyMasterService,
    private lookupService: LookupService,
    private authService: AuthService,
    private dialog: Dialog,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const empid = this.authService.getUsername() || '';
    this.lookupService.getSubjectsByEmpid(empid).subscribe({
      next: (data) => {
        this.subjects = data;
        if (data.length > 0) {
          this.selectedSubjectId = data[0].Subject_id;
          this.loadCompetencies();
        }
      },
      error: () => this.toast.show('Error loading subjects', { variant: 'error', duration: 3000 })
    });
  }

  get searchedData(): Competency[] {
    return this.competencies.filter(c =>
      (!this.search.Section_nm  || (c.Section_nm  ?? '').toLowerCase().includes(this.search.Section_nm.toLowerCase())) &&
      (!this.search.Description || (c.Description ?? '').toLowerCase().includes(this.search.Description.toLowerCase())) &&
      (!this.search.Subdesc     || (c.Subdesc     ?? '').toLowerCase().includes(this.search.Subdesc.toLowerCase())) &&
      (!this.search.Mode_nm     || (c.Mode_nm     ?? '').toLowerCase().includes(this.search.Mode_nm.toLowerCase())) &&
      (!this.search.Yr          || String(c.Yr    ?? '').includes(this.search.Yr)) &&
      (!this.search.Create_by   || (c.Create_by   ?? '').toLowerCase().includes(this.search.Create_by.toLowerCase())) &&
      (!this.search.Create_dt   || (c.Create_dt   ?? '').includes(this.search.Create_dt))
    );
  }

  get filteredCompetencies(): Competency[] {
    return this.searchedData;
  }

  get pagedCompetencies(): Competency[] {
    const start = this.pageIndex * this.pageSize;
    return this.searchedData.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.searchedData.length / this.pageSize) || 1;
  }

  onSubjectChange(subjectId: number): void {
    this.selectedSubjectId = subjectId;
    this.pageIndex = 0;
    this.loadCompetencies();
  }

  loadCompetencies(): void {
    if (!this.selectedSubjectId) return;
    this.loading = true;
    this.service.getCompetencies(this.selectedSubjectId).subscribe({
      next: (data) => {
        this.competencies = data;
        this.pageIndex = 0;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error loading competencies', { variant: 'error', duration: 3000 });
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    this.pageIndex = 0;
  }

  openAddDialog(): void {
    const ref = this.dialog.open(CompetencyMasterDialogComponent, { width: '600px', data: null });
    ref.closed.subscribe((result) => {
      if (result) this.loadCompetencies();
    });
  }

  openEditDialog(competency: Competency): void {
    const ref = this.dialog.open(CompetencyMasterDialogComponent, { width: '600px', data: competency });
    ref.closed.subscribe((result) => {
      if (result) this.loadCompetencies();
    });
  }

  deleteCompetency(id: number): void {
    if (confirm('Are you sure you want to delete this competency?')) {
      this.service.deleteCompetency(id).subscribe({
        next: () => {
          this.toast.show('Competency deleted successfully', { variant: 'success', duration: 3000 });
          this.loadCompetencies();
        },
        error: () => this.toast.show('Error deleting competency', { variant: 'error', duration: 3000 })
      });
    }
  }

  openImportDialog(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.service.importCompetencies(file).subscribe({
          next: () => {
            this.toast.show('Competencies imported successfully', { variant: 'success', duration: 3000 });
            this.loadCompetencies();
          },
          error: () => this.toast.show('Error importing competencies', { variant: 'error', duration: 3000 })
        });
      }
    };
    input.click();
  }

  onPageSizeChange(): void {
    this.pageIndex = 0;
  }

  prevPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
    }
  }

  nextPage(): void {
    const last = Math.max(0, this.totalPages - 1);
    if (this.pageIndex < last) {
      this.pageIndex++;
    }
  }
}

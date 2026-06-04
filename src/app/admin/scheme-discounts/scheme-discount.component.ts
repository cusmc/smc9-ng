import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { SchemeDiscountService } from './scheme-discount.service';
import { SchDiscountRow, SchemeItem } from './scheme-discount.models';
import { SchemeDiscountEditDialogComponent } from './scheme-discount-edit-dialog.component';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-scheme-discounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scheme-discount.component.html',
})
export class SchemeDiscountsComponent implements OnInit {
  schemeList: SchemeItem[] = [];
  rows: SchDiscountRow[] = [];
  selectedSchmastId: number | null = null;
  loading = false;
  currentPage = 1;
  readonly itemsPerPage = 15;

  search = { Level: '', NarrOrGroup: '', DiscountPct: '' };

  constructor(
    private service: SchemeDiscountService,
    private dialog: Dialog,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.service.getSchemeList().subscribe({
      next: (data) => (this.schemeList = data),
      error: () => this.toast.show('Error loading schemes', { variant: 'error', duration: 3000 }),
    });
  }

  loadData(): void {
    if (!this.selectedSchmastId) return;
    this.loading = true;
    this.service.getByScheme(this.selectedSchmastId).subscribe({
      next: (data) => {
        this.rows = data;
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error loading discount rules', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  get filteredRows(): SchDiscountRow[] {
    return this.rows.filter(
      (r) =>
        (!this.search.Level || r.Level.toLowerCase().includes(this.search.Level.toLowerCase())) &&
        (!this.search.NarrOrGroup || this.displayName(r).toLowerCase().includes(this.search.NarrOrGroup.toLowerCase())) &&
        (!this.search.DiscountPct || String(r.DiscountPct).includes(this.search.DiscountPct)),
    );
  }

  get pagedRows(): SchDiscountRow[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRows.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRows.length / this.itemsPerPage));
  }

  onSearchChange(): void { this.currentPage = 1; }

  displayName(r: SchDiscountRow): string {
    if (r.Level === 'Item') return r.Narration || String(r.Narrcode ?? '');
    if (r.Level === 'Sub-Group') return r.Sgroup_nm;
    return r.Head_nm;
  }

  levelBadgeClass(level: string): string {
    if (level === 'Item') return 'bg-blue-50 text-blue-700';
    if (level === 'Sub-Group') return 'bg-amber-50 text-amber-700';
    return 'bg-emerald-50 text-emerald-700';
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(SchemeDiscountEditDialogComponent, {
      width: '560px',
      data: { schmastId: this.selectedSchmastId, rowId: null },
    });
    ref.closed.subscribe((saved) => { if (saved) this.loadData(); });
  }

  openEditDialog(row: SchDiscountRow): void {
    const ref = this.dialog.open(SchemeDiscountEditDialogComponent, {
      width: '560px',
      data: { schmastId: this.selectedSchmastId, rowId: row.Pk_id },
    });
    ref.closed.subscribe((saved) => { if (saved) this.loadData(); });
  }

  deleteRow(row: SchDiscountRow): void {
    if (!confirm('Deactivate this discount rule?')) return;
    this.service.remove(row.Pk_id).subscribe({
      next: () => {
        this.toast.show('Rule deactivated', { variant: 'success', duration: 3000 });
        this.loadData();
      },
      error: (err) => this.toast.show(err?.error?.Message || 'Error deleting rule', { variant: 'error', duration: 3000 }),
    });
  }
}

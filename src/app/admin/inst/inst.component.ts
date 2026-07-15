import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { InstService } from './inst.service';
import { Inst } from './inst.models';
import { InstFormDialogComponent } from './inst-form-dialog.component';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-inst',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inst.component.html',
})
export class InstComponent implements OnInit {
  items: Inst[] = [];
  loading = false;
  currentPage = 1;
  readonly pageSize = 10;

  search = { id: '', inst_nm: '', inst_cd: '', city: '' };

  constructor(
    private service: InstService,
    private dialog: Dialog,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (data) => { this.items = data; this.currentPage = 1; this.loading = false; },
      error: () => { this.toast.show('Error loading institutes', { variant: 'error', duration: 3000 }); this.loading = false; },
    });
  }

  get filtered(): Inst[] {
    const { id, inst_nm, inst_cd, city } = this.search;
    return this.items.filter(x =>
      (!id      || String(x.Inst_id).includes(id)) &&
      (!inst_nm || (x.Inst_nm ?? '').toLowerCase().includes(inst_nm.toLowerCase())) &&
      (!inst_cd || (x.Inst_cd ?? '').toLowerCase().includes(inst_cd.toLowerCase())) &&
      (!city    || (x.City ?? '').toLowerCase().includes(city.toLowerCase())),
    );
  }

  get paged(): Inst[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  openAdd(): void {
    const ref = this.dialog.open(InstFormDialogComponent, { width: '900px', data: null });
    ref.closed.subscribe(saved => { if (saved) this.load(); });
  }

  openEdit(item: Inst): void {
    const ref = this.dialog.open(InstFormDialogComponent, { width: '900px', data: item });
    ref.closed.subscribe(saved => { if (saved) this.load(); });
  }

  deleteInst(item: Inst): void {
    if (!confirm(`Are you sure you want to delete "${item.Inst_nm}"?`)) { return; }
    this.service.delete(item.Inst_id).subscribe({
      next: () => {
        this.toast.show('Institute deleted', { variant: 'success', duration: 3000 });
        this.load();
      },
      error: () => this.toast.show('Error deleting institute', { variant: 'error', duration: 3000 }),
    });
  }
}

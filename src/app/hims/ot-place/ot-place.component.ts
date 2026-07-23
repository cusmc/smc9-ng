import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { OtPlaceService } from './ot-place.service';
import { Otplace } from './ot-place.models';
import { OtPlaceFormDialogComponent } from './ot-place-form-dialog.component';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-ot-place',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ot-place.component.html',
})
export class OtPlaceComponent implements OnInit {
  items: Otplace[] = [];
  loading = false;
  currentPage = 1;
  readonly pageSize = 10;

  search = { id: '', deptname: '', place: '', userx: '' };

  constructor(
    private service: OtPlaceService,
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
      error: () => { this.toast.showLoadError('OT Places'); this.loading = false; },
    });
  }

  get filtered(): Otplace[] {
    const { id, deptname, place, userx } = this.search;
    return this.items.filter(x =>
      (!id       || String(x.Pk_id).includes(id)) &&
      (!deptname || (x.Deptname ?? '').toLowerCase().includes(deptname.toLowerCase())) &&
      (!place    || (x.Place ?? '').toLowerCase().includes(place.toLowerCase())) &&
      (!userx    || (x.Userx ?? '').toLowerCase().includes(userx.toLowerCase())),
    );
  }

  get paged(): Otplace[] {
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
    const ref = this.dialog.open(OtPlaceFormDialogComponent, { width: '900px', data: null });
    ref.closed.subscribe(saved => { if (saved) this.load(); });
  }

  openEdit(item: Otplace): void {
    const ref = this.dialog.open(OtPlaceFormDialogComponent, { width: '900px', data: item });
    ref.closed.subscribe(saved => { if (saved) this.load(); });
  }

  deleteOtplace(item: Otplace): void {
    if (!confirm(`Are you sure you want to delete "${item.Place}"?`)) { return; }
    this.service.delete(item.Pk_id).subscribe({
      next: () => {
        this.toast.showDeleteSuccess('OT Place');
        this.load();
      },
      error: () => this.toast.showError('Error deleting OT Place'),
    });
  }
}

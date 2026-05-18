import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { UserListingService } from './user-listing.service';
import { UserDetail, UserModuleItem } from './user-listing.models';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-user-listing-modules-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-listing-modules-dialog.component.html',
  styleUrls: ['./user-listing-modules-dialog.component.scss'],
})
export class UserListingModulesDialogComponent implements OnInit {
  modules: UserModuleItem[] = [];
  loading = false;
  search = '';
  currentPage = 1;
  readonly itemsPerPage = 10;

  get filteredModules(): UserModuleItem[] {
    if (!this.search) return this.modules;
    const q = this.search.toLowerCase();
    return this.modules.filter(
      (m) =>
        (m.Wmodule_nm ?? '').toLowerCase().includes(q) ||
        (m.Cont_name ?? '').toLowerCase().includes(q) ||
        (m.Permission ?? '').toLowerCase().includes(q),
    );
  }

  get pagedModules(): UserModuleItem[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredModules.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredModules.length / this.itemsPerPage));
  }

  prevPage(): void { if (this.currentPage > 1) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }

  constructor(
    private service: UserListingService,
    private dialogRef: DialogRef<void, UserListingModulesDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: UserDetail,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.service.getModulesForUser(this.data.UserName).subscribe({
      next: (data) => { this.modules = data; this.loading = false; },
      error: () => {
        this.toast.show('Error loading module permissions', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  onClose(): void { this.dialogRef.close(); }
}

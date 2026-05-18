import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { CmsModulesService } from './cms-modules.service';
import { Cmodule, GroupWright } from './cms-modules.models';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-cms-modules-roles-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cms-modules-roles-dialog.component.html',
  styleUrls: ['./cms-modules-roles-dialog.component.scss'],
})
export class CmsModulesRolesDialogComponent implements OnInit {
  groups: GroupWright[] = [];
  loading = false;
  saving = false;
  search = '';
  currentPage = 1;
  readonly itemsPerPage = 7;

  get filteredGroups(): GroupWright[] {
    if (!this.search) return this.groups;
    const q = this.search.toLowerCase();
    return this.groups.filter(
      (g) =>
        (g.UserName ?? '').toLowerCase().includes(q) ||
        (g.FullName ?? '').toLowerCase().includes(q),
    );
  }

  get pagedGroups(): GroupWright[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredGroups.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredGroups.length / this.itemsPerPage));
  }

  prevPage(): void { if (this.currentPage > 1) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }

  deleteGroup(index: number): void {
    const group = this.pagedGroups[index];
    const actualIndex = this.groups.indexOf(group);
    if (actualIndex !== -1) this.groups.splice(actualIndex, 1);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
  }

  constructor(
    private service: CmsModulesService,
    private dialogRef: DialogRef<void, CmsModulesRolesDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: Cmodule,
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.service.getAllGroups(this.data.Module_id).subscribe({
      next: (data) => { this.groups = data; this.loading = false; },
      error: () => {
        this.toast.show('Error loading roles', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  onSave(): void {
    this.saving = true;
    this.service.saveRoleRights('', this.groups).subscribe({
      next: () => {
        this.toast.show('Role rights saved', { variant: 'success', duration: 3000 });
        this.saving = false;
      },
      error: (err) => {
        this.toast.show(err?.error?.Message || 'Error saving rights', { variant: 'error', duration: 3000 });
        this.saving = false;
      },
    });
  }

  onClose(): void { this.dialogRef.close(); }
}

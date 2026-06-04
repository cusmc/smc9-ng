import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { WebModulesService } from './web-modules.service';
import { Wmodule, GroupWright, DEFAULT_LABELS, getModuleLabels, permToChecks, checksToPerm } from './web-modules.models';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-web-modules-roles-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './web-modules-roles-dialog.component.html',
  styleUrls: ['./web-modules-roles-dialog.component.scss'],
})
export class WebModulesRolesDialogComponent implements OnInit {
  groups: GroupWright[] = [];
  loading = false;
  saving = false;
  search = '';
  currentPage = 1;
  readonly itemsPerPage = 7;
  labels: string[] = [...DEFAULT_LABELS];
  isCustom = false;

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
    const globalIndex = (this.currentPage - 1) * this.itemsPerPage + index;
    const group = this.pagedGroups[index];
    const actualIndex = this.groups.indexOf(group);
    if (actualIndex !== -1) this.groups.splice(actualIndex, 1);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
  }

  constructor(
    private service: WebModulesService,
    private dialogRef: DialogRef<void, WebModulesRolesDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: Wmodule,
  ) {}

  ngOnInit(): void {
    this.labels = getModuleLabels(this.data);
    this.isCustom = this.labels.some((l, i) => l !== DEFAULT_LABELS[i]);
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.service.getAllGroups(this.data.Wmodule_id).subscribe({
      next: (data) => {
        this.groups = data.map(g => ({ ...g, checks: permToChecks(g.Permission) }));
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error loading roles', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  onSave(): void {
    this.saving = true;
    const payload = this.groups.map(g => ({ ...g, Permission: checksToPerm(g.checks ?? []) }));
    this.service.saveRoleRights('', payload).subscribe({
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

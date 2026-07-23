import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { WebModulesService } from './web-modules.service';
import { Wmodule, UserWright, DEFAULT_LABELS, getModuleLabels, permToChecks, checksToPerm } from './web-modules.models';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-web-modules-users-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './web-modules-users-dialog.component.html',
  styleUrls: ['./web-modules-users-dialog.component.scss'],
})
export class WebModulesUsersDialogComponent implements OnInit {
  users: UserWright[] = [];
  loading = false;
  saving = false;

  filterUserId   = '';
  filterName     = '';
  filterDept     = '';
  filterCategory = '';

  labels: string[] = [...DEFAULT_LABELS];
  isCustom = false;

  currentPage = 1;
  readonly itemsPerPage = 7;

  get filteredUsers(): UserWright[] {
    const id  = this.filterUserId.toLowerCase();
    const nm  = this.filterName.toLowerCase();
    const dep = this.filterDept.toLowerCase();
    const cat = this.filterCategory.toLowerCase();
    return this.users.filter(u =>
      (!id  || (u.UserName  ?? '').toLowerCase().includes(id)) &&
      (!nm  || (u.FullName  ?? '').toLowerCase().includes(nm)) &&
      (!dep || (u.Deptnm    ?? '').toLowerCase().includes(dep)) &&
      (!cat || (u.category  ?? '').toLowerCase().includes(cat))
    );
  }

  get pagedUsers(): UserWright[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.itemsPerPage));
  }

  resetPage(): void { this.currentPage = 1; }
  prevPage(): void { if (this.currentPage > 1) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }

  constructor(
    private service: WebModulesService,
    private dialogRef: DialogRef<void, WebModulesUsersDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: Wmodule,
  ) {}

  ngOnInit(): void {
    this.labels = getModuleLabels(this.data);
    this.isCustom = this.labels.some((l, i) => l !== DEFAULT_LABELS[i]);
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.service.getAllUsers(this.data.Wmodule_id).subscribe({
      next: (data) => {
        this.users = data.map(u => ({ ...u, checks: permToChecks(u.Permission), Old_permission: u.Permission }));
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error loading users', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  onSave(): void {
    this.saving = true;
    const payload = this.users.map(u => ({ ...u, Permission: checksToPerm(u.checks ?? []) }));
    this.service.saveUserRights(this.data.Wmodule_id, payload).subscribe({
      next: () => {
        this.toast.show('User rights saved', { variant: 'success', duration: 3000 });
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

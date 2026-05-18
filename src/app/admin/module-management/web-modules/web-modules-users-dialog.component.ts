import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { WebModulesService } from './web-modules.service';
import { Wmodule, UserWright } from './web-modules.models';
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
  search = '';

  currentPage = 1;
  readonly itemsPerPage = 7;

  get filteredUsers(): UserWright[] {
    if (!this.search) return this.users;
    const q = this.search.toLowerCase();
    return this.users.filter(
      (u) =>
        u.FullName.toLowerCase().includes(q) ||
        u.UserName.toLowerCase().includes(q) ||
        (u.Deptnm ?? '').toLowerCase().includes(q),
    );
  }

  get pagedUsers(): UserWright[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.itemsPerPage));
  }

  prevPage(): void { if (this.currentPage > 1) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }

  deleteUser(index: number): void {
    const user = this.pagedUsers[index];
    const actualIndex = this.users.indexOf(user);
    if (actualIndex !== -1) this.users.splice(actualIndex, 1);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
  }

  constructor(
    private service: WebModulesService,
    private dialogRef: DialogRef<void, WebModulesUsersDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: Wmodule,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.service.getAllUsers(this.data.Wmodule_id).subscribe({
      next: (data) => { this.users = data; this.loading = false; },
      error: () => {
        this.toast.show('Error loading users', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  onSave(): void {
    this.saving = true;
    this.service.saveUserRights(this.data.Wmodule_id, this.users).subscribe({
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

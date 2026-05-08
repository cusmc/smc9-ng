import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { UserListingService } from './user-listing.service';
import { UserDetail } from './user-listing.models';
import { UserListingEditDialogComponent } from './user-listing-edit-dialog.component';
import { UserListingRightsDialogComponent } from './user-listing-rights-dialog.component';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-user-listing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-listing.component.html',
  styleUrls: ['./user-listing.component.scss'],
})
export class UserListingComponent {
  users: UserDetail[] = [];
  loading = false;
  resetting: Record<string, boolean> = {};
  currentPage = 1;
  readonly itemsPerPage = 10;

  filter = { userId: '', userName: '', status: 'Y' };

  search = {
    UserName: '',
    FullName: '',
    usertype: '',
    Deptnm: '',
    category: '',
    PhoneNumber: '',
    Email: '',
    Status: '',
  };

  constructor(
    private service: UserListingService,
    private dialog: Dialog,
    private toast: ToastService,
  ) {}

  loadUsers(): void {
    this.loading = true;
    this.service.getSelUsers(this.filter.userId, this.filter.userName, this.filter.status).subscribe({
      next: (data) => {
        this.users = data;
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error loading users', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  get searchedData(): UserDetail[] {
    return this.users.filter(
      (u) =>
        (!this.search.UserName || (u.UserName ?? '').toLowerCase().includes(this.search.UserName.toLowerCase())) &&
        (!this.search.FullName || (u.FullName ?? '').toLowerCase().includes(this.search.FullName.toLowerCase())) &&
        (!this.search.usertype || (u.usertype ?? '').toLowerCase().includes(this.search.usertype.toLowerCase())) &&
        (!this.search.Deptnm || (u.Deptnm ?? '').toLowerCase().includes(this.search.Deptnm.toLowerCase())) &&
        (!this.search.category || (u.category ?? '').toLowerCase().includes(this.search.category.toLowerCase())) &&
        (!this.search.PhoneNumber || (u.PhoneNumber ?? '').toLowerCase().includes(this.search.PhoneNumber.toLowerCase())) &&
        (!this.search.Email || (u.Email ?? '').toLowerCase().includes(this.search.Email.toLowerCase())) &&
        (!this.search.Status || (u.Status ?? '').toLowerCase().includes(this.search.Status.toLowerCase())),
    );
  }

  get pagedData(): UserDetail[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.searchedData.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.searchedData.length / this.itemsPerPage));
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(UserListingEditDialogComponent, { width: '640px', data: null });
    ref.closed.subscribe((saved) => { if (saved) this.loadUsers(); });
  }

  openEditDialog(user: UserDetail): void {
    const ref = this.dialog.open(UserListingEditDialogComponent, { width: '640px', data: user.UserName });
    ref.closed.subscribe((saved) => { if (saved) this.loadUsers(); });
  }

  openRightsDialog(user: UserDetail): void {
    this.dialog.open(UserListingRightsDialogComponent, { width: '900px', data: user });
  }

  resetPassword(user: UserDetail): void {
    if (!confirm('Reset password for ' + user.FullName + '? A new password will be sent via SMS.')) return;
    this.resetting[user.UserName] = true;
    this.service.resetPwdAuto(user.UserName).subscribe({
      next: () => {
        this.toast.show('Password reset. SMS sent to registered mobile number.', { variant: 'success', duration: 4000 });
        this.resetting[user.UserName] = false;
      },
      error: (err) => {
        this.toast.show(err?.error?.Message || 'Error resetting password', { variant: 'error', duration: 3000 });
        this.resetting[user.UserName] = false;
      },
    });
  }

  statusBadgeClass(status: string): string {
    return status === 'Y'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-red-50 text-red-600';
  }
}

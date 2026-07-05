import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { NotificationService } from '../../core/notifications/notification.service';
import { NotificationItem } from '../../core/notifications/notification.models';
import { NotificationMgmtDialogComponent } from './notification-mgmt-dialog.component';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-notification-mgmt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification-mgmt.component.html',
  styleUrls: ['./notification-mgmt.component.scss'],
})
export class NotificationMgmtComponent implements OnInit {
  notifications: NotificationItem[] = [];
  loading = false;
  currentPage = 1;
  readonly itemsPerPage = 10;

  search = { Vtype: '', Username: '', Msg: '', Status: '', NotiDt: '' };

  constructor(
    private service: NotificationService,
    private dialog: Dialog,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (data) => {
        this.notifications = data || [];
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error loading notifications', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  statusLabel(n: NotificationItem): string {
    return n.Readon ? 'Read' : 'Unread';
  }

  get searchedData(): NotificationItem[] {
    return this.notifications.filter(
      (n) =>
        (!this.search.Vtype || (n.Vtype ?? '').toLowerCase().includes(this.search.Vtype.toLowerCase())) &&
        (!this.search.Username || (n.Username ?? '').toLowerCase().includes(this.search.Username.toLowerCase())) &&
        (!this.search.Msg || (n.Msg ?? '').toLowerCase().includes(this.search.Msg.toLowerCase())) &&
        (!this.search.Status || this.statusLabel(n) === this.search.Status) &&
        (!this.search.NotiDt || (n.NotiDt ?? '').includes(this.search.NotiDt)),
    );
  }

  get pagedData(): NotificationItem[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.searchedData.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.searchedData.length / this.itemsPerPage) || 1;
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  openAddDialog(): void {
    const ref = this.dialog.open<boolean>(NotificationMgmtDialogComponent, { width: '560px', data: null });
    ref.closed.subscribe((result) => {
      if (result) this.load();
    });
  }

  openEditDialog(n: NotificationItem): void {
    const ref = this.dialog.open<boolean>(NotificationMgmtDialogComponent, { width: '560px', data: n });
    ref.closed.subscribe((result) => {
      if (result) this.load();
    });
  }

  deleteNotification(n: NotificationItem): void {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    this.service.deleteNotification(n.Notification_id).subscribe({
      next: () => {
        this.toast.show('Notification deleted successfully', { variant: 'success', duration: 3000 });
        this.load();
      },
      error: () => this.toast.show('Error deleting notification', { variant: 'error', duration: 3000 }),
    });
  }
}

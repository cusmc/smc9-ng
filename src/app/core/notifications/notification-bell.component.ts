import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { NotificationItem } from './notification.models';

const POLL_MS = 45000;

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss'],
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  items: NotificationItem[] = [];
  open = false;

  private destroy$ = new Subject<void>();

  constructor(private service: NotificationService) {}

  ngOnInit(): void {
    this.load();
    timer(POLL_MS, POLL_MS)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.load());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.service.getUnreadForUser().subscribe({
      next: (data) => {
        this.items = data || [];
      },
      error: (err) => console.error('Failed to load notifications', err),
    });
  }

  toggle(event: Event): void {
    event.stopPropagation();
    this.open = !this.open;
  }

  @HostListener('document:click')
  closePanel(): void {
    this.open = false;
  }

  markRead(item: NotificationItem, event: Event): void {
    event.stopPropagation();
    this.service.markRead(item.Notification_id).subscribe({
      next: () => {
        this.items = this.items.filter((i) => i.Notification_id !== item.Notification_id);
      },
      error: (err) => console.error('Failed to mark notification read', err),
    });
  }

  get badgeLabel(): string {
    return this.items.length > 9 ? '9+' : String(this.items.length);
  }
}

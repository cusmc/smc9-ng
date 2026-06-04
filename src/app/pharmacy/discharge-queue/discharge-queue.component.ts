import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DischargeQueueService, DischargeQueueFilter } from './discharge-queue.service';
import { DischargeQueueItem } from './discharge-queue.models';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-discharge-queue',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './discharge-queue.component.html',
  styleUrls: ['./discharge-queue.component.scss']
})
export class DischargeQueueComponent implements OnInit, OnDestroy {
  allData:   DischargeQueueItem[] = [];
  isLoading  = false;
  countdown  = 120;
  activeTab: 'Pending' | 'Completed' | 'All' = 'Pending';
  filter: DischargeQueueFilter = {
    disFdate: this.todayStr(),
    disTdate: this.todayStr()
  };

  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private svc: DischargeQueueService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadQueue();
    this.countdownTimer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.loadQueue();
        this.countdown = 120;
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  loadQueue(): void {
    this.isLoading = true;
    this.countdown = 120;
    this.svc.getQueue(this.filter).subscribe({
      next: data => {
        this.allData   = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toast.show('Failed to load discharge queue.', { variant: 'error' });
      }
    });
  }

  setTab(tab: 'Pending' | 'Completed' | 'All'): void {
    this.activeTab = tab;
  }

  resetFilters(): void {
    this.filter = { disFdate: this.todayStr(), disTdate: this.todayStr() };
    this.loadQueue();
  }

  get filteredList(): DischargeQueueItem[] {
    if (this.activeTab === 'Pending')   return this.allData.filter(r => r.status === 'P');
    if (this.activeTab === 'Completed') return this.allData.filter(r => r.status === 'C');
    return this.allData;
  }

  get pendingCount():   number { return this.allData.filter(r => r.status === 'P').length; }
  get completedCount(): number { return this.allData.filter(r => r.status === 'C').length; }

  waitBadge(mins: number): string {
    if (mins <= 120) return 'badge-success';
    if (mins <= 240) return 'badge-warning';
    return 'badge-danger';
  }

  rowClass(mins: number): string {
    if (mins <= 120) return '';
    if (mins <= 240) return 'table-warning';
    return 'table-danger';
  }

  private todayStr(): string {
    const d  = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }
}

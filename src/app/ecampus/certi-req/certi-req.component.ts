import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CertiReqService } from './certi-req.service';
import { CertiRequestDto, CertiStatus, TabDef, TabKey, UpdateStatusPayload } from './certi-req.models';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-certi-req',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './certi-req.component.html',
})
export class CertiReqComponent implements OnInit {
  readonly tabs: TabDef[] = [
    { key: 'all',      label: 'All',          status: null },
    { key: 'pending',  label: 'Pending',       status: ''   },
    { key: 'auth',     label: 'Authenticated', status: 'A'  },
    { key: 'payment',  label: 'Payment Done',  status: 'P'  },
    { key: 'dispatch', label: 'Dispatched',    status: 'D'  },
  ];

  activeTab: TabKey = 'all';
  allData: CertiRequestDto[] = [];
  loading  = false;
  updating = false;

  search = {
    Pk_id:      '',
    Student_nm: '',
    Certi_nm:   '',
    Tdate:      '',
    Remarks:    '',
    Fees:       '',
    Create_by:  '',
    Create_dt:  '',
  };

  currentPage = 1;
  readonly pageSize = 15;

  private readonly updateMessages: Record<string, { ask: string; success: string }> = {
    A: { ask: 'Do you want to authenticate this request?',  success: 'Authenticated successfully.' },
    P: { ask: 'Have you received the payment?',             success: 'Payment received successfully.' },
    D: { ask: 'Do you want to dispatch this order?',        success: 'Order dispatched successfully.' },
  };

  constructor(
    private service: CertiReqService,
    private toast:   ToastService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (data) => {
        this.allData     = data;
        this.currentPage = 1;
        this.loading     = false;
      },
      error: () => {
        this.toast.show('Error loading certificate requests', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  setTab(key: TabKey): void {
    this.activeTab   = key;
    this.currentPage = 1;
  }

  tabCount(tab: TabDef): number {
    if (tab.key === 'all')     return this.allData.length;
    if (tab.key === 'pending') return this.allData.filter(r => !r.Status).length;
    return this.allData.filter(r => r.Status === tab.status).length;
  }

  tabActiveClass(tab: TabDef): string {
    if (this.activeTab !== tab.key) return 'text-[#666] hover:text-[#333]';
    const map: Record<TabKey, string> = {
      all:      'bg-white border border-b-white border-[#e5e5e5] text-[var(--app-primary)]',
      pending:  'bg-white border border-b-white border-[#e5e5e5] text-orange-600',
      auth:     'bg-white border border-b-white border-[#e5e5e5] text-blue-600',
      payment:  'bg-white border border-b-white border-[#e5e5e5] text-amber-600',
      dispatch: 'bg-white border border-b-white border-[#e5e5e5] text-green-600',
    };
    return map[tab.key];
  }

  get tabFiltered(): CertiRequestDto[] {
    const t = this.tabs.find(t => t.key === this.activeTab)!;
    const s = this.search;
    return this.allData.filter(r => {
      const matchTab =
        t.key === 'all'     ? true :
        t.key === 'pending' ? !r.Status :
        r.Status === t.status;

      const matchSearch =
        (!s.Pk_id      || String(r.Pk_id ?? '').includes(s.Pk_id)) &&
        (!s.Student_nm || (r.Student_nm ?? '').toLowerCase().includes(s.Student_nm.toLowerCase())) &&
        (!s.Certi_nm   || (r.Certi_nm   ?? '').toLowerCase().includes(s.Certi_nm.toLowerCase())) &&
        (!s.Tdate      || (r.Tdate      ?? '').includes(s.Tdate)) &&
        (!s.Remarks    || (r.Remarks    ?? '').toLowerCase().includes(s.Remarks.toLowerCase())) &&
        (!s.Fees       || String(r.Fees ?? '').includes(s.Fees)) &&
        (!s.Create_by  || (r.Create_by  ?? '').toLowerCase().includes(s.Create_by.toLowerCase())) &&
        (!s.Create_dt  || (r.Create_dt  ?? '').includes(s.Create_dt));

      return matchTab && matchSearch;
    });
  }

  get pagedData(): CertiRequestDto[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.tabFiltered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.tabFiltered.length / this.pageSize));
  }

  updateStatus(row: CertiRequestDto, status: CertiStatus): void {
    const msgs = this.updateMessages[status];
    if (!msgs || !confirm(msgs.ask)) return;

    this.updating = true;
    const payload: UpdateStatusPayload = { Pk_id: row.Pk_id!, Status: status };
    this.service.updateStatus(payload).subscribe({
      next: () => {
        this.toast.show(msgs.success, { variant: 'success', duration: 3000 });
        this.updating = false;
        this.load();
      },
      error: () => {
        this.toast.show('Update failed. Please try again.', { variant: 'error', duration: 3000 });
        this.updating = false;
      },
    });
  }

  printReceipt(row: CertiRequestDto): void {
    this.service.printReceipt(row.Pk_id!).subscribe({
      next: (url) => window.open(url, '_blank'),
      error: () => this.toast.show('Could not generate receipt.', { variant: 'error', duration: 3000 }),
    });
  }

  statusLabel(status: CertiStatus | null | undefined): string {
    switch (status) {
      case 'A': return 'Authenticated';
      case 'P': return 'Payment Done';
      case 'D': return 'Dispatched';
      default:  return 'Pending';
    }
  }

  statusChipClass(status: CertiStatus | null | undefined): string {
    switch (status) {
      case 'A': return 'bg-blue-100 text-blue-700';
      case 'P': return 'bg-amber-100 text-amber-700';
      case 'D': return 'bg-green-100 text-green-700';
      default:  return 'bg-orange-100 text-orange-700';
    }
  }
}

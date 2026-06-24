import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhPaymentService } from './ph-payment.service';
import { AcTranRow, PayDetailRow, PhNotifyResult } from './ph-payment.models';
import { PhSharedService, FirmOption, FirmYearItem, YearOption } from '../ph-shared.service';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-ph-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ph-payment.component.html',
  styleUrls: ['./ph-payment.component.scss']
})
export class PhPaymentComponent implements OnInit {
  private allFirmYears: FirmYearItem[] = [];
  firmList: FirmOption[] = [];
  yearList: YearOption[] = [];

  selectedFirm = '';
  selectedYear = '';
  fromDate = new Date().toISOString().split('T')[0];
  toDate   = new Date().toISOString().split('T')[0];

  summaryRows: AcTranRow[] = [];
  expandedTranId: number | null = null;
  detailCache = new Map<number, PayDetailRow[]>();
  detailLoading = false;

  loading = false;
  sending = false;

  currentPage = 1;
  readonly itemsPerPage = 15;

  constructor(
    private service: PhPaymentService,
    private shared: PhSharedService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.shared.getFirmYears().subscribe({
      next: (data) => {
        this.allFirmYears = data;
        this.firmList = this.shared.toFirmOptions(data);
        if (this.firmList.length > 0) {
          this.selectedFirm = this.firmList[0].id;
          this.refreshYearList();
        }
      },
      error: () => this.toast.show('Failed to load firm/year list.', { variant: 'error', duration: 5000 })
    });
  }

  onFirmChange(): void {
    this.refreshYearList();
    this.clearData();
  }

  private refreshYearList(): void {
    this.yearList = this.shared.toYearOptions(this.allFirmYears, this.selectedFirm);
    this.selectedYear = this.yearList.length > 0 ? this.yearList[0].id : '';
  }

  private clearData(): void {
    this.summaryRows = [];
    this.expandedTranId = null;
    this.detailCache.clear();
    this.currentPage = 1;
  }

  loadData(): void {
    if (!this.fromDate || !this.toDate) {
      this.toast.show('Please select a date range.', { variant: 'error', duration: 3000 });
      return;
    }
    this.loading = true;
    this.clearData();

    this.service.getTranList(this.selectedFirm, this.selectedYear, this.fromDate, this.toDate).subscribe({
      next: (data) => {
        this.summaryRows = data.map(r => ({ ...r, selected: false }));
        this.loading = false;
        if (data.length === 0)
          this.toast.show('No payment transactions found for the selected period.', { variant: 'error', duration: 4000 });
      },
      error: () => {
        this.toast.show('Failed to load payment data.', { variant: 'error', duration: 5000 });
        this.loading = false;
      }
    });
  }

  toggleDetail(row: AcTranRow): void {
    if (this.expandedTranId === row.tran_id) {
      this.expandedTranId = null;
      return;
    }
    this.expandedTranId = row.tran_id;
    if (!this.detailCache.has(row.tran_id)) {
      this.detailLoading = true;
      this.service.getDetail(this.selectedFirm, this.selectedYear, row.tran_id).subscribe({
        next: (data) => {
          this.detailCache.set(row.tran_id, data);
          this.detailLoading = false;
        },
        error: () => {
          this.detailLoading = false;
          this.toast.show('Failed to load bill detail.', { variant: 'error', duration: 4000 });
        }
      });
    }
  }

  detailFor(tranId: number): PayDetailRow[] {
    return this.detailCache.get(tranId) ?? [];
  }

  selectAll(): void   { this.summaryRows.forEach(r => r.selected = true); }
  deselectAll(): void { this.summaryRows.forEach(r => r.selected = false); }

  get selectedIds(): number[] {
    return this.summaryRows.filter(r => r.selected).map(r => r.tran_id);
  }

  get pagedData(): AcTranRow[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.summaryRows.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.summaryRows.length / this.itemsPerPage);
  }

  sendWhatsApp(): void { this.doSend('W'); }
  sendEmail(): void    { this.doSend('E'); }

  private doSend(type: 'W' | 'E'): void {
    const ids = this.selectedIds;
    if (ids.length === 0) {
      this.toast.show('Select at least one payment.', { variant: 'error', duration: 3000 });
      return;
    }
    this.sending = true;
    this.service.sendNotification({
      firmx: this.selectedFirm,
      yrx: this.selectedYear,
      tran_ids: ids,
      notify_type: type
    }).subscribe({
      next: (results: PhNotifyResult[]) => {
        this.sending = false;
        const ok  = results.filter(r => type === 'W' ? r.queued_wa : r.queued_email);
        const err = results.filter(r => !(type === 'W' ? r.queued_wa : r.queued_email));
        if (ok.length > 0)
          this.toast.show(`${ok.length} notification(s) queued successfully.`, { variant: 'success', duration: 4000 });
        err.forEach(r =>
          this.toast.show(`${r.account_nm}: ${r.message}`, { variant: 'error', duration: 6000 })
        );
      },
      error: (err: any) => {
        this.sending = false;
        let msg: string;
        if (typeof err?.error === 'string' && err.error.trim().length > 0) msg = err.error;
        else if (err?.error?.Message) msg = err.error.Message;
        else if (err?.error?.ExceptionMessage) msg = err.error.ExceptionMessage;
        else msg = 'Failed to queue notifications.';
        this.toast.show(msg, { variant: 'error', duration: 8000 });
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChqPaymentService } from './chq-payment.service';
import { LotListItem, ChqSummaryRow, ChqDetailRow, NotifyResult } from './chq-payment.models';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-chq-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chq-payment.component.html',
  styleUrls: ['./chq-payment.component.scss']
})
export class ChqPaymentComponent implements OnInit {
  lotList: LotListItem[] = [];
  selectedLotId: number | null = null;

  summaryRows: ChqSummaryRow[] = [];
  allDetail: ChqDetailRow[] = [];
  expandedPartyId: number | null = null;

  loading = false;
  sending = false;
  lotsLoading = false;

  currentPage = 1;
  readonly itemsPerPage = 15;

  constructor(
    private service: ChqPaymentService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.lotsLoading = true;
    this.service.getLotList().subscribe({
      next: (data) => { this.lotList = data; this.lotsLoading = false; },
      error: () => {
        this.toast.show('Failed to load lot list', { variant: 'error', duration: 5000 });
        this.lotsLoading = false;
      }
    });
  }

  loadData(): void {
    if (!this.selectedLotId) {
      this.toast.show('Please select a Lot No.', { variant: 'error', duration: 3000 });
      return;
    }
    this.loading = true;
    this.summaryRows = [];
    this.allDetail = [];
    this.expandedPartyId = null;
    this.currentPage = 1;

    this.service.getSummary(this.selectedLotId).subscribe({
      next: (data) => {
        this.summaryRows = data.map(r => ({ ...r, selected: false }));
        this.loading = false;
      },
      error: () => {
        this.toast.show('Failed to load payment data', { variant: 'error', duration: 5000 });
        this.loading = false;
      }
    });

    this.service.getDetail(this.selectedLotId).subscribe({
      next: (data) => { this.allDetail = data; }
    });
  }

  toggleDetail(row: ChqSummaryRow): void {
    this.expandedPartyId = this.expandedPartyId === row.party_id ? null : row.party_id;
  }

  detailFor(partyId: number): ChqDetailRow[] {
    return this.allDetail.filter(d => d.party_id === partyId);
  }

  selectAll(): void   { this.summaryRows.forEach(r => r.selected = true); }
  deselectAll(): void { this.summaryRows.forEach(r => r.selected = false); }

  get selectedIds(): number[] {
    return this.summaryRows.filter(r => r.selected).map(r => r.party_id);
  }

  get pagedData(): ChqSummaryRow[] {
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
      this.toast.show('Select at least one party.', { variant: 'error', duration: 3000 });
      return;
    }
    this.sending = true;
    this.service.sendNotification({ lot_id: this.selectedLotId!, party_ids: ids, notify_type: type })
      .subscribe({
        next: (results) => {
          this.sending = false;
          const ok  = results.filter(r => type === 'W' ? r.queued_wa : r.queued_email);
          const err = results.filter(r => !(type === 'W' ? r.queued_wa : r.queued_email));

          if (ok.length > 0)
            this.toast.show(
              `${ok.length} notification(s) queued successfully.`,
              { variant: 'success', duration: 4000 }
            );

          err.forEach(r =>
            this.toast.show(
              `${r.party_nm}: ${r.message}`,
              { variant: 'error', duration: 6000 }
            )
          );
        },
        error: (err) => {
          this.sending = false;
          let msg: string;
          if (typeof err?.error === 'string' && err.error.trim().length > 0) {
            msg = err.error;
          } else if (err?.error?.Message) {
            msg = err.error.Message;
          } else if (err?.error?.ExceptionMessage) {
            msg = err.error.ExceptionMessage;
          } else {
            msg = 'Failed to queue notifications.';
          }
          this.toast.show(msg, { variant: 'error', duration: 8000 });
        }
      });
  }

  payThrough(row: ChqSummaryRow): string {
    return row.rtgs ? 'RTGS' : 'Cheque';
  }
}

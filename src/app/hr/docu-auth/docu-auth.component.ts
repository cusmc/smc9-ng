import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { DocuAuthService, PendingDocuRecord } from './docu-auth.service';
import { ToastService } from '../../core/toast/toast.service';
import { FileViewerDialogComponent } from '../../shared/file-viewer-dialog/file-viewer-dialog.component';

@Component({
  selector: 'app-docu-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './docu-auth.component.html',
})
export class DocuAuthComponent implements OnInit {
  records: PendingDocuRecord[] = [];
  loading = false;
  processing: Record<number, boolean> = {};
  rejectingId: number | null = null;
  rejReason = '';

  constructor(
    private service: DocuAuthService,
    private toast: ToastService,
    private dialog: Dialog,
  ) {}

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.loading = true;
    this.service.getPendingDocuments().subscribe({
      next: (data) => {
        this.records = data;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Failed to load pending documents', { variant: 'error' });
        this.loading = false;
      },
    });
  }

  viewFile(rec: PendingDocuRecord): void {
    this.dialog.open(FileViewerDialogComponent, {
      width: '95vw',
      height: '95vh',
      data: { documastId: rec.documast_id, filename: rec.filename, title: `${rec.empnm} — ${rec.DocType}` },
    });
  }

  approve(rec: PendingDocuRecord): void {
    this.processing[rec.documast_id] = true;
    this.service.authorizeDocument({ Documast_id: rec.documast_id, Decision: 'A', RejReason: '' }).subscribe({
      next: () => {
        this.toast.show(`Approved document for ${rec.empnm}`, { variant: 'success' });
        this.records = this.records.filter(r => r.documast_id !== rec.documast_id);
        delete this.processing[rec.documast_id];
      },
      error: (err) => {
        this.toast.show(err?.error || 'Approval failed', { variant: 'error' });
        delete this.processing[rec.documast_id];
      },
    });
  }

  startReject(id: number): void {
    this.rejectingId = id;
    this.rejReason = '';
  }

  cancelReject(): void {
    this.rejectingId = null;
    this.rejReason = '';
  }

  confirmReject(rec: PendingDocuRecord): void {
    if (!this.rejReason.trim()) {
      this.toast.show('Please enter a rejection reason', { variant: 'warning' });
      return;
    }
    this.processing[rec.documast_id] = true;
    this.service.authorizeDocument({ Documast_id: rec.documast_id, Decision: 'R', RejReason: this.rejReason }).subscribe({
      next: () => {
        this.toast.show(`Rejected document for ${rec.empnm}`, { variant: 'info' });
        this.records = this.records.filter(r => r.documast_id !== rec.documast_id);
        this.rejectingId = null;
        this.rejReason = '';
        delete this.processing[rec.documast_id];
      },
      error: (err) => {
        this.toast.show(err?.error || 'Rejection failed', { variant: 'error' });
        delete this.processing[rec.documast_id];
      },
    });
  }
}

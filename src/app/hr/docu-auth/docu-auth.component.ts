import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { DocuAuthService, DocuRecord } from './docu-auth.service';
import { ToastService } from '../../core/toast/toast.service';
import { FileViewerDialogComponent } from '../../shared/file-viewer-dialog/file-viewer-dialog.component';
import { AutocompleteComponent, AcItem } from '../../shared/autocomplete/autocomplete.component';

type TabId = 'P' | 'A' | 'R' | 'S' | 'ALL';

interface Tab {
  id: TabId;
  label: string;
  badgeClass: string;
  activeClass: string;
}

@Component({
  selector: 'app-docu-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, AutocompleteComponent],
  templateUrl: './docu-auth.component.html',
})
export class DocuAuthComponent implements OnInit {
  allRecords: DocuRecord[] = [];
  loading = false;
  processing: Record<number, boolean> = {};

  activeTab: TabId = 'P';

  // Employee autocomplete
  empItems: AcItem[] = [];
  selectedEmpId: number | null = null;

  // Inline forms
  rejectingId: number | null = null;
  rejReason = '';
  resubmitId: number | null = null;
  resubmitReason = '';

  readonly tabs: Tab[] = [
    { id: 'P',   label: 'Pending',            badgeClass: 'bg-amber-100 text-amber-700', activeClass: 'border-amber-500 text-amber-700' },
    { id: 'A',   label: 'Approved',           badgeClass: 'bg-green-100 text-green-700', activeClass: 'border-green-600 text-green-700' },
    { id: 'R',   label: 'Rejected',           badgeClass: 'bg-red-100 text-red-700',     activeClass: 'border-red-500 text-red-700' },
    { id: 'S',   label: 'Resubmit Requested', badgeClass: 'bg-teal-100 text-teal-700',   activeClass: 'border-teal-500 text-teal-700' },
    { id: 'ALL', label: 'All',                badgeClass: 'bg-slate-100 text-slate-600', activeClass: 'border-slate-500 text-slate-600' },
  ];

  constructor(
    private service: DocuAuthService,
    private toast: ToastService,
    private dialog: Dialog,
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.rejectingId = null;
    this.resubmitId = null;
    const empId = this.selectedEmpId ?? undefined;
    this.service.getAllDocuments(empId).subscribe({
      next: (data) => {
        this.allRecords = data;
        this.loading = false;
        // Populate employee picker from the unfiltered load so users can switch employees
        if (!empId) {
          const seen = new Set<number>();
          this.empItems = data
            .filter(r => r.empid && r.empnm && !seen.has(r.empid) && !!seen.add(r.empid))
            .map(r => ({ id: r.empid, nm: r.empnm }))
            .sort((a, b) => a.nm.localeCompare(b.nm));
        }
      },
      error: () => {
        this.toast.show('Failed to load documents', { variant: 'error' });
        this.loading = false;
      },
    });
  }

  onView(): void {
    this.loadAll();
  }

  get filteredRecords(): DocuRecord[] {
    if (this.activeTab === 'ALL') return this.allRecords;
    return this.allRecords.filter(r => r.auth_status === this.activeTab);
  }

  tabCount(id: TabId): number {
    if (id === 'ALL') return this.allRecords.length;
    return this.allRecords.filter(r => r.auth_status === id).length;
  }

  setTab(id: TabId): void {
    this.activeTab = id;
    this.rejectingId = null;
    this.rejReason = '';
    this.resubmitId = null;
    this.resubmitReason = '';
  }

  viewFile(rec: DocuRecord): void {
    this.dialog.open(FileViewerDialogComponent, {
      width: '95vw',
      height: '95vh',
      data: { documastId: rec.documast_id, filename: rec.filename, title: `${rec.empnm} — ${rec.DocType}` },
    });
  }

  // --- Approve ---
  approve(rec: DocuRecord): void {
    this.processing[rec.documast_id] = true;
    this.service.authorizeDocument({ Documast_id: rec.documast_id, Decision: 'A', RejReason: '' }).subscribe({
      next: () => {
        this.toast.show(`Approved document for ${rec.empnm}`, { variant: 'success' });
        this.updateLocalRecord(rec.documast_id, { auth_status: 'A', authdt: new Date().toISOString(), rejreason: '' });
        delete this.processing[rec.documast_id];
      },
      error: (err) => {
        this.toast.show(err?.error || 'Approval failed', { variant: 'error' });
        delete this.processing[rec.documast_id];
      },
    });
  }

  // --- Reject ---
  startReject(id: number): void {
    this.rejectingId = id;
    this.rejReason = '';
    this.resubmitId = null;
    this.resubmitReason = '';
  }

  cancelReject(): void {
    this.rejectingId = null;
    this.rejReason = '';
  }

  confirmReject(rec: DocuRecord): void {
    if (!this.rejReason.trim()) {
      this.toast.show('Please enter a rejection reason', { variant: 'warning' });
      return;
    }
    this.processing[rec.documast_id] = true;
    this.service.authorizeDocument({ Documast_id: rec.documast_id, Decision: 'R', RejReason: this.rejReason }).subscribe({
      next: () => {
        this.toast.show(`Rejected document for ${rec.empnm}`, { variant: 'info' });
        this.updateLocalRecord(rec.documast_id, { auth_status: 'R', rejreason: this.rejReason, authdt: new Date().toISOString() });
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

  // --- Resubmit Request ---
  startResubmit(id: number): void {
    this.resubmitId = id;
    this.resubmitReason = '';
    this.rejectingId = null;
    this.rejReason = '';
  }

  cancelResubmit(): void {
    this.resubmitId = null;
    this.resubmitReason = '';
  }

  confirmResubmit(rec: DocuRecord): void {
    if (!this.resubmitReason.trim()) {
      this.toast.show('Please enter a reason for resubmission', { variant: 'warning' });
      return;
    }
    this.processing[rec.documast_id] = true;
    this.service.authorizeDocument({ Documast_id: rec.documast_id, Decision: 'S', RejReason: this.resubmitReason }).subscribe({
      next: () => {
        const notifTarget = rec.empUsername || rec.create_by;
        if (notifTarget) {
          this.service.sendNotification({
            Vtype: 'DOCU',
            Username: notifTarget,
            Msg: `Your ${rec.DocType} document has been returned for resubmission. Reason: ${this.resubmitReason}`,
            Inst_id: null,
          }).subscribe();
        }
        this.toast.show(`Resubmission requested for ${rec.empnm}`, { variant: 'info' });
        this.updateLocalRecord(rec.documast_id, { auth_status: 'S', rejreason: this.resubmitReason, authdt: new Date().toISOString() });
        this.resubmitId = null;
        this.resubmitReason = '';
        delete this.processing[rec.documast_id];
      },
      error: (err) => {
        this.toast.show(err?.error || 'Request failed', { variant: 'error' });
        delete this.processing[rec.documast_id];
      },
    });
  }

  private updateLocalRecord(id: number, changes: Partial<DocuRecord>): void {
    const idx = this.allRecords.findIndex(r => r.documast_id === id);
    if (idx !== -1) {
      this.allRecords[idx] = { ...this.allRecords[idx], ...changes };
    }
  }
}

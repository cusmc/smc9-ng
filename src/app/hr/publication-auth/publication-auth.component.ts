import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import {
  PublicationAuthService, PublicationRecord, PubDocuAttachment,
} from './publication-auth.service';
import { ToastService } from '../../core/toast/toast.service';
import { FileViewerDialogComponent } from '../../shared/file-viewer-dialog/file-viewer-dialog.component';
import { RightsService } from '../../auth/rights.service';
import { RightModal } from '../../auth/rights.models';

type TabId = 'P' | 'A' | 'R' | 'ALL';

interface Tab {
  id: TabId;
  label: string;
  badgeClass: string;
  activeClass: string;
}

@Component({
  selector: 'app-publication-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publication-auth.component.html',
})
export class PublicationAuthComponent implements OnInit {
  allRecords: PublicationRecord[] = [];
  attachments: PubDocuAttachment[] = [];
  loading = false;
  processing: Record<number, boolean> = {};
  rights: RightModal = { View: false, Add: false, Edit: false, Delete: false, Auth1: false, Auth2: false, Sp1: false, Sp2: false };

  activeTab: TabId = 'P';

  rejectingId: number | null = null;
  rejReason = '';

  search = {
    empid: '',
    empnm: '',
    title: '',
    reason: '',
  };

  readonly tabs: Tab[] = [
    { id: 'P',   label: 'Pending',  badgeClass: 'bg-amber-100 text-amber-700', activeClass: 'border-amber-500 text-amber-700' },
    { id: 'A',   label: 'Approved', badgeClass: 'bg-green-100 text-green-700', activeClass: 'border-green-600 text-green-700' },
    { id: 'R',   label: 'Rejected', badgeClass: 'bg-red-100 text-red-700',     activeClass: 'border-red-500 text-red-700' },
    { id: 'ALL', label: 'All',      badgeClass: 'bg-slate-100 text-slate-600', activeClass: 'border-slate-500 text-slate-600' },
  ];

  constructor(
    private service: PublicationAuthService,
    private toast: ToastService,
    private dialog: Dialog,
    private rightsService: RightsService,
  ) {}

  ngOnInit(): void {
    this.rights = this.rightsService.getRightsModal('HR', 'PublicationAuth');
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.rejectingId = null;
    this.service.getAllPublications().subscribe({
      next: (data) => { this.allRecords = data; this.loading = false; },
      error: () => {
        this.toast.show('Failed to load publications', { variant: 'error' });
        this.loading = false;
      },
    });
    this.service.getAllAttachments().subscribe({
      next: (data) => (this.attachments = data),
      error: () => this.toast.show('Failed to load attachments', { variant: 'error' }),
    });
  }

  attachmentsFor(pubcId: number): PubDocuAttachment[] {
    return this.attachments.filter(a => a.pubc_id === pubcId);
  }

  get filteredRecords(): PublicationRecord[] {
    const list = this.activeTab === 'ALL' ? this.allRecords : this.allRecords.filter(r => r.Auth_Status === this.activeTab);
    return list.filter(r =>
      (!this.search.empid || String(r.Empid ?? '').includes(this.search.empid.trim())) &&
      (!this.search.empnm || (r.Empnm ?? '').toLowerCase().includes(this.search.empnm.toLowerCase())) &&
      (!this.search.title || (r.Pubc_nm ?? '').toLowerCase().includes(this.search.title.toLowerCase())) &&
      (!this.search.reason || (r.RejReason ?? '').toLowerCase().includes(this.search.reason.toLowerCase())),
    );
  }

  tabCount(id: TabId): number {
    if (id === 'ALL') { return this.allRecords.length; }
    return this.allRecords.filter(r => r.Auth_Status === id).length;
  }

  setTab(id: TabId): void {
    this.activeTab = id;
    this.rejectingId = null;
    this.rejReason = '';
  }

  initials(name: string | null): string {
    return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  baseName(filename: string): string {
    return (filename || '').split(/[/\\]/).pop() ?? filename;
  }

  gradeLabel(grade: string | null): string {
    if (grade === 'AssocProf') { return 'Associate Professor'; }
    if (grade === 'Professor') { return 'Professor'; }
    return '—';
  }

  viewFile(att: PubDocuAttachment): void {
    this.dialog.open(FileViewerDialogComponent, {
      width: '95vw',
      height: '95vh',
      data: { documastId: att.documast_id, filename: att.filename, title: att.DocType },
    });
  }

  approve(rec: PublicationRecord): void {
    this.processing[rec.Pubc_id] = true;
    this.service.authorizePublication({ Pubc_id: rec.Pubc_id, Decision: 'A', RejReason: '' }).subscribe({
      next: () => {
        this.toast.show(`Approved publication for ${rec.Empnm}`, { variant: 'success' });
        this.updateLocal(rec.Pubc_id, { Auth_Status: 'A', AuthDt: new Date().toISOString(), RejReason: '' });
        delete this.processing[rec.Pubc_id];
      },
      error: (err) => {
        this.toast.show(err?.error || 'Approval failed', { variant: 'error' });
        delete this.processing[rec.Pubc_id];
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

  confirmReject(rec: PublicationRecord): void {
    if (!this.rejReason.trim()) {
      this.toast.show('Please enter a rejection reason', { variant: 'warning' });
      return;
    }
    this.processing[rec.Pubc_id] = true;
    const reason = this.rejReason;
    this.service.authorizePublication({ Pubc_id: rec.Pubc_id, Decision: 'R', RejReason: reason }).subscribe({
      next: () => {
        this.toast.show(`Rejected publication for ${rec.Empnm}`, { variant: 'info' });
        this.rejectingId = null;
        this.rejReason = '';
        this.updateLocal(rec.Pubc_id, { Auth_Status: 'R', RejReason: reason, AuthDt: new Date().toISOString() });
        delete this.processing[rec.Pubc_id];
      },
      error: (err) => {
        this.toast.show(err?.error || 'Rejection failed', { variant: 'error' });
        delete this.processing[rec.Pubc_id];
      },
    });
  }

  private updateLocal(id: number, changes: Partial<PublicationRecord>): void {
    const idx = this.allRecords.findIndex(r => r.Pubc_id === id);
    if (idx !== -1) {
      this.allRecords[idx] = { ...this.allRecords[idx], ...changes };
    }
  }
}

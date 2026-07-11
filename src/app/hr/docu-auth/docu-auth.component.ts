import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { DocuAuthService, DocuRecord, SubcodeItem } from './docu-auth.service';
import { ToastService } from '../../core/toast/toast.service';
import { FileViewerDialogComponent } from '../../shared/file-viewer-dialog/file-viewer-dialog.component';
import { AutocompleteComponent, AcItem } from '../../shared/autocomplete/autocomplete.component';
import { RightsService } from '../../auth/rights.service';
import { RightModal } from '../../auth/rights.models';

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
  docTypes: SubcodeItem[] = [];
  loading = false;
  processing: Record<number, boolean> = {};
  rights: RightModal = { View: false, Add: false, Edit: false, Delete: false, Auth1: false, Auth2: false, Sp1: false, Sp2: false };

  activeTab: TabId = 'P';

  // Employee autocomplete
  empItems: AcItem[] = [];
  selectedEmpId: number | null = null;

  // Inline forms
  rejectingId: number | null = null;
  rejReason = '';
  resubmitId: number | null = null;
  resubmitReason = '';

  // Upload New Document panel
  showUpload = false;
  uploading = false;
  uploadEmpId: number | null = null;
  uploadSubcodeId = 0;
  uploadDescription = '';
  uploadPageNo: number | null = null;
  uploadFile: File | null = null;

  search = {
    empid: '',
    empnm: '',
    docType: '',
    source: '',
    reason: '',
  };

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
    private rightsService: RightsService,
  ) {}

  ngOnInit(): void {
    // Cache is warm: rightsGuard has already fetched 'HR|DocuAuth' before activation
    this.rights = this.rightsService.getRightsModal('HR', 'DocuAuth');
    this.loadAll();
    this.service.getDocumentTypes().subscribe({
      next: (data) => (this.docTypes = data),
      error: () => this.toast.show('Failed to load document types', { variant: 'error' }),
    });
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
    const list = this.activeTab === 'ALL' ? this.allRecords : this.allRecords.filter(r => r.auth_status === this.activeTab);
    return list.filter(r =>
      (!this.search.empid || String(r.empid ?? '').includes(this.search.empid.trim())) &&
      (!this.search.empnm || (r.empnm ?? '').toLowerCase().includes(this.search.empnm.toLowerCase())) &&
      (!this.search.docType || (r.DocType ?? '').toLowerCase().includes(this.search.docType.toLowerCase())) &&
      (!this.search.source || this.sourceLabel(r).toLowerCase().includes(this.search.source.toLowerCase())) &&
      (!this.search.reason || (r.rejreason ?? '').toLowerCase().includes(this.search.reason.toLowerCase())),
    );
  }

  sourceLabel(rec: DocuRecord): string {
    return rec.selfupload === 'Y' ? 'Self' : 'HR';
  }

  canAuthorize(rec: DocuRecord): boolean {
    return rec.auth_status === 'P' && rec.selfupload === 'Y';
  }

  // A resubmit request can be sent for any self-uploaded document that hasn't
  // already been requested ('S') or superseded ('I') — including Approved/Rejected.
  canResubmitRequest(rec: DocuRecord): boolean {
    return rec.selfupload === 'Y' && rec.auth_status !== 'S' && rec.auth_status !== 'I';
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

  // A replaced document is auto-approved (no employee/HR review needed), so it's available
  // for any active record — including Approved ones — but not for an already-Superseded one.
  canReplace(rec: DocuRecord): boolean {
    return rec.auth_status !== 'I';
  }

  startReplace(rec: DocuRecord): void {
    const dt = this.docTypes.find(t => t.SubCode_id === rec.subcode_id);
    const ref = this.dialog.open(FileViewerDialogComponent, {
      width: '95vw',
      height: '95vh',
      data: {
        documastId: rec.documast_id,
        filename: rec.filename,
        title: `${rec.empnm} — ${rec.DocType}`,
        openResubmit: true,
        resubmit: {
          parentDocuId: rec.documast_id,
          subcodeId: rec.subcode_id,
          targetEmpid: rec.empid,
          allowedExtensions: dt ? dt.AllowedExt : null,
          multiPageAllowed: dt?.MultiPageAllowed ?? false,
          minFileSizeKb: dt?.MinFileSizeKb ?? null,
          maxFileSizeKb: dt?.MaxFileSizeKb ?? null,
          defaultDescription: rec.description || '',
          defaultPageNo: null,
        },
      },
    });
    ref.closed.subscribe(result => { if (result === 'resubmitted') { this.loadAll(); } });
  }

  // --- Upload New Document ---
  toggleUpload(): void {
    this.showUpload = !this.showUpload;
    if (!this.showUpload) { this.resetUploadForm(); }
  }

  onUploadFilePick(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (file) { this.uploadFile = file; }
    input.value = '';
  }

  isUploadMultiPageAllowed(): boolean {
    return this.docTypes.find(t => t.SubCode_id === this.uploadSubcodeId)?.MultiPageAllowed ?? false;
  }

  submitUpload(): void {
    if (!this.uploadEmpId) { this.toast.show('Select an employee', { variant: 'warning' }); return; }
    if (!this.uploadSubcodeId) { this.toast.show('Select a document type', { variant: 'warning' }); return; }
    if (!this.uploadFile) { this.toast.show('Choose a file to upload', { variant: 'warning' }); return; }

    this.uploading = true;
    this.service.uploadDocument(this.uploadEmpId, this.uploadSubcodeId, this.uploadDescription, this.uploadPageNo, this.uploadFile).subscribe({
      next: () => {
        this.toast.show('Document uploaded and approved', { variant: 'success' });
        this.uploading = false;
        this.showUpload = false;
        this.resetUploadForm();
        this.loadAll();
      },
      error: (err) => {
        this.toast.show(err?.error || 'Upload failed', { variant: 'error' });
        this.uploading = false;
      },
    });
  }

  private resetUploadForm(): void {
    this.uploadEmpId = null;
    this.uploadSubcodeId = 0;
    this.uploadDescription = '';
    this.uploadPageNo = null;
    this.uploadFile = null;
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

  deleteRecord(rec: DocuRecord): void {
    if (!confirm(`Delete this ${rec.DocType} document for ${rec.empnm}? This cannot be undone.`)) { return; }
    this.processing[rec.documast_id] = true;
    this.service.deleteDocument(rec.documast_id).subscribe({
      next: () => {
        this.toast.show('Document deleted', { variant: 'success' });
        this.allRecords = this.allRecords.filter(r => r.documast_id !== rec.documast_id);
        delete this.processing[rec.documast_id];
      },
      error: (err) => {
        this.toast.show(err?.error || 'Delete failed', { variant: 'error' });
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

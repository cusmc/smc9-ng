import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { ProfileDocumentsService, MyDocuRecord, SubcodeItem } from './profile-documents.service';
import { ToastService } from '../../core/toast/toast.service';
import { FileViewerDialogComponent } from '../../shared/file-viewer-dialog/file-viewer-dialog.component';

export interface PendingFile {
  file: File;
  subcodeId: number;
  description: string;
  pageNo: number | null;
}

type TabId = 'P' | 'A' | 'R' | 'S' | 'ALL';

interface Tab {
  id: TabId;
  label: string;
  badgeClass: string;
  activeClass: string;
}

@Component({
  selector: 'app-profile-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-documents.component.html',
})
export class ProfileDocumentsComponent implements OnInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  documents: MyDocuRecord[] = [];
  docTypes: SubcodeItem[] = [];
  loading = false;
  uploading = false;

  pendingFiles: PendingFile[] = [];
  isDragOver = false;
  showGuidelines = false;
  uploadProgress = 0;

  activeTab: TabId = 'ALL';

  search = {
    docType: '',
    source: '',
    status: '',
    remark: '',
  };

  readonly tabs: Tab[] = [
    { id: 'P',   label: 'Pending',            badgeClass: 'bg-amber-100 text-amber-700', activeClass: 'border-amber-500 text-amber-700' },
    { id: 'A',   label: 'Approved',           badgeClass: 'bg-green-100 text-green-700', activeClass: 'border-green-600 text-green-700' },
    { id: 'R',   label: 'Rejected',           badgeClass: 'bg-red-100 text-red-700',     activeClass: 'border-red-500 text-red-700' },
    { id: 'S',   label: 'Resubmit Requested', badgeClass: 'bg-teal-100 text-teal-700',   activeClass: 'border-teal-500 text-teal-700' },
    { id: 'ALL', label: 'All',                badgeClass: 'bg-slate-100 text-slate-600', activeClass: 'border-slate-500 text-slate-600' },
  ];

  constructor(
    private service: ProfileDocumentsService,
    private toast: ToastService,
    private dialog: Dialog,
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
    this.service.getDocumentTypes().subscribe({
      next: (data) => (this.docTypes = data.filter(t => !t.HrOnly)),
      error: () => this.toast.show('Failed to load document types', { variant: 'error' }),
    });
  }

  loadDocuments(): void {
    this.loading = true;
    this.service.getMyDocuments().subscribe({
      next: (data) => { this.documents = data; this.loading = false; },
      error: () => {
        this.toast.show('Failed to load documents', { variant: 'error' });
        this.loading = false;
      },
    });
  }

  // ── Drop zone ──────────────────────────────────────────────
  onDragOver(e: DragEvent): void { e.preventDefault(); this.isDragOver = true; }
  onDragLeave(): void { this.isDragOver = false; }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragOver = false;
    if (e.dataTransfer?.files) { this.addFiles(e.dataTransfer.files); }
  }

  openFilePicker(): void { this.fileInputRef.nativeElement.click(); }

  onFilePick(e: Event): void {
    const files = (e.target as HTMLInputElement).files;
    if (files) { this.addFiles(files); }
    (e.target as HTMLInputElement).value = '';
  }

  addFiles(list: FileList): void {
    const maxMb = 10;
    Array.from(list).forEach(f => {
      if (f.size > maxMb * 1024 * 1024) {
        this.toast.show(`${f.name} exceeds ${maxMb} MB limit`, { variant: 'warning' });
        return;
      }
      this.pendingFiles.push({ file: f, subcodeId: 0, description: '', pageNo: null });
    });
  }

  removePending(i: number): void { this.pendingFiles.splice(i, 1); }

  typeError(p: PendingFile): string | null {
    if (p.subcodeId === 0) { return null; }
    const dt = this.docTypes.find(t => t.SubCode_id === p.subcodeId);
    if (!dt || !dt.AllowedExt) { return null; }
    const basename = (p.file.name || '').split(/[/\\]/).pop() ?? '';
    const ext = (basename.split('.').pop() ?? '').toLowerCase();
    const allowed = dt.AllowedExt.split(',').map(x => x.trim().toLowerCase());
    if (!allowed.includes(ext)) {
      return 'Allowed: ' + dt.AllowedExt;
    }
    return null;
  }

  isMultiPageAllowed(p: PendingFile): boolean {
    const dt = this.docTypes.find(t => t.SubCode_id === p.subcodeId);
    return dt?.MultiPageAllowed ?? false;
  }

  sizeError(p: PendingFile): string | null {
    if (p.subcodeId === 0) { return null; }
    const dt = this.docTypes.find(t => t.SubCode_id === p.subcodeId);
    if (!dt) { return null; }
    const minKb = dt.MinFileSizeKb;
    const maxKb = dt.MaxFileSizeKb;
    if (!minKb && !maxKb) { return null; }
    const sizeKb = p.file.size / 1024;
    if (minKb && sizeKb < minKb) {
      return `File must be at least ${minKb} KB for this document type`;
    }
    if (maxKb && sizeKb > maxKb) {
      const maxLabel = maxKb >= 1024 ? `${(maxKb / 1024).toFixed(1)} MB` : `${maxKb} KB`;
      return `File must not exceed ${maxLabel} for this document type`;
    }
    return null;
  }

  submitAll(): void {
    if (this.pendingFiles.length === 0) { return; }
    const invalid = this.pendingFiles.some(p => p.subcodeId === 0);
    if (invalid) {
      this.toast.show('Please select a document type for every file', { variant: 'warning' });
      return;
    }
    const typeInvalid = this.pendingFiles.some(p => this.typeError(p) !== null);
    if (typeInvalid) {
      this.toast.show('One or more files have an invalid type for the selected document category', { variant: 'warning' });
      return;
    }
    const sizeInvalid = this.pendingFiles.some(p => this.sizeError(p) !== null);
    if (sizeInvalid) {
      this.toast.show('One or more files do not meet the size requirements for the selected document category', { variant: 'warning' });
      return;
    }
    this.uploading = true;
    this.uploadProgress = 0;
    let done = 0;
    const total = this.pendingFiles.length;
    let hadError = false;

    const uploadNext = (index: number) => {
      if (index >= total) {
        this.uploading = false;
        this.pendingFiles = [];
        if (!hadError) {
          this.toast.show(`${total} document(s) uploaded. Awaiting HR approval.`, { variant: 'success' });
        }
        this.loadDocuments();
        return;
      }
      const p = this.pendingFiles[index];
      this.service.uploadDocument(p.subcodeId, p.description, p.pageNo, p.file).subscribe({
        next: () => {
          done++;
          this.uploadProgress = Math.round((done / total) * 100);
          uploadNext(index + 1);
        },
        error: (err) => {
          hadError = true;
          this.toast.show(`Failed to upload ${p.file.name}: ${err?.error || 'error'}`, { variant: 'error' });
          done++;
          this.uploadProgress = Math.round((done / total) * 100);
          uploadNext(index + 1);
        },
      });
    };

    uploadNext(0);
  }

  // ── Document list ───────────────────────────────────────────
  get filteredDocuments(): MyDocuRecord[] {
    let list = this.documents;
    if (this.activeTab !== 'ALL') {
      list = list.filter(d => d.auth_status === this.activeTab);
    }
    return list.filter(d =>
      (!this.search.docType || (d.DocType ?? '').toLowerCase().includes(this.search.docType.toLowerCase())) &&
      (!this.search.source || this.sourceLabel(d).toLowerCase().includes(this.search.source.toLowerCase())) &&
      (!this.search.status || this.statusLabel(d.auth_status).toLowerCase().includes(this.search.status.toLowerCase())) &&
      (!this.search.remark || (d.rej_reason ?? '').toLowerCase().includes(this.search.remark.toLowerCase())),
    );
  }

  sourceLabel(doc: MyDocuRecord): string {
    return doc.selfupload === 'Y' ? 'Self' : 'HR';
  }

  tabCount(id: TabId): number {
    if (id === 'ALL') return this.documents.length;
    return this.documents.filter(d => d.auth_status === id).length;
  }

  setTab(id: TabId): void {
    this.activeTab = id;
  }

  viewFile(doc: MyDocuRecord, openResubmit = false): void {
    const dt = this.docTypes.find(t => t.SubCode_id === doc.subcode_id);
    const ref = this.dialog.open(FileViewerDialogComponent, {
      width: '95vw',
      height: '95vh',
      data: {
        documastId: doc.documast_id,
        filename: doc.filename,
        title: doc.DocType,
        openResubmit,
        resubmit: this.canResubmit(doc.auth_status) ? {
          parentDocuId: doc.documast_id,
          subcodeId: doc.subcode_id,
          allowedExtensions: dt ? dt.AllowedExt : null,
          multiPageAllowed: dt?.MultiPageAllowed ?? false,
          minFileSizeKb: dt?.MinFileSizeKb ?? null,
          maxFileSizeKb: dt?.MaxFileSizeKb ?? null,
          defaultDescription: doc.description || '',
          defaultPageNo: (doc.page_no !== null && doc.page_no !== undefined) ? doc.page_no : null,
        } : undefined,
      },
    });
    ref.closed.subscribe(result => { if (result === 'resubmitted') { this.loadDocuments(); } });
  }

  resubmitFile(doc: MyDocuRecord): void {
    this.viewFile(doc, true);
  }

  statusLabel(status: string | null): string {
    switch (status) {
      case 'A': return 'Approved';
      case 'P': return 'Pending';
      case 'R': return 'Rejected';
      case 'S': return 'Resubmit Required';
      case 'I': return 'Superseded';
      default:  return 'Active';
    }
  }

  statusClass(status: string | null): string {
    switch (status) {
      case 'A': return 'bg-green-100 text-green-700';
      case 'P': return 'bg-amber-100 text-amber-700';
      case 'R': return 'bg-red-100 text-red-600';
      case 'S': return 'bg-teal-100 text-teal-700';
      case 'I': return 'bg-gray-100 text-gray-400';
      default:  return 'bg-green-100 text-green-700';
    }
  }

  statusIcon(status: string | null): string {
    switch (status) {
      case 'A': return 'check_circle';
      case 'P': return 'schedule';
      case 'R': return 'cancel';
      case 'S': return 'replay';
      case 'I': return 'history';
      default:  return 'verified';
    }
  }

  canView(status: string | null): boolean {
    return status !== 'I';
  }

  canResubmit(status: string | null): boolean {
    return status !== 'I';
  }

  fileIcon(filename: string): string {
    const basename = (filename || '').split(/[/\\]/).pop() ?? '';
    const ext = basename.split('.').pop()?.toLowerCase() ?? '';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) { return 'image'; }
    if (ext === 'pdf') { return 'picture_as_pdf'; }
    if (['doc', 'docx'].includes(ext)) { return 'description'; }
    if (['xls', 'xlsx'].includes(ext)) { return 'table_chart'; }
    return 'insert_drive_file';
  }
}

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

  constructor(
    private service: ProfileDocumentsService,
    private toast: ToastService,
    private dialog: Dialog,
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
    this.service.getDocumentTypes().subscribe({
      next: (data) => (this.docTypes = data),
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
    if (!dt || !dt.String2) { return null; }
    const basename = (p.file.name || '').split(/[/\\]/).pop() ?? '';
    const ext = (basename.split('.').pop() ?? '').toLowerCase();
    const allowed = dt.String2.split(',').map(x => x.trim().toLowerCase());
    if (!allowed.includes(ext)) {
      return 'Allowed: ' + dt.String2;
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
  viewFile(doc: MyDocuRecord): void {
    const dt = this.docTypes.find(t => t.SubCode_id === doc.subcode_id);
    const ref = this.dialog.open(FileViewerDialogComponent, {
      width: '95vw',
      height: '95vh',
      data: {
        documastId: doc.documast_id,
        filename: doc.filename,
        title: doc.DocType,
        resubmit: this.canResubmit(doc.auth_status) ? {
          parentDocuId: doc.documast_id,
          subcodeId: doc.subcode_id,
          allowedExtensions: dt ? dt.String2 : null,
          defaultDescription: doc.description || '',
          defaultPageNo: (doc.page_no !== null && doc.page_no !== undefined) ? doc.page_no : null,
        } : undefined,
      },
    });
    ref.closed.subscribe(result => { if (result === 'resubmitted') { this.loadDocuments(); } });
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
    return status === 'A' || status === 'R' || status === 'S';
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

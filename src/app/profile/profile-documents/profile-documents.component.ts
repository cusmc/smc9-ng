import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { ProfileDocumentsService, MyDocuRecord, SubcodeItem } from './profile-documents.service';
import { ToastService } from '../../core/toast/toast.service';
import { FileViewerDialogComponent } from '../../shared/file-viewer-dialog/file-viewer-dialog.component';

@Component({
  selector: 'app-profile-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-documents.component.html',
})
export class ProfileDocumentsComponent implements OnInit {
  documents: MyDocuRecord[] = [];
  docTypes: SubcodeItem[] = [];
  loading = false;
  uploading = false;

  selectedSubcodeId = 0;
  description = '';
  selectedFile: File | null = null;

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
      next: (data) => {
        this.documents = data;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Failed to load documents', { variant: 'error' });
        this.loading = false;
      },
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  upload(): void {
    if (!this.selectedSubcodeId) {
      this.toast.show('Please select a document type', { variant: 'warning' });
      return;
    }
    if (!this.selectedFile) {
      this.toast.show('Please select a file', { variant: 'warning' });
      return;
    }
    this.uploading = true;
    this.service.uploadDocument(this.selectedSubcodeId, this.description, this.selectedFile).subscribe({
      next: () => {
        this.toast.show('Document uploaded. Awaiting HR approval.', { variant: 'success' });
        this.selectedSubcodeId = 0;
        this.description = '';
        this.selectedFile = null;
        this.uploading = false;
        this.loadDocuments();
      },
      error: (err) => {
        this.toast.show(err?.error || 'Upload failed', { variant: 'error' });
        this.uploading = false;
      },
    });
  }

  viewFile(doc: MyDocuRecord): void {
    this.dialog.open(FileViewerDialogComponent, {
      data: { documastId: doc.documast_id, filename: doc.filename, title: doc.DocType },
    });
  }

  statusLabel(status: string | null): string {
    if (!status) return '';
    return status === 'A' ? 'Approved' : status === 'R' ? 'Rejected' : 'Pending';
  }

  statusClass(status: string | null): string {
    if (!status) return 'bg-gray-100 text-gray-500';
    return status === 'A' ? 'bg-green-100 text-green-700' : status === 'R' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700';
  }

  statusIcon(status: string | null): string {
    if (!status) return 'schedule';
    return status === 'A' ? 'check_circle' : status === 'R' ? 'cancel' : 'pending';
  }
}

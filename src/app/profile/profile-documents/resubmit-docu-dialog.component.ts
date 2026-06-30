import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ProfileDocumentsService, MyDocuRecord, SubcodeItem } from './profile-documents.service';
import { ToastService } from '../../core/toast/toast.service';

export interface ResubmitDialogData {
  doc: MyDocuRecord;
  docTypes: SubcodeItem[];
}

@Component({
  selector: 'app-resubmit-docu-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resubmit-docu-dialog.component.html',
})
export class ResubmitDocuDialogComponent implements OnInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  pickedFile: File | null = null;
  isDragOver = false;
  description = '';
  pageNo: number | null = null;
  uploading = false;

  constructor(
    private service: ProfileDocumentsService,
    private toast: ToastService,
    private dialogRef: DialogRef<boolean, ResubmitDocuDialogComponent>,
    @Inject(DIALOG_DATA) public data: ResubmitDialogData,
  ) {}

  ngOnInit(): void {
    this.description = this.data.doc.description || '';
    this.pageNo = this.data.doc.page_no ?? null;
  }

  onDragOver(e: DragEvent): void { e.preventDefault(); this.isDragOver = true; }
  onDragLeave(): void { this.isDragOver = false; }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragOver = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) { this.setFile(file); }
  }

  openPicker(): void { this.fileInputRef.nativeElement.click(); }

  onFilePick(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) { this.setFile(file); }
    (e.target as HTMLInputElement).value = '';
  }

  setFile(file: File): void {
    if (file.size > 10 * 1024 * 1024) {
      this.toast.show('File exceeds 10 MB limit', { variant: 'warning' });
      return;
    }
    this.pickedFile = file;
  }

  typeError(): string | null {
    if (!this.pickedFile) { return null; }
    const dt = this.data.docTypes.find(t => t.SubCode_id === this.data.doc.subcode_id);
    if (!dt || !dt.String2) { return null; }
    const ext = (this.pickedFile.name.split('.').pop() ?? '').toLowerCase();
    const allowed = dt.String2.split(',').map(x => x.trim().toLowerCase());
    if (!allowed.includes(ext)) { return 'Allowed: ' + dt.String2; }
    return null;
  }

  submit(): void {
    if (!this.pickedFile) {
      this.toast.show('Please select a file', { variant: 'warning' });
      return;
    }
    if (this.typeError()) {
      this.toast.show('File type is not allowed for this document category', { variant: 'warning' });
      return;
    }
    this.uploading = true;
    this.service.uploadDocument(
      this.data.doc.subcode_id,
      this.description,
      this.pageNo,
      this.pickedFile,
      this.data.doc.documast_id,
    ).subscribe({
      next: () => {
        this.toast.show('Document resubmitted. Awaiting HR approval.', { variant: 'success' });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.toast.show(err?.error || 'Upload failed', { variant: 'error' });
        this.uploading = false;
      },
    });
  }

  onClose(): void { this.dialogRef.close(false); }
}

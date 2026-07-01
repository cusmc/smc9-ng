import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../api.service';
import { ToastService } from '../../core/toast/toast.service';

export interface ResubmitContext {
  parentDocuId: number;
  subcodeId: number;
  allowedExtensions: string | null;
  defaultDescription: string;
  defaultPageNo: number | null;
}

export interface FileViewerData {
  documastId: number;
  filename: string;
  title?: string;
  resubmit?: ResubmitContext;
}

type RenderMode = 'image' | 'pdf' | 'other';

@Component({
  selector: 'app-file-viewer-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-viewer-dialog.component.html',
})
export class FileViewerDialogComponent implements OnInit, OnDestroy {
  @ViewChild('rsFileInput') rsFileInputRef!: ElementRef<HTMLInputElement>;

  loading = true;
  error: string | null = null;

  objectUrl: string | null = null;
  safeUrl: SafeResourceUrl | null = null;
  renderMode: RenderMode = 'other';

  zoomLevel = 1;
  rotation = 0;

  // Resubmit state
  showResubmit = false;
  rsFile: File | null = null;
  rsIsDragOver = false;
  rsDescription = '';
  rsPageNo: number | null = null;
  rsUploading = false;

  get imageTransform(): string {
    return `scale(${this.zoomLevel}) rotate(${this.rotation}deg)`;
  }

  get zoomPercent(): number {
    return Math.round(this.zoomLevel * 100);
  }

  zoomIn(): void    { this.zoomLevel = Math.min(this.zoomLevel + 0.25, 4); }
  zoomOut(): void   { this.zoomLevel = Math.max(this.zoomLevel - 0.25, 0.25); }
  resetView(): void { this.zoomLevel = 1; this.rotation = 0; }
  rotateCW(): void  { this.rotation = (this.rotation + 90) % 360; }
  rotateCCW(): void { this.rotation = (this.rotation - 90 + 360) % 360; }

  constructor(
    private api: ApiService,
    private sanitizer: DomSanitizer,
    private toast: ToastService,
    private dialogRef: DialogRef<string, FileViewerDialogComponent>,
    @Inject(DIALOG_DATA) public data: FileViewerData,
  ) {}

  ngOnInit(): void {
    this.renderMode = this.detectRenderMode(this.data.filename);

    if (this.data.resubmit) {
      this.rsDescription = this.data.resubmit.defaultDescription;
      this.rsPageNo = this.data.resubmit.defaultPageNo;
    }

    this.api.getBlob('/api/HR/EmpmastsAPI/ViewDocuFile', { id: this.data.documastId }).subscribe({
      next: (blob) => {
        this.objectUrl = URL.createObjectURL(blob);
        // Positively confirm image or PDF from Content-Type; for everything else keep
        // the filename-based guess so an unexpected server MIME (e.g. text/html from an
        // IIS error page) doesn't silently override a correct filename-derived mode.
        const mime = (blob.type || '').toLowerCase();
        if (mime.startsWith('image/')) {
          this.renderMode = 'image';
        } else if (mime === 'application/pdf') {
          this.renderMode = 'pdf';
        }
        if (this.renderMode === 'pdf') {
          this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load file. Please try again.';
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
  }

  download(): void {
    if (!this.objectUrl) { return; }
    const a = document.createElement('a');
    a.href = this.objectUrl;
    a.download = this.data.filename;
    a.click();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  // ── Resubmit methods ──────────────────────────────────────

  rsTypeError(): string | null {
    if (!this.rsFile || !this.data.resubmit || !this.data.resubmit.allowedExtensions) { return null; }
    const ext = (this.rsFile.name.split('.').pop() || '').toLowerCase();
    const allowed = this.data.resubmit.allowedExtensions.split(',').map(function(x: string) { return x.trim().toLowerCase(); });
    if (allowed.indexOf(ext) === -1) { return 'Allowed: ' + this.data.resubmit.allowedExtensions; }
    return null;
  }

  rsSetFile(file: File): void {
    if (file.size > 10 * 1024 * 1024) {
      this.toast.show('File exceeds 10 MB limit', { variant: 'warning' });
      return;
    }
    this.rsFile = file;
  }

  rsOnDragOver(e: DragEvent): void { e.preventDefault(); this.rsIsDragOver = true; }
  rsOnDragLeave(): void { this.rsIsDragOver = false; }

  rsOnDrop(e: DragEvent): void {
    e.preventDefault();
    this.rsIsDragOver = false;
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) { this.rsSetFile(file); }
  }

  rsOpenPicker(): void { this.rsFileInputRef.nativeElement.click(); }

  rsOnFilePick(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (file) { this.rsSetFile(file); }
    input.value = '';
  }

  submitResubmit(): void {
    if (!this.rsFile || !this.data.resubmit) { return; }
    if (this.rsTypeError()) {
      this.toast.show('File type not allowed for this document category', { variant: 'warning' });
      return;
    }
    this.rsUploading = true;
    const formData = new FormData();
    formData.append('Data', JSON.stringify({
      Subcode_id: this.data.resubmit.subcodeId,
      Description: this.rsDescription,
      PageNo: this.rsPageNo,
      Parent_Docu_Id: this.data.resubmit.parentDocuId,
    }));
    formData.append('file', this.rsFile, this.rsFile.name);
    this.api.postFormData<any>('/api/HR/EmpmastsAPI/SelfDocuUpload', formData).subscribe({
      next: () => {
        this.toast.show('Document resubmitted. Awaiting HR approval.', { variant: 'success' });
        this.dialogRef.close('resubmitted');
      },
      error: (err: any) => {
        this.toast.show((err && err.error) || 'Upload failed', { variant: 'error' });
        this.rsUploading = false;
      },
    });
  }

  private detectRenderMode(filename: string): RenderMode {
    // Strip path separators first — legacy DB rows store e.g. "202718\X3.JPG"
    const basename = (filename || '').split(/[/\\]/).pop() || '';
    const ext = (basename.split('.').pop() || '').toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].indexOf(ext) !== -1) { return 'image'; }
    if (ext === 'pdf') { return 'pdf'; }
    return 'other';
  }
}

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
  multiPageAllowed: boolean;
  minFileSizeKb: number | null;
  maxFileSizeKb: number | null;
  defaultDescription: string;
  defaultPageNo: number | null;
}

export interface FileViewerData {
  documastId: number;
  filename: string;
  title?: string;
  resubmit?: ResubmitContext;
  openResubmit?: boolean;
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

  get zoomPercent(): number {
    return Math.round(this.zoomLevel * 100);
  }

  get fileTypeLabel(): string {
    const ext = this.fileExt();
    const labels: Record<string, string> = {
      doc: 'Word Document', docx: 'Word Document',
      xls: 'Excel Spreadsheet', xlsx: 'Excel Spreadsheet', csv: 'CSV File',
      ppt: 'PowerPoint Presentation', pptx: 'PowerPoint Presentation',
      txt: 'Text File', mp4: 'Video File',
    };
    return labels[ext] ?? 'This file';
  }

  get fileTypeIcon(): string {
    const ext = this.fileExt();
    if (['doc', 'docx'].includes(ext)) return 'description';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'table_chart';
    if (['ppt', 'pptx'].includes(ext)) return 'slideshow';
    if (ext === 'mp4') return 'videocam';
    return 'insert_drive_file';
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
      if (this.data.openResubmit) {
        this.showResubmit = true;
      }
    }

    this.api.getBlob('/api/HR/EmpmastsAPI/ViewDocuFile', { id: this.data.documastId }).subscribe({
      next: (blob) => {
        this.objectUrl = URL.createObjectURL(blob);
        const mime = (blob.type || '').toLowerCase();
        if (mime.startsWith('image/')) {
          this.renderMode = 'image';
          this.loading = false;
        } else if (mime === 'application/pdf') {
          this.renderMode = 'pdf';
          this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);
          this.loading = false;
        } else {
          // MIME unknown (octet-stream, IIS error HTML, etc.) — inspect magic bytes
          const reader = new FileReader();
          reader.onload = (e) => {
            const arr = new Uint8Array(e.target!.result as ArrayBuffer);
            if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF) {
              this.renderMode = 'image'; // JPEG
            } else if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47) {
              this.renderMode = 'image'; // PNG
            } else if (arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46) {
              this.renderMode = 'image'; // GIF
            } else if (arr[0] === 0x42 && arr[1] === 0x4D) {
              this.renderMode = 'image'; // BMP
            } else if (arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46 &&
                       arr[8] === 0x57 && arr[9] === 0x45 && arr[10] === 0x42 && arr[11] === 0x50) {
              this.renderMode = 'image'; // WEBP
            } else if (arr[0] === 0x25 && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46) {
              this.renderMode = 'pdf'; // %PDF
              this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl!);
            }
            // else: filename-based renderMode (set at top of ngOnInit) stays
            this.loading = false;
          };
          reader.onerror = () => { this.loading = false; };
          reader.readAsArrayBuffer(blob.slice(0, 12));
        }
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
    a.download = (this.data.filename || '').trim();
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

  rsSizeError(): string | null {
    if (!this.rsFile || !this.data.resubmit) { return null; }
    const minKb = this.data.resubmit.minFileSizeKb;
    const maxKb = this.data.resubmit.maxFileSizeKb;
    if (!minKb && !maxKb) { return null; }
    const sizeKb = this.rsFile.size / 1024;
    if (minKb && sizeKb < minKb) {
      return `File must be at least ${minKb} KB for this document type`;
    }
    if (maxKb && sizeKb > maxKb) {
      const maxLabel = maxKb >= 1024 ? `${(maxKb / 1024).toFixed(1)} MB` : `${maxKb} KB`;
      return `File must not exceed ${maxLabel} for this document type`;
    }
    return null;
  }

  get resubmitGuidelines(): string | null {
    const r = this.data.resubmit;
    if (!r) { return null; }
    const parts: string[] = [];
    if (r.allowedExtensions) {
      parts.push(`Allowed: ${r.allowedExtensions}`);
    }
    if (r.minFileSizeKb || r.maxFileSizeKb) {
      const minLabel = r.minFileSizeKb ? `${r.minFileSizeKb} KB` : '0 KB';
      const maxLabel = r.maxFileSizeKb
        ? (r.maxFileSizeKb >= 1024 ? `${(r.maxFileSizeKb / 1024).toFixed(1)} MB` : `${r.maxFileSizeKb} KB`)
        : null;
      parts.push(maxLabel ? `Size: ${minLabel} – ${maxLabel}` : `Size: min ${minLabel}`);
    }
    parts.push(r.multiPageAllowed ? 'Multiple pages allowed' : 'Single page only');
    return parts.join(' • ');
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
    const sizeErr = this.rsSizeError();
    if (sizeErr) {
      this.toast.show(sizeErr, { variant: 'warning' });
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

  private fileExt(): string {
    const basename = (this.data.filename || '').split(/[/\\]/).pop() || '';
    return (basename.split('.').pop() || '').toLowerCase();
  }

  private detectRenderMode(filename: string): RenderMode {
    const basename = (filename || '').split(/[/\\]/).pop() || '';
    const ext = (basename.split('.').pop() || '').toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) { return 'image'; }
    if (ext === 'pdf') { return 'pdf'; }
    return 'other';
  }
}

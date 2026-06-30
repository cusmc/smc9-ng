import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../api.service';

export interface FileViewerData {
  documastId: number;
  filename: string;
  title?: string;
}

type RenderMode = 'image' | 'pdf' | 'other';

@Component({
  selector: 'app-file-viewer-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-viewer-dialog.component.html',
})
export class FileViewerDialogComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;

  objectUrl: string | null = null;
  safeUrl: SafeResourceUrl | null = null;
  renderMode: RenderMode = 'other';

  zoomLevel = 1;
  rotation = 0;

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
    private dialogRef: DialogRef<void, FileViewerDialogComponent>,
    @Inject(DIALOG_DATA) public data: FileViewerData,
  ) {}

  ngOnInit(): void {
    this.renderMode = this.detectRenderMode(this.data.filename);

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
    if (!this.objectUrl) return;
    const a = document.createElement('a');
    a.href = this.objectUrl;
    a.download = this.data.filename;
    a.click();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  private detectRenderMode(filename: string): RenderMode {
    // Strip path separators first — legacy DB rows store e.g. "202718\X3.JPG"
    const basename = (filename || '').split(/[/\\]/).pop() ?? '';
    const ext = basename.split('.').pop()?.toLowerCase() ?? '';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) { return 'image'; }
    if (ext === 'pdf') { return 'pdf'; }
    return 'other';
  }
}

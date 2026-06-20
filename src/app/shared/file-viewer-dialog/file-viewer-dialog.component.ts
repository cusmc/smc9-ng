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
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    return 'other';
  }
}

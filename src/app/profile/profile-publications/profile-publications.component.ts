import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import {
  ProfilePublicationsService, MyPublication, PubDocType, MyPubAttachment, GRADE_DOC_TYPE_VALS,
} from './profile-publications.service';
import { ToastService } from '../../core/toast/toast.service';
import { FileViewerDialogComponent } from '../../shared/file-viewer-dialog/file-viewer-dialog.component';

interface PendingFile {
  file: File;
  description: string;
}

@Component({
  selector: 'app-profile-publications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-publications.component.html',
})
export class ProfilePublicationsComponent implements OnInit {
  publications: MyPublication[] = [];
  attachments: MyPubAttachment[] = [];
  docTypes: PubDocType[] = [];

  loading = false;
  saving = false;
  uploading = false;

  // Pubc_id of the row currently expanded; 0 while composing a brand-new entry
  // that hasn't been saved yet, null when nothing is expanded.
  expandedId: number | null = null;
  draft: Partial<MyPublication> = {};
  pendingFiles: PendingFile[] = [];
  isDragOver = false;

  constructor(
    private service: ProfilePublicationsService,
    private toast: ToastService,
    private dialog: Dialog,
  ) {}

  ngOnInit(): void {
    this.loadAll();
    this.service.getDocumentTypes().subscribe({
      next: (data) => (this.docTypes = data.filter(t => !t.HrOnly)),
      error: () => this.toast.show('Failed to load document types', { variant: 'error' }),
    });
  }

  loadAll(): void {
    this.loading = true;
    this.service.getMyPublications().subscribe({
      next: (data) => { this.publications = data; this.loading = false; },
      error: () => {
        this.toast.show('Failed to load your publications', { variant: 'error' });
        this.loading = false;
      },
    });
    this.service.getMyAttachments().subscribe({
      next: (data) => (this.attachments = data),
      error: () => this.toast.show('Failed to load attachments', { variant: 'error' }),
    });
  }

  // ── Row expand / draft editing ──────────────────────────────
  startAdd(): void {
    this.expandedId = 0;
    this.draft = {
      Pubc_id: 0,
      Pubc_dt: new Date().toISOString().slice(0, 10),
      Pubc_tp: '',
      Pubc_nm: '',
      Used_Promotion: 'N',
      Promotion_Grade: null,
    };
    this.pendingFiles = [];
  }

  toggleRow(pub: MyPublication): void {
    if (this.expandedId === pub.Pubc_id) {
      this.expandedId = null;
      return;
    }
    this.expandedId = pub.Pubc_id;
    this.draft = {
      ...pub,
      Pubc_dt: pub.Pubc_dt ? pub.Pubc_dt.slice(0, 10) : '',
    };
    this.pendingFiles = [];
  }

  cancelExpanded(): void {
    this.expandedId = null;
    this.pendingFiles = [];
  }

  setPromotion(used: boolean): void {
    this.draft.Used_Promotion = used ? 'Y' : 'N';
    if (!used) { this.draft.Promotion_Grade = null; }
  }

  selectGrade(grade: string): void {
    this.draft.Promotion_Grade = grade;
  }

  canSave(): boolean {
    if (!this.draft.Pubc_dt || !this.draft.Pubc_tp || !this.draft.Pubc_nm) { return false; }
    if (this.draft.Used_Promotion === 'Y' && !this.draft.Promotion_Grade) { return false; }
    return true;
  }

  saveDraft(): void {
    if (!this.canSave()) {
      this.toast.show('Please fill in date, type, title, and a promotion grade if applicable', { variant: 'warning' });
      return;
    }
    this.saving = true;
    this.service.saveMyPublication(this.draft).subscribe({
      next: (id) => {
        this.saving = false;
        this.toast.show('Publication saved. Awaiting HR approval.', { variant: 'success' });
        this.expandedId = id;
        this.draft.Pubc_id = id;
        this.loadAll();
      },
      error: (err) => {
        this.saving = false;
        this.toast.show(err?.error || 'Failed to save publication', { variant: 'error' });
      },
    });
  }

  deletePublication(pub: Partial<MyPublication>): void {
    if (!pub.Pubc_id) { return; }
    if (!confirm(`Delete "${pub.Pubc_nm}"? This cannot be undone.`)) { return; }
    const pubcId = pub.Pubc_id;
    this.service.deleteMyPublication(pubcId).subscribe({
      next: () => {
        this.toast.show('Publication deleted', { variant: 'success' });
        if (this.expandedId === pubcId) { this.expandedId = null; }
        this.loadAll();
      },
      error: (err) => this.toast.show(err?.error || 'Failed to delete publication', { variant: 'error' }),
    });
  }

  // ── Attachments for the expanded row ────────────────────────
  attachmentsFor(pubcId: number | undefined): MyPubAttachment[] {
    if (!pubcId) { return []; }
    return this.attachments.filter(a => a.pubc_id === pubcId);
  }

  private resolveSubcodeId(): number | null {
    const grade = this.draft.Promotion_Grade;
    if (!grade) { return null; }
    const wantedVals = GRADE_DOC_TYPE_VALS[grade];
    const match = this.docTypes.find(t => t.vals === wantedVals);
    return match ? match.SubCode_id : null;
  }

  onDragOver(e: DragEvent): void { e.preventDefault(); this.isDragOver = true; }
  onDragLeave(): void { this.isDragOver = false; }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragOver = false;
    if (e.dataTransfer?.files) { this.addFiles(e.dataTransfer.files); }
  }

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
      this.pendingFiles.push({ file: f, description: '' });
    });
  }

  removePending(i: number): void { this.pendingFiles.splice(i, 1); }

  submitAttachments(): void {
    if (!this.draft.Pubc_id) {
      this.toast.show('Save the publication before attaching documents', { variant: 'warning' });
      return;
    }
    const subcodeId = this.resolveSubcodeId();
    if (!subcodeId) {
      this.toast.show('Select "Used for Promotion" and a grade before attaching proof documents', { variant: 'warning' });
      return;
    }
    if (this.pendingFiles.length === 0) { return; }

    this.uploading = true;
    const pubcId = this.draft.Pubc_id;
    let done = 0;
    const total = this.pendingFiles.length;

    const uploadNext = (index: number) => {
      if (index >= total) {
        this.uploading = false;
        this.pendingFiles = [];
        this.toast.show(`${total} file(s) attached`, { variant: 'success' });
        this.loadAll();
        return;
      }
      const p = this.pendingFiles[index];
      this.service.uploadAttachment(pubcId, subcodeId, p.description, p.file).subscribe({
        next: () => { done++; uploadNext(index + 1); },
        error: (err) => {
          this.toast.show(`Failed to attach ${p.file.name}: ${err?.error || 'error'}`, { variant: 'error' });
          done++;
          uploadNext(index + 1);
        },
      });
    };
    uploadNext(0);
  }

  viewAttachment(att: MyPubAttachment): void {
    this.dialog.open(FileViewerDialogComponent, {
      width: '95vw',
      height: '95vh',
      data: { documastId: att.documast_id, filename: att.filename, title: att.DocType },
    });
  }

  // ── Display helpers ─────────────────────────────────────────
  gradeLabel(grade: string | null): string {
    if (grade === 'AssocProf') { return 'Associate Professor'; }
    if (grade === 'Professor') { return 'Professor'; }
    return '—';
  }

  statusLabel(status: string | null): string {
    switch (status) {
      case 'A': return 'Approved';
      case 'P': return 'Pending';
      case 'R': return 'Rejected';
      default: return 'Pending';
    }
  }

  statusClass(status: string | null): string {
    switch (status) {
      case 'A': return 'bg-green-100 text-green-700';
      case 'R': return 'bg-red-100 text-red-600';
      default: return 'bg-amber-100 text-amber-700';
    }
  }

  statusIcon(status: string | null): string {
    switch (status) {
      case 'A': return 'check_circle';
      case 'R': return 'cancel';
      default: return 'schedule';
    }
  }

  baseName(filename: string): string {
    return (filename || '').split(/[/\\]/).pop() ?? filename;
  }

  fileIcon(filename: string): string {
    const basename = (filename || '').split(/[/\\]/).pop() ?? '';
    const ext = basename.split('.').pop()?.toLowerCase() ?? '';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) { return 'image'; }
    if (ext === 'pdf') { return 'picture_as_pdf'; }
    return 'insert_drive_file';
  }
}

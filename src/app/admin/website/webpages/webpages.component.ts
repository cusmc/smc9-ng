import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { WebpagesService } from './webpages.service';
import { Webpage } from './webpages.models';
import { WebpagesFormDialogComponent } from './webpages-form-dialog.component';
import { WebpagesHistoryDialogComponent } from './webpages-history-dialog.component';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-webpages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './webpages.component.html',
})
export class WebpagesComponent implements OnInit {
  items: Webpage[] = [];
  loading = false;
  currentPage = 1;
  readonly pageSize = 10;

  search = { id: '', site: '', page_nm: '', page_desc: '' };

  constructor(
    private service: WebpagesService,
    private dialog: Dialog,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (data) => { this.items = data; this.currentPage = 1; this.loading = false; },
      error: () => { this.toast.show('Error loading webpages', { variant: 'error', duration: 3000 }); this.loading = false; },
    });
  }

  get filtered(): Webpage[] {
    const { id, site, page_nm, page_desc } = this.search;
    return this.items.filter(x =>
      (!id       || String(x.Webpage_id).includes(id)) &&
      (!site     || (x.Site ?? '').toLowerCase().includes(site.toLowerCase())) &&
      (!page_nm  || (x.Page_nm ?? '').toLowerCase().includes(page_nm.toLowerCase())) &&
      (!page_desc|| (x.Page_desc ?? '').toLowerCase().includes(page_desc.toLowerCase())),
    );
  }

  get paged(): Webpage[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  truncate(text: string, max = 100): string {
    if (!text) return '';
    const plain = text.replace(/<[^>]*>/g, '');
    return plain.length > max ? plain.slice(0, max) + '…' : plain;
  }

  openAdd(): void {
    const ref = this.dialog.open(WebpagesFormDialogComponent, { width: '900px', data: null });
    ref.closed.subscribe(saved => { if (saved) this.load(); });
  }

  openEdit(item: Webpage): void {
    const ref = this.dialog.open(WebpagesFormDialogComponent, { width: '900px', data: item });
    ref.closed.subscribe(saved => { if (saved) this.load(); });
  }

  openHistory(item: Webpage): void {
    this.dialog.open(WebpagesHistoryDialogComponent, { width: '600px', data: item.Webpage_id });
  }
}

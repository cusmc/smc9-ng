import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';
import { ToastItem } from './toast.models';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="pointer-events-none fixed bottom-4 right-4 z-[1000] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
      aria-live="polite"
    >
      @for (t of toasts; track t.id) {
        <div
          class="pointer-events-auto flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg"
          [ngClass]="panelClass(t)"
          role="status"
        >
          <span class="flex-1 leading-snug">{{ t.message }}</span>
          <button
            type="button"
            class="shrink-0 rounded p-0.5 text-ink-muted hover:bg-black/5 hover:text-ink"
            (click)="dismiss(t.id)"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      }
    </div>
  `
})
export class ToastHostComponent {
  toasts: ToastItem[] = [];

  constructor(private readonly toast: ToastService) {
    this.toast.items.subscribe((items) => (this.toasts = items));
  }

  dismiss(id: string): void {
    this.toast.dismiss(id);
  }

  panelClass(t: ToastItem): Record<string, boolean> {
    return {
      'border-border bg-surface text-ink': t.variant === 'info',
      'border-border bg-success-bg text-success': t.variant === 'success',
      'border-border bg-error-bg text-error': t.variant === 'error'
    };
  }
}

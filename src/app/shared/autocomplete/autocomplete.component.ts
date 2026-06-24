import {
  Component, Input, forwardRef, ElementRef, HostListener, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface AcItem {
  id: number | string;
  nm: string;
}

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AutocompleteComponent),
    multi: true
  }],
  template: `
    <div class="ac-wrap">
      <input
        type="text"
        class="ac-input"
        [placeholder]="placeholder"
        [disabled]="isDisabled"
        [(ngModel)]="displayText"
        (ngModelChange)="onInputChange($event)"
        (focus)="onFocus()"
        autocomplete="off"
      />
      <span class="ac-clear" *ngIf="displayText && !isDisabled" (click)="clear()">&#10005;</span>
      <ul class="ac-dropdown" *ngIf="open && filtered.length > 0">
        <li *ngFor="let item of filtered" (mousedown)="select(item)">{{ item.nm }}</li>
      </ul>
      <div class="ac-no-results" *ngIf="open && displayText.length >= 2 && filtered.length === 0">
        No results
      </div>
    </div>
  `,
  styleUrls: ['./autocomplete.component.scss']
})
export class AutocompleteComponent implements ControlValueAccessor, OnChanges {
  @Input() items: AcItem[] = [];
  @Input() placeholder = 'Type to search…';

  displayText = '';
  filtered: AcItem[] = [];
  open = false;
  isDisabled = false;

  private selectedId: number | string | null = null;
  private onChange: (val: number | string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && this.selectedId != null) {
      this.syncDisplayFromId(this.selectedId);
    }
  }

  onInputChange(text: string): void {
    this.displayText = text;
    this.selectedId = null;
    this.onChange(null);
    const q = text.toLowerCase();
    this.filtered = text.length >= 2
      ? this.items.filter(i => i.nm.toLowerCase().includes(q)).slice(0, 50)
      : [];
    this.open = true;
  }

  onFocus(): void {
    if (this.displayText.length >= 2) {
      this.open = true;
    }
  }

  select(item: AcItem): void {
    this.displayText = item.nm;
    this.selectedId = item.id;
    this.open = false;
    this.filtered = [];
    this.onChange(item.id);
    this.onTouched();
  }

  clear(): void {
    this.displayText = '';
    this.selectedId = null;
    this.filtered = [];
    this.open = false;
    this.onChange(null);
    this.onTouched();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) {
      this.open = false;
    }
  }

  /* ControlValueAccessor */
  writeValue(val: number | string | null): void {
    this.selectedId = val;
    this.syncDisplayFromId(val);
  }

  registerOnChange(fn: (val: number | string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled = disabled;
  }

  private syncDisplayFromId(id: number | string | null): void {
    if (id == null) { this.displayText = ''; return; }
    const found = this.items.find(i => i.id == id);
    this.displayText = found ? found.nm : '';
  }
}

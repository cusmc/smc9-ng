import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Html5Qrcode } from 'html5-qrcode';
import { CanteenService, MealTypeItem, ScanResult } from './canteen.service';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-canteen-scan',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './canteen-scan.component.html',
})
export class CanteenScanComponent implements OnInit, OnDestroy {
  mealTypes: MealTypeItem[] = [];
  selectedSubcodeId: number | null = null;
  scanning = false;
  processing = false;
  scanResult: ScanResult | null = null;

  private html5Qrcode: Html5Qrcode | null = null;
  private lastToken: string | null = null;
  private readonly elementId = 'canteen-qr-reader';

  constructor(private service: CanteenService, private toast: ToastService) {}

  ngOnInit(): void {
    this.service.getMealTypes().subscribe({
      next: (types) => {
        this.mealTypes = types;
        this.selectedSubcodeId = this.defaultMealTypeId(types);
      },
      error: () => this.toast.show('Failed to load meal types', { variant: 'error' }),
    });
  }

  ngOnDestroy(): void {
    this.stopScan();
  }

  private defaultMealTypeId(types: MealTypeItem[]): number | null {
    const now = new Date();
    const hourDecimal = now.getHours() + now.getMinutes() / 60;
    const match = types.find(
      (t) => t.Ftime != null && t.Ttime != null && hourDecimal >= t.Ftime && hourDecimal <= t.Ttime,
    );
    const fallback = match || types[0];
    return fallback ? fallback.Subcode_id : null;
  }

  selectMealType(subcodeId: number): void {
    this.selectedSubcodeId = subcodeId;
  }

  startScan(): void {
    this.scanResult = null;
    this.lastToken = null;
    this.scanning = true;
    // Wait a tick so *ngIf renders the #canteen-qr-reader div before html5-qrcode attaches to it.
    setTimeout(() => this.initScanner(), 0);
  }

  private initScanner(): void {
    this.html5Qrcode = new Html5Qrcode(this.elementId);
    this.html5Qrcode
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText: string) => this.onScanSuccess(decodedText),
        () => {
          /* ignore per-frame decode misses */
        },
      )
      .catch(() => {
        this.toast.show('Unable to access camera. Check browser camera permissions.', { variant: 'error' });
        this.scanning = false;
      });
  }

  private onScanSuccess(decodedText: string): void {
    if (decodedText === this.lastToken) {
      return; // debounce repeat frames of the same code while the camera stream keeps running
    }
    this.lastToken = decodedText;
    this.stopScan();
    this.service.scanLookup(decodedText).subscribe({
      next: (result) => (this.scanResult = result),
      error: (err) => this.toast.show(err?.error || 'QR code not recognized', { variant: 'error' }),
    });
  }

  stopScan(): void {
    const scanner = this.html5Qrcode;
    this.html5Qrcode = null;
    this.scanning = false;
    if (scanner) {
      scanner
        .stop()
        .catch(() => {})
        .finally(() => scanner.clear());
    }
  }

  cancelConfirm(): void {
    this.scanResult = null;
    this.lastToken = null;
  }

  get selectedMealLabel(): string {
    const found = this.mealTypes.find((m) => m.Subcode_id === this.selectedSubcodeId);
    return found ? found.Vals : 'Meal';
  }

  chargeMeal(): void {
    if (!this.scanResult || !this.selectedSubcodeId) {
      return;
    }
    this.processing = true;
    this.service.recordMeal(this.scanResult.empid, this.selectedSubcodeId).subscribe({
      next: (txn) => {
        this.toast.show(
          `${this.selectedMealLabel} charged: Rs. ${txn.amount} to ${this.scanResult ? this.scanResult.empnm : ''}`,
          { variant: 'success' },
        );
        this.processing = false;
        this.scanResult = null;
        this.lastToken = null;
      },
      error: (err) => {
        this.toast.show(err?.error || 'Failed to record meal', { variant: 'error' });
        this.processing = false;
      },
    });
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Capacitor } from '@capacitor/core';
import { BarcodeFormat, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
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
  entryMethod: 'QR' | 'MANUAL' = 'QR';

  // Manual Empid fallback (lost/damaged ID card, or a QR that won't scan)
  showManualEntry = false;
  manualEmpId: number | null = null;
  manualLoading = false;

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

  // Picks the meal type whose Ftime-Ttime window contains the current time of
  // day. If the counter is between windows (e.g. the gap after breakfast),
  // falls back to whichever window is closest in time rather than an
  // arbitrary first item, so the pre-selection is always meaningful.
  private defaultMealTypeId(types: MealTypeItem[]): number | null {
    if (types.length === 0) {
      return null;
    }
    const now = new Date();
    const hourDecimal = now.getHours() + now.getMinutes() / 60;

    const withinWindow = types.find(
      (t) => t.Ftime != null && t.Ttime != null && hourDecimal >= t.Ftime && hourDecimal <= t.Ttime,
    );
    if (withinWindow) {
      return withinWindow.Subcode_id;
    }

    const timed = types.filter((t) => t.Ftime != null);
    if (timed.length === 0) {
      return types[0].Subcode_id;
    }
    const distance = (t: MealTypeItem): number => {
      const f = t.Ftime as number;
      const toStart = Math.abs(hourDecimal - f);
      return Math.min(toStart, 24 - toStart); // handles wrap past midnight
    };
    const nearest = timed.reduce((a, b) => (distance(a) <= distance(b) ? a : b));
    return nearest.Subcode_id;
  }

  // Re-picks the default meal type by current time - called whenever a scan/
  // lookup starts, so a counter left open across a meal-window boundary still
  // suggests the right meal rather than whatever was selected at page load.
  private refreshDefaultMealType(): void {
    if (this.mealTypes.length > 0) {
      this.selectedSubcodeId = this.defaultMealTypeId(this.mealTypes);
    }
  }

  selectMealType(subcodeId: number): void {
    this.selectedSubcodeId = subcodeId;
  }

  get isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  toggleManualEntry(): void {
    this.showManualEntry = !this.showManualEntry;
    this.manualEmpId = null;
    if (this.showManualEntry) {
      this.stopScan();
    }
  }

  lookupManualEmpId(): void {
    if (!this.manualEmpId) {
      this.toast.show('Enter an employee ID', { variant: 'warning' });
      return;
    }
    this.refreshDefaultMealType();
    this.manualLoading = true;
    this.service.lookupEmployee(this.manualEmpId).subscribe({
      next: (result) => {
        this.manualLoading = false;
        this.showManualEntry = false;
        this.applyLookupResult(result, 'MANUAL');
      },
      error: (err) => {
        this.manualLoading = false;
        this.toast.show(err?.error || 'Employee not found', { variant: 'error' });
      },
    });
  }

  // Shared by both entry paths: warns (but still allows charging with an
  // extra confirmation) if the resolved employee has resigned - RecordMeal
  // will refuse the charge server-side regardless, this is just an earlier,
  // clearer signal to counter staff before they try.
  private applyLookupResult(result: ScanResult, method: 'QR' | 'MANUAL'): void {
    this.entryMethod = method;
    this.scanResult = result;
    if (!result.IsActive) {
      this.toast.show(`${result.Empnm} has resigned and cannot use the canteen.`, { variant: 'error' });
    }
  }

  startScan(): void {
    this.scanResult = null;
    this.lastToken = null;
    this.refreshDefaultMealType();
    if (this.isNative) {
      this.startNativeScan();
    } else {
      this.startWebScan();
    }
  }

  // Native path (Capacitor APK build): ML Kit's one-shot scan() opens its own
  // full-screen native camera UI and resolves once a code is found - faster
  // and more reliable than decoding a <video> feed in a webview.
  private async startNativeScan(): Promise<void> {
    try {
      const granted = await this.ensureNativeCameraPermission();
      if (!granted) {
        this.toast.show('Camera permission is required to scan.', { variant: 'error' });
        return;
      }
      this.scanning = true;
      const result = await BarcodeScanner.scan({ formats: [BarcodeFormat.QrCode] });
      this.scanning = false;
      const barcode = result.barcodes[0];
      if (barcode?.rawValue) {
        this.onScanSuccess(barcode.rawValue);
      }
    } catch (err) {
      this.scanning = false;
      this.toast.show('Unable to access camera. Check app camera permissions.', { variant: 'error' });
    }
  }

  private async ensureNativeCameraPermission(): Promise<boolean> {
    const current = await BarcodeScanner.checkPermissions();
    if (current.camera === 'granted' || current.camera === 'limited') {
      return true;
    }
    const requested = await BarcodeScanner.requestPermissions();
    return requested.camera === 'granted' || requested.camera === 'limited';
  }

  // Web path (plain browser, e.g. ng serve or a mobile browser without the
  // installed APK): same html5-qrcode approach already proven in the legacy
  // AngularJS app's OPD/ABHA QR scanning.
  private startWebScan(): void {
    this.scanning = true;
    // Wait a tick so *ngIf renders the #canteen-qr-reader div before html5-qrcode attaches to it.
    setTimeout(() => this.initWebScanner(), 0);
  }

  private initWebScanner(): void {
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

    const empid = parseInt(decodedText.trim(), 10);
    if (!empid || isNaN(empid)) {
      this.toast.show('QR code is not a valid employee ID.', { variant: 'error' });
      return;
    }
    this.service.lookupEmployee(empid).subscribe({
      next: (result) => this.applyLookupResult(result, 'QR'),
      error: (err) => this.toast.show(err?.error || 'Employee not found', { variant: 'error' }),
    });
  }

  stopScan(): void {
    const scanner = this.html5Qrcode;
    this.html5Qrcode = null;
    this.scanning = false;
    if (scanner) {
      // stop() throws SYNCHRONOUSLY (not a rejected promise) if the scanner
      // isn't actually in the SCANNING state yet (e.g. still starting up, or
      // called a second time) - guard with getState() and a try/catch rather
      // than relying on .catch(), which never attaches if stop() throws
      // before returning a promise at all.
      try {
        if (scanner.getState() === Html5QrcodeScannerState.SCANNING || scanner.getState() === Html5QrcodeScannerState.PAUSED) {
          scanner
            .stop()
            .catch(() => {})
            .finally(() => scanner.clear());
        } else {
          scanner.clear();
        }
      } catch {
        // best-effort cleanup only
      }
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
    if (!this.scanResult.IsActive) {
      this.toast.show('Cannot charge a resigned employee.', { variant: 'error' });
      return;
    }
    this.processing = true;
    this.service.recordMeal(this.scanResult.Empid, this.selectedSubcodeId, this.entryMethod).subscribe({
      next: (txn) => {
        this.toast.show(
          `${this.selectedMealLabel} charged: Rs. ${txn.Amount} to ${this.scanResult ? this.scanResult.Empnm : ''}`,
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

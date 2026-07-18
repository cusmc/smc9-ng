import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CanteenService, CanteenRate, MealTypeItem } from './canteen.service';
import { ToastService } from '../../core/toast/toast.service';
import { RightsService } from '../../auth/rights.service';
import { RightModal } from '../../auth/rights.models';

@Component({
  selector: 'app-canteen-rate',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './canteen-rate.component.html',
})
export class CanteenRateComponent implements OnInit {
  rates: CanteenRate[] = [];
  mealTypes: MealTypeItem[] = [];
  loading = false;
  processing: Record<number, boolean> = {};
  rights: RightModal = { View: false, Add: false, Edit: false, Delete: false, Auth1: false, Auth2: false, Sp1: false, Sp2: false };

  showForm = false;
  formSubcodeId = 0;
  formRate: number | null = null;
  formWefDt = '';
  formPrevPkId: number | null = null;

  rejectingId: number | null = null;
  rejectRemarks = '';

  constructor(
    private service: CanteenService,
    private toast: ToastService,
    private rightsService: RightsService,
  ) {}

  ngOnInit(): void {
    this.rights = this.rightsService.getRightsModal('HR', 'Canteen');
    this.service.getMealTypes().subscribe({
      next: (types) => (this.mealTypes = types),
      error: () => this.toast.show('Failed to load meal types', { variant: 'error' }),
    });
    this.loadRates();
  }

  loadRates(): void {
    this.loading = true;
    this.service.getAllRates().subscribe({
      next: (data) => {
        this.rates = data;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Failed to load canteen rates', { variant: 'error' });
        this.loading = false;
      },
    });
  }

  mealLabel(subcodeId: number): string {
    const found = this.mealTypes.find((m) => m.Subcode_id === subcodeId);
    return found ? found.Vals : ('#' + subcodeId);
  }

  statusLabel(status: string): string {
    if (status === 'A') { return 'Approved'; }
    if (status === 'R') { return 'Rejected'; }
    return 'Pending';
  }

  isActive(rate: CanteenRate): boolean {
    return rate.status === 'A' && !rate.valid_upto;
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) { this.resetForm(); }
  }

  reviseRate(rate: CanteenRate): void {
    this.showForm = true;
    this.formSubcodeId = rate.subcode_id;
    this.formRate = null;
    this.formWefDt = '';
    this.formPrevPkId = rate.pk_id;
  }

  private resetForm(): void {
    this.formSubcodeId = 0;
    this.formRate = null;
    this.formWefDt = '';
    this.formPrevPkId = null;
  }

  submitRate(): void {
    if (!this.formSubcodeId) { this.toast.show('Select a meal type', { variant: 'warning' }); return; }
    if (!this.formRate || this.formRate <= 0) { this.toast.show('Enter a valid rate', { variant: 'warning' }); return; }
    if (!this.formWefDt) { this.toast.show('Select an effective-from date', { variant: 'warning' }); return; }

    const payload: Partial<CanteenRate> = {
      subcode_id: this.formSubcodeId,
      rate: this.formRate,
      wef_dt: this.formWefDt,
      prev_pk_id: this.formPrevPkId,
    };
    this.service.saveRate(payload).subscribe({
      next: () => {
        this.toast.show('Rate submitted for approval', { variant: 'success' });
        this.showForm = false;
        this.resetForm();
        this.loadRates();
      },
      error: (err) => this.toast.show(err?.error || 'Failed to save rate', { variant: 'error' }),
    });
  }

  approve(rate: CanteenRate): void {
    this.processing[rate.pk_id] = true;
    this.service.authRate(rate.pk_id).subscribe({
      next: () => {
        this.toast.show('Rate approved', { variant: 'success' });
        delete this.processing[rate.pk_id];
        this.loadRates();
      },
      error: (err) => {
        this.toast.show(err?.error || 'Approval failed', { variant: 'error' });
        delete this.processing[rate.pk_id];
      },
    });
  }

  startReject(pkId: number): void {
    this.rejectingId = pkId;
    this.rejectRemarks = '';
  }

  cancelReject(): void {
    this.rejectingId = null;
    this.rejectRemarks = '';
  }

  confirmReject(rate: CanteenRate): void {
    if (!this.rejectRemarks.trim()) { this.toast.show('Enter a rejection reason', { variant: 'warning' }); return; }
    this.processing[rate.pk_id] = true;
    this.service.rejectRate(rate.pk_id, this.rejectRemarks).subscribe({
      next: () => {
        this.toast.show('Rate rejected', { variant: 'info' });
        this.rejectingId = null;
        delete this.processing[rate.pk_id];
        this.loadRates();
      },
      error: (err) => {
        this.toast.show(err?.error || 'Rejection failed', { variant: 'error' });
        delete this.processing[rate.pk_id];
      },
    });
  }
}

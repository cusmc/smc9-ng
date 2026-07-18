import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CanteenService, FoodDedRow } from './canteen.service';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-canteen-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './canteen-report.component.html',
})
export class CanteenReportComponent {
  fromDate = '';
  toDate = '';
  rows: FoodDedRow[] = [];
  loading = false;
  searched = false;

  constructor(private service: CanteenService, private toast: ToastService) {}

  get total(): number {
    return this.rows.reduce((sum, r) => sum + (r.foodDed || 0), 0);
  }

  runReport(): void {
    if (!this.fromDate || !this.toDate) {
      this.toast.show('Select both From and To dates', { variant: 'warning' });
      return;
    }
    this.loading = true;
    this.service.getFoodDeductionReport(this.fromDate, this.toDate).subscribe({
      next: (data) => {
        this.rows = data;
        this.loading = false;
        this.searched = true;
      },
      error: () => {
        this.toast.show('Failed to load food deduction report', { variant: 'error' });
        this.loading = false;
      },
    });
  }
}

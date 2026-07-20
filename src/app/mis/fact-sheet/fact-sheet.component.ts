import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { FactSheetService, ExcelExportReq, ExcelExportRow } from './fact-sheet.service';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../core/toast/toast.service';
import {
  FactSheetNumberRow, FactSheetBedRow, FactSheetWardRow,
  FactSheetOtRow, FactSheetCathlabRow, FactSheetStaffRow,
} from './fact-sheet.models';

@Component({
  selector: 'app-fact-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fact-sheet.component.html',
  styleUrls: ['./fact-sheet.component.scss'],
})
export class FactSheetComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  readonly todayIso = new Date().toISOString().split('T')[0];

  // Default range: previous full calendar month
  readonly defaultFrom = (() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  })();
  readonly defaultTo = (() => {
    const d = new Date();
    d.setDate(0); // last day of previous month
    return d.toISOString().split('T')[0];
  })();

  fromDate = this.defaultFrom;
  toDate   = this.defaultTo;

  loading = false;
  loaded  = false;
  error: string | null = null;

  showRawData = false;

  numberRows:  FactSheetNumberRow[]  = [];
  bedRows:     FactSheetBedRow[]     = [];
  wardsRaw:    FactSheetWardRow[]    = [];
  otMaster:    FactSheetOtRow[]      = [];
  cathlab:     FactSheetCathlabRow   = { CathlabCount: 0 };
  staffRows:   FactSheetStaffRow[]   = [];

  constructor(
    private service: FactSheetService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void { this.load(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  get groupARows(): FactSheetNumberRow[] {
    return this.numberRows.filter(r => r.Grp === 'A');
  }
  get groupBRows(): FactSheetNumberRow[] {
    return this.numberRows.filter(r => r.Grp === 'B');
  }

  load(): void {
    this.loading = true;
    this.error   = null;

    this.service.getNumbers(this.fromDate, this.toDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: r => {
          this.numberRows = r.Numbers;
          this.bedRows    = r.Beds;
          this.wardsRaw   = r.WardsRaw;
          this.otMaster   = r.OtMaster;
          this.cathlab    = r.Cathlab;
          this.staffRows  = r.Staff;
          this.loading = false;
          this.loaded  = true;
        },
        error: () => {
          this.loading = false;
          this.error   = 'Failed to load Fact Sheet data.';
          this.toast.showLoadError('Fact Sheet');
        },
      });
  }

  toggleRawData(): void { this.showRawData = !this.showRawData; }

  // ── Export ──────────────────────────────────────────────────────────

  private toAbsoluteUrl(serverUrl: string): string {
    if (serverUrl.startsWith('/')) return environment.apiUrl + serverUrl;
    const file = serverUrl.replace(/\\/g, '/').split('/').filter(Boolean).pop() ?? serverUrl;
    return environment.apiUrl + '/Temp/' + file;
  }

  exportPdf(): void {
    const html = this.buildExportHtml();
    this.service.exportPdf(html)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: r => window.open(this.toAbsoluteUrl(r.url), '_blank') });
  }

  exportExcel(): void {
    const req = this.buildExcelReq();
    this.service.exportExcel(req)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: r => window.open(this.toAbsoluteUrl(r.url), '_blank') });
  }

  private buildExportHtml(): string {
    const thLStyle = 'border:1px solid #94a3b8;padding:5px 9px;background:#1e3a5f;color:#fff;font-size:10px;text-align:left;white-space:nowrap;';
    const thStyle  = 'border:1px solid #94a3b8;padding:5px 9px;background:#1e3a5f;color:#fff;font-size:10px;text-align:right;white-space:nowrap;';
    const tdLStyle = 'border:1px solid #e2e8f0;padding:4px 9px;font-size:10px;';
    const tdStyle  = 'border:1px solid #e2e8f0;padding:4px 9px;font-size:10px;text-align:right;';
    const totStyle = 'background:#eff6ff;font-weight:bold;border-top:2px solid #93c5fd;';
    const secStyle = 'background:#1e3a5f;color:#fff;font-weight:bold;font-size:11px;padding:6px 9px;';

    let html = `<div style="font-family:Arial;padding:16px;">`;
    html += `<h2 style="font-size:15px;margin:0 0 4px;">CUSMC Fact Sheet</h2>`;
    html += `<p style="font-size:10px;color:#475569;margin:0 0 12px;">Period: ${this.fromDate} to ${this.toDate}</p>`;

    html += `<table style="border-collapse:collapse;width:100%;margin-bottom:14px;">`;
    html += `<tr><th style="${thLStyle}">Label</th><th style="${thStyle}">Monthly</th><th style="${thStyle}">Annualized Est.</th><th style="${thLStyle}">Remarks</th></tr>`;
    for (const r of this.numberRows) {
      const rs = r.Label === 'Total' ? totStyle : '';
      html += `<tr style="${rs}"><td style="${tdLStyle}">${r.Label}</td><td style="${tdStyle}">${r.MonthlyValue}</td><td style="${tdStyle}">${r.AnnualizedEstimate ?? ''}</td><td style="${tdLStyle}">${r.Remarks ?? ''}</td></tr>`;
    }
    html += `</table>`;

    html += `<div style="${secStyle}">Hospital Beds by ICU Type</div>`;
    html += `<table style="border-collapse:collapse;width:100%;margin-bottom:14px;">`;
    html += `<tr><th style="${thLStyle}">Ward</th><th style="${thStyle}">Beds</th></tr>`;
    for (const b of this.bedRows) {
      html += `<tr><td style="${tdLStyle}">${b.WardLabel}</td><td style="${tdStyle}">${b.BedCount}</td></tr>`;
    }
    html += `</table>`;

    html += `<div style="${secStyle}">Cathlab</div>`;
    html += `<p style="font-size:11px;">${this.cathlab.CathlabCount}</p>`;

    html += `<div style="${secStyle}">Staff Strength</div>`;
    html += `<table style="border-collapse:collapse;width:100%;">`;
    html += `<tr><th style="${thLStyle}">Category</th><th style="${thStyle}">Count</th></tr>`;
    for (const s of this.staffRows) {
      html += `<tr><td style="${tdLStyle}">${s.Category}</td><td style="${tdStyle}">${s.EmpCount}</td></tr>`;
    }
    html += `</table>`;

    html += `</div>`;
    return html;
  }

  private buildExcelReq(): ExcelExportReq {
    const rows: ExcelExportRow[] = [];

    rows.push({ Label: 'Numbers Treated', Values: [], IsTotal: false, IsCurrency: false, IsSection: true });
    for (const r of this.numberRows) {
      rows.push({ Label: r.Label, Values: [r.MonthlyValue, r.AnnualizedEstimate ?? 0], IsTotal: r.Label === 'Total', IsCurrency: false, IsSection: false });
    }

    rows.push({ Label: 'Hospital Beds by ICU Type', Values: [], IsTotal: false, IsCurrency: false, IsSection: true });
    for (const b of this.bedRows) {
      rows.push({ Label: b.WardLabel, Values: [b.BedCount], IsTotal: false, IsCurrency: false, IsSection: false });
    }

    rows.push({ Label: 'Cathlab', Values: [this.cathlab.CathlabCount], IsTotal: false, IsCurrency: false, IsSection: false });

    rows.push({ Label: 'Staff Strength', Values: [], IsTotal: false, IsCurrency: false, IsSection: true });
    for (const s of this.staffRows) {
      rows.push({ Label: s.Category, Values: [s.EmpCount], IsTotal: false, IsCurrency: false, IsSection: false });
    }

    return { Title: 'CUSMC Fact Sheet', Headers: ['Label', 'Monthly / Count', 'Annualized Est.'], Rows: rows };
  }
}

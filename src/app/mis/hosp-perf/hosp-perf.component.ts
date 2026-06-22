import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { HospPerfService, ExcelExportReq, ExcelExportRow } from './hosp-perf.service';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../core/toast/toast.service';
import {
  PerfRow, PerfRequest, CompSeries, CompareSeries, LookupItem, TableRow,
} from './hosp-perf.models';

export type ChartOptions = {
  series:      ApexAxisChartSeries;
  chart:       ApexChart;
  xaxis:       ApexXAxis;
  yaxis:       ApexYAxis;
  plotOptions: ApexPlotOptions;
  dataLabels:  ApexDataLabels;
  colors:      string[];
  legend:      ApexLegend;
  tooltip:     ApexTooltip;
  stroke:      ApexStroke;
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

@Component({
  selector: 'app-hosp-perf',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './hosp-perf.component.html',
  styleUrls: ['./hosp-perf.component.scss'],
})
export class HospPerfComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  readonly todayIso        = new Date().toISOString().split('T')[0];
  readonly firstOfMonthIso = (() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  })();

  // Lookups
  depts:    LookupItem[] = [];
  doctors:  LookupItem[] = [];
  subdepts: LookupItem[] = [];

  private readonly PMJAY_IDS   = '103,99';
  private readonly PRIVATE_IDS = '153';

  // ── Shared state ──────────────────────────────────────────────────
  resultMode: 'none' | 'single' | 'compare' = 'none';
  loading = false;
  error: string | null = null;

  readonly granularities = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];
  sGranularity = 'Monthly';

  // ── Series builder (drives both single and compare modes) ─────────
  seriesList: CompSeries[] = [];

  // ── Single-series result state ────────────────────────────────────
  rawRows: PerfRow[] = [];

  tablePeriods:    string[]   = [];
  opdTableRows:     TableRow[] = [];
  ipdTableRows:     TableRow[] = [];
  surgeryTableRows: TableRow[] = [];
  revenueTableRows: TableRow[] = [];

  // Inner card view tab (Table | Chart) per section
  opdView:     'table' | 'chart' = 'chart';
  ipdView:     'table' | 'chart' = 'chart';
  surgeryView: 'table' | 'chart' = 'chart';
  revenueView: 'table' | 'chart' = 'chart';

  // Chart sub-tab (category) per section
  opdTab     = 'Total';
  ipdTab     = 'Total';
  surgeryTab = 'Total';
  revenueTab = 'Total';

  opdChart:     Partial<ChartOptions> | null = null;
  ipdChart:     Partial<ChartOptions> | null = null;
  surgeryChart: Partial<ChartOptions> | null = null;
  revenueChart: Partial<ChartOptions> | null = null;

  private aggResult: { periods: { seq: number; label: string }[]; data: { [k: string]: { [s: number]: number } } } | null = null;

  // ── Compare result state ──────────────────────────────────────────
  compareRaw:         CompareSeries[] = [];
  compareTableLabels: string[]        = [];

  // Per-section table rows (columns = series)
  cOpdTableRows:     TableRow[] = [];
  cIpdTableRows:     TableRow[] = [];
  cSurgeryTableRows: TableRow[] = [];
  cRevenueTableRows: TableRow[] = [];

  // Per-section inner view tab
  cOpdView:     'table' | 'chart' = 'chart';
  cIpdView:     'table' | 'chart' = 'chart';
  cSurgeryView: 'table' | 'chart' = 'chart';
  cRevenueView: 'table' | 'chart' = 'chart';

  // Per-section active chart sub-tab
  cOpdTab     = 'Total';
  cIpdTab     = 'Total';
  cSurgeryTab = 'Total';
  cRevenueTab = 'Total';

  cOpdChart:     Partial<ChartOptions> | null = null;
  cIpdChart:     Partial<ChartOptions> | null = null;
  cSurgeryChart: Partial<ChartOptions> | null = null;
  cRevenueChart: Partial<ChartOptions> | null = null;

  private compareSeriesTotals: { [key: string]: number }[] = [];

  constructor(
    private service: HospPerfService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadLookups();
    this.seriesList.push({
      Label:       'Series 1',
      Fdate:       this.firstOfMonthIso,
      Tdate:       this.todayIso,
      Dept_id:     null,
      Subdept_id:  null,
      Doctor_id:   null,
      Pmjay_ids:   this.PMJAY_IDS,
      Private_ids: this.PRIVATE_IDS,
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  private loadLookups(): void {
    this.service.loadLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: lk => { this.depts = lk.depts; this.doctors = lk.doctors; this.subdepts = lk.subdepts; },
        error: () => { /* non-critical */ },
      });
  }

  addSeries(): void {
    this.seriesList.push({
      Label:       'Series ' + (this.seriesList.length + 1),
      Fdate:       this.firstOfMonthIso,
      Tdate:       this.todayIso,
      Dept_id:     null,
      Subdept_id:  null,
      Doctor_id:   null,
      Pmjay_ids:   this.PMJAY_IDS,
      Private_ids: this.PRIVATE_IDS,
    });
  }

  removeSeries(i: number): void { this.seriesList.splice(i, 1); }

  generate(): void {
    if (!this.seriesList.length) return;
    this.loading = true;
    this.error   = null;
    this.opdView = this.ipdView = this.surgeryView = this.revenueView = 'chart';

    if (this.seriesList.length === 1) {
      const s = this.seriesList[0];
      const req: PerfRequest = {
        Fdate:       s.Fdate,
        Tdate:       s.Tdate,
        Dept_id:     s.Dept_id,
        Subdept_id:  s.Subdept_id,
        Doctor_id:   s.Doctor_id,
        Pmjay_ids:   this.PMJAY_IDS,
        Private_ids: this.PRIVATE_IDS,
      };
      this.service.getSummary(req).pipe(takeUntil(this.destroy$)).subscribe({
        next: rows => {
          this.rawRows = rows;
          this.loading = false;
          this.applyGranularity();
          this.resultMode = 'single';
        },
        error: () => {
          this.loading = false;
          this.error   = 'Failed to load performance data.';
          this.toast.showLoadError('Performance');
        },
      });
    } else {
      const cReq = {
        Series: this.seriesList.map(s => ({ ...s, Pmjay_ids: this.PMJAY_IDS, Private_ids: this.PRIVATE_IDS })),
      };
      this.service.compare(cReq).pipe(takeUntil(this.destroy$)).subscribe({
        next: result => {
          this.compareRaw = result;
          this.loading    = false;
          this.buildCompareResults();
          this.resultMode = 'compare';
        },
        error: () => {
          this.loading = false;
          this.error   = 'Failed to load comparison data.';
          this.toast.showLoadError('Comparison');
        },
      });
    }
  }

  applyGranularity(): void {
    if (!this.rawRows.length) return;
    this.aggResult = this.aggregateRows(this.rawRows, this.sGranularity, this.seriesList[0]?.Fdate || this.firstOfMonthIso);
    const agg  = this.aggResult;
    const seqs = agg.periods.map(p => p.seq);
    const get  = (sec: string, cat: string): number[] =>
      seqs.map(s => agg.data[sec + '|' + cat]?.[s] || 0);

    this.tablePeriods = agg.periods.map(p => p.label);

    this.opdTableRows = [
      { label: 'PMJAY+',  values: get('OPD', 'PMJY+'),   isTotal: false, isCurrency: false },
      { label: 'Private', values: get('OPD', 'Private'),  isTotal: false, isCurrency: false },
      { label: 'Others',  values: get('OPD', 'Others'),   isTotal: false, isCurrency: false },
      { label: 'Total',   values: get('OPD', 'Total'),    isTotal: true,  isCurrency: false },
    ];
    this.ipdTableRows = [
      { label: 'PMJAY+',  values: get('IPD', 'PMJY+'),   isTotal: false, isCurrency: false },
      { label: 'Private', values: get('IPD', 'Private'),  isTotal: false, isCurrency: false },
      { label: 'Others',  values: get('IPD', 'Others'),   isTotal: false, isCurrency: false },
      { label: 'Total',   values: get('IPD', 'Total'),    isTotal: true,  isCurrency: false },
    ];
    this.surgeryTableRows = [
      { label: 'Supra', values: get('Surgery', 'Supra'), isTotal: false, isCurrency: false },
      { label: 'Major', values: get('Surgery', 'Major'), isTotal: false, isCurrency: false },
      { label: 'Minor', values: get('Surgery', 'Minor'), isTotal: false, isCurrency: false },
      { label: 'Total', values: get('Surgery', 'Total'), isTotal: true,  isCurrency: false },
    ];
    this.revenueTableRows = [
      { label: 'Hospital',   values: get('Revenue', 'Hospital'),   isTotal: false, isCurrency: true },
      { label: 'Diagnostic', values: get('Revenue', 'Diagnostic'), isTotal: false, isCurrency: true },
      { label: 'Pharmacy',   values: get('Revenue', 'Pharmacy'),   isTotal: false, isCurrency: true },
      { label: 'Total',      values: get('Revenue', 'Total'),      isTotal: true,  isCurrency: true },
    ];

    this.opdChart     = this.makeChart('OPD',     this.opdTab,     '#2563eb', false);
    this.ipdChart     = this.makeChart('IPD',     this.ipdTab,     '#0d9488', false);
    this.surgeryChart = this.makeChart('Surgery', this.surgeryTab, '#ea580c', false);
    this.revenueChart = this.makeChart('Revenue', this.revenueTab, '#16a34a', true);
  }

  private aggregateRows(rows: PerfRow[], granularity: string, fdate: string) {
    const periodMap: { [seq: number]: string }                    = {};
    const data:      { [key: string]: { [seq: number]: number } } = {};

    for (const r of rows) {
      const pk  = this.getPeriodKey(r.TDate, granularity, fdate);
      periodMap[pk.seq] = pk.label;

      const key = r.Section + '|' + r.Category;
      if (!data[key]) data[key] = {};
      data[key][pk.seq] = (data[key][pk.seq] || 0) + (r.Value || 0);

      const totKey = r.Section + '|Total';
      if (!data[totKey]) data[totKey] = {};
      data[totKey][pk.seq] = (data[totKey][pk.seq] || 0) + (r.Value || 0);
    }

    const periods = Object.keys(periodMap)
      .map(k => ({ seq: +k, label: periodMap[+k] }))
      .sort((a, b) => a.seq - b.seq);

    return { periods, data };
  }

  private makeChart(section: string, category: string, color: string, isCurrency: boolean): Partial<ChartOptions> {
    if (!this.aggResult) return {};
    const agg    = this.aggResult;
    const labels = agg.periods.map(p => p.label);
    const seqs   = agg.periods.map(p => p.seq);
    const values = seqs.map(s => agg.data[section + '|' + category]?.[s] || 0);
    const seriesName = category === 'PMJY+' ? 'PMJAY+' : category;
    return {
      series:      [{ name: seriesName, data: values }],
      chart:       { type: 'bar', height: 260, toolbar: { show: false } },
      plotOptions: { bar: { borderRadius: 3, columnWidth: '55%' } },
      xaxis:       { categories: labels, labels: { rotate: -35, style: { fontSize: '10px' } } },
      yaxis:       { labels: { style: { fontSize: '11px' } } },
      dataLabels:  { enabled: false },
      colors:      [color],
      legend:      { show: false },
      tooltip:     { y: { formatter: (v: number) => isCurrency ? v.toLocaleString('en-IN') : v.toString() } },
      stroke:      { width: 0 },
    };
  }

  setOpdTab(tab: string): void {
    this.opdTab   = tab;
    this.opdChart = this.makeChart('OPD', tab, '#2563eb', false);
  }
  setIpdTab(tab: string): void {
    this.ipdTab   = tab;
    this.ipdChart = this.makeChart('IPD', tab, '#0d9488', false);
  }
  setSurgeryTab(tab: string): void {
    this.surgeryTab   = tab;
    this.surgeryChart = this.makeChart('Surgery', tab, '#ea580c', false);
  }
  setRevenueTab(tab: string): void {
    this.revenueTab   = tab;
    this.revenueChart = this.makeChart('Revenue', tab, '#16a34a', true);
  }

  private buildCompareResults(): void {
    if (!this.compareRaw.length) return;

    this.compareTableLabels = this.compareRaw.map(s => s.Label);
    this.cOpdView = this.cIpdView = this.cSurgeryView = this.cRevenueView = 'chart';

    this.compareSeriesTotals = this.compareRaw.map(s => {
      const t: { [key: string]: number } = {};
      for (const r of s.Data) {
        const key    = r.Section + '|' + r.Category;
        const totKey = r.Section + '|Total';
        t[key]    = (t[key]    || 0) + r.Value;
        t[totKey] = (t[totKey] || 0) + r.Value;
      }
      return t;
    });

    const get = (sec: string, cat: string): number[] =>
      this.compareSeriesTotals.map(t => t[sec + '|' + cat] || 0);

    this.cOpdTableRows = [
      { label: 'PMJAY+',  values: get('OPD', 'PMJY+'),   isTotal: false, isCurrency: false },
      { label: 'Private', values: get('OPD', 'Private'),  isTotal: false, isCurrency: false },
      { label: 'Others',  values: get('OPD', 'Others'),   isTotal: false, isCurrency: false },
      { label: 'Total',   values: get('OPD', 'Total'),    isTotal: true,  isCurrency: false },
    ];
    this.cIpdTableRows = [
      { label: 'PMJAY+',  values: get('IPD', 'PMJY+'),   isTotal: false, isCurrency: false },
      { label: 'Private', values: get('IPD', 'Private'),  isTotal: false, isCurrency: false },
      { label: 'Others',  values: get('IPD', 'Others'),   isTotal: false, isCurrency: false },
      { label: 'Total',   values: get('IPD', 'Total'),    isTotal: true,  isCurrency: false },
    ];
    this.cSurgeryTableRows = [
      { label: 'Supra', values: get('Surgery', 'Supra'), isTotal: false, isCurrency: false },
      { label: 'Major', values: get('Surgery', 'Major'), isTotal: false, isCurrency: false },
      { label: 'Minor', values: get('Surgery', 'Minor'), isTotal: false, isCurrency: false },
      { label: 'Total', values: get('Surgery', 'Total'), isTotal: true,  isCurrency: false },
    ];
    this.cRevenueTableRows = [
      { label: 'Hospital',   values: get('Revenue', 'Hospital'),   isTotal: false, isCurrency: true },
      { label: 'Diagnostic', values: get('Revenue', 'Diagnostic'), isTotal: false, isCurrency: true },
      { label: 'Pharmacy',   values: get('Revenue', 'Pharmacy'),   isTotal: false, isCurrency: true },
      { label: 'Total',      values: get('Revenue', 'Total'),      isTotal: true,  isCurrency: true },
    ];

    this.cOpdChart     = this.makeCompareChart('OPD',     this.cOpdTab,     '#2563eb', false);
    this.cIpdChart     = this.makeCompareChart('IPD',     this.cIpdTab,     '#0d9488', false);
    this.cSurgeryChart = this.makeCompareChart('Surgery', this.cSurgeryTab, '#ea580c', false);
    this.cRevenueChart = this.makeCompareChart('Revenue', this.cRevenueTab, '#16a34a', true);
  }

  private makeCompareChart(section: string, category: string, color: string, isCurrency: boolean): Partial<ChartOptions> {
    const values     = this.compareSeriesTotals.map(t => t[section + '|' + category] || 0);
    const seriesName = category === 'PMJY+' ? 'PMJAY+' : category;
    return {
      series:      [{ name: seriesName, data: values }],
      chart:       { type: 'bar', height: 260, toolbar: { show: false } },
      plotOptions: { bar: { borderRadius: 3, columnWidth: '50%' } },
      xaxis:       { categories: this.compareTableLabels, labels: { style: { fontSize: '11px' } } },
      yaxis:       { labels: { style: { fontSize: '11px' } } },
      dataLabels:  { enabled: true, style: { fontSize: '10px' } },
      colors:      [color],
      legend:      { show: false },
      tooltip:     { y: { formatter: (v: number) => isCurrency ? v.toLocaleString('en-IN') : v.toString() } },
      stroke:      { width: 0 },
    };
  }

  setCOpdTab(tab: string): void {
    this.cOpdTab   = tab;
    this.cOpdChart = this.makeCompareChart('OPD', tab, '#2563eb', false);
  }
  setCIpdTab(tab: string): void {
    this.cIpdTab   = tab;
    this.cIpdChart = this.makeCompareChart('IPD', tab, '#0d9488', false);
  }
  setCSurgeryTab(tab: string): void {
    this.cSurgeryTab   = tab;
    this.cSurgeryChart = this.makeCompareChart('Surgery', tab, '#ea580c', false);
  }
  setCRevenueTab(tab: string): void {
    this.cRevenueTab   = tab;
    this.cRevenueChart = this.makeCompareChart('Revenue', tab, '#16a34a', true);
  }

  // ── Export (full document — all sections) ─────────────────────────

  /** Normalize whatever the server returns into an absolute URL.
   *  Handles both "/Temp/file.pdf" (new) and "..//temp//file.pdf" (legacy). */
  private toAbsoluteUrl(serverUrl: string): string {
    if (serverUrl.startsWith('/')) return environment.apiUrl + serverUrl;
    // Legacy relative — extract filename and rebuild
    const file = serverUrl.replace(/\\/g, '/').split('/').filter(Boolean).pop() ?? serverUrl;
    return environment.apiUrl + '/Temp/' + file;
  }

  exportAllPdf(): void {
    const html = this.resultMode === 'compare'
      ? this.buildCompareExportHtml()
      : this.buildSingleExportHtml();
    this.service.exportPdf(html)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: r => window.open(this.toAbsoluteUrl(r.url), '_blank') });
  }

  exportAllExcel(): void {
    const req = this.resultMode === 'compare'
      ? this.buildCompareExcelReq()
      : this.buildSingleExcelReq();
    this.service.exportExcel(req)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: r => window.open(this.toAbsoluteUrl(r.url), '_blank') });
  }

  // Resolves a filter ID to its display name from the lookup lists
  private filterTitle(): string {
    const s    = this.seriesList[0];
    const dept = s.Dept_id    ? (this.depts.find(d => d.id === s.Dept_id)?.nm    ?? '') : 'All Departments';
    const sub  = s.Subdept_id ? (this.subdepts.find(d => d.id === s.Subdept_id)?.nm ?? '') : '';
    const doc  = s.Doctor_id  ? ('Dr. ' + (this.doctors.find(d => d.id === s.Doctor_id)?.nm ?? '')) : 'All Doctors';
    const parts = ['Hospital Performance Report', dept, sub, doc].filter(Boolean);
    return parts.join(' | ');
  }

  private buildSingleExportHtml(): string {
    const title   = this.filterTitle();
    const s       = this.seriesList[0];
    const period  = `Period: ${s.Fdate} to ${s.Tdate} &nbsp;|&nbsp; Granularity: ${this.sGranularity}`;
    const periods = this.tablePeriods;

    const thStyle  = 'border:1px solid #94a3b8;padding:5px 9px;background:#1e3a5f;color:#fff;font-size:10px;text-align:right;white-space:nowrap;';
    const thLStyle = 'border:1px solid #94a3b8;padding:5px 9px;background:#1e3a5f;color:#fff;font-size:10px;text-align:left;white-space:nowrap;';
    const tdStyle  = 'border:1px solid #e2e8f0;padding:4px 9px;font-size:10px;text-align:right;';
    const tdLStyle = 'border:1px solid #e2e8f0;padding:4px 9px;font-size:10px;';
    const totStyle = 'background:#eff6ff;font-weight:bold;border-top:2px solid #93c5fd;';
    const secStyle = 'background:#1e3a5f;color:#fff;font-weight:bold;font-size:11px;padding:6px 9px;';

    const sections = [
      { label: 'OPD',     rows: this.opdTableRows     },
      { label: 'IPD',     rows: this.ipdTableRows     },
      { label: 'Surgery', rows: this.surgeryTableRows  },
      { label: 'Revenue', rows: this.revenueTableRows  },
    ];
    const colCount = periods.length + 1;

    let html = `<div style="font-family:Arial;padding:16px;">`;
    html += `<h2 style="font-size:15px;margin:0 0 4px;">${title}</h2>`;
    html += `<p style="font-size:10px;color:#475569;margin:0 0 12px;">${period}</p>`;
    html += `<table style="border-collapse:collapse;width:100%;">`;

    for (const sec of sections) {
      // Section header spanning all columns
      html += `<tr><td colspan="${colCount}" style="${secStyle}">${sec.label}</td></tr>`;
      // Column headers
      html += `<tr><th style="${thLStyle}">Category</th>`;
      for (const p of periods) html += `<th style="${thStyle}">${p}</th>`;
      html += `</tr>`;
      // Data rows
      for (const row of sec.rows) {
        const rs = row.isTotal ? totStyle : '';
        html += `<tr style="${rs}"><td style="${tdLStyle}${row.isTotal ? 'font-weight:bold;' : ''}">${row.label}</td>`;
        for (const v of row.values) {
          const d = row.isCurrency ? v.toLocaleString('en-IN') : v.toString();
          html += `<td style="${tdStyle}${row.isTotal ? 'font-weight:bold;' : ''}">${d}</td>`;
        }
        html += `</tr>`;
      }
      // Spacer
      html += `<tr><td colspan="${colCount}" style="height:10px;"></td></tr>`;
    }

    html += `</table></div>`;
    return html;
  }

  private buildSingleExcelReq(): ExcelExportReq {
    const s       = this.seriesList[0];
    const dept    = s.Dept_id    ? (this.depts.find(d => d.id === s.Dept_id)?.nm    ?? '') : 'All Depts';
    const sub     = s.Subdept_id ? (this.subdepts.find(d => d.id === s.Subdept_id)?.nm ?? '') : '';
    const doc     = s.Doctor_id  ? ('Dr. ' + (this.doctors.find(d => d.id === s.Doctor_id)?.nm ?? '')) : 'All Doctors';
    const title   = ['Hosp Performance', dept, sub, doc].filter(Boolean).join(' | ');
    const headers = ['Section / Category', ...this.tablePeriods];
    const rows: ExcelExportRow[] = [];

    const sections = [
      { label: 'OPD',     data: this.opdTableRows     },
      { label: 'IPD',     data: this.ipdTableRows     },
      { label: 'Surgery', data: this.surgeryTableRows  },
      { label: 'Revenue', data: this.revenueTableRows  },
    ];

    for (const sec of sections) {
      rows.push({ Label: sec.label, Values: [], IsTotal: false, IsCurrency: false, IsSection: true });
      for (const r of sec.data) {
        rows.push({ Label: r.label, Values: r.values, IsTotal: r.isTotal, IsCurrency: r.isCurrency, IsSection: false });
      }
    }

    return { Title: title, Headers: headers, Rows: rows };
  }

  private buildCompareExportHtml(): string {
    const labels   = this.compareTableLabels;
    const colCount = labels.length + 1;
    const thStyle  = 'border:1px solid #94a3b8;padding:5px 9px;background:#1e3a5f;color:#fff;font-size:10px;text-align:right;white-space:nowrap;';
    const thLStyle = 'border:1px solid #94a3b8;padding:5px 9px;background:#1e3a5f;color:#fff;font-size:10px;text-align:left;white-space:nowrap;';
    const tdStyle  = 'border:1px solid #e2e8f0;padding:4px 9px;font-size:10px;text-align:right;';
    const tdLStyle = 'border:1px solid #e2e8f0;padding:4px 9px;font-size:10px;';
    const totStyle = 'background:#eff6ff;font-weight:bold;border-top:2px solid #93c5fd;';
    const secStyle = 'background:#1e3a5f;color:#fff;font-weight:bold;font-size:11px;padding:6px 9px;';

    const sections = [
      { label: 'OPD',     rows: this.cOpdTableRows     },
      { label: 'IPD',     rows: this.cIpdTableRows     },
      { label: 'Surgery', rows: this.cSurgeryTableRows  },
      { label: 'Revenue', rows: this.cRevenueTableRows  },
    ];

    let html = `<div style="font-family:Arial;padding:16px;">`;
    html += `<h2 style="font-size:15px;margin:0 0 4px;">Hospital Performance — Comparison</h2>`;
    html += `<p style="font-size:10px;color:#475569;margin:0 0 12px;">Series: ${labels.join(' &nbsp;vs&nbsp; ')}</p>`;
    html += `<table style="border-collapse:collapse;width:100%;">`;

    for (const sec of sections) {
      html += `<tr><td colspan="${colCount}" style="${secStyle}">${sec.label}</td></tr>`;
      html += `<tr><th style="${thLStyle}">Category</th>`;
      for (const lbl of labels) html += `<th style="${thStyle}">${lbl}</th>`;
      html += `</tr>`;
      for (const row of sec.rows) {
        const rs = row.isTotal ? totStyle : '';
        html += `<tr style="${rs}"><td style="${tdLStyle}${row.isTotal ? 'font-weight:bold;' : ''}">${row.label}</td>`;
        for (const v of row.values) {
          const d = row.isCurrency ? v.toLocaleString('en-IN') : v.toString();
          html += `<td style="${tdStyle}${row.isTotal ? 'font-weight:bold;' : ''}">${d}</td>`;
        }
        html += `</tr>`;
      }
      html += `<tr><td colspan="${colCount}" style="height:10px;"></td></tr>`;
    }

    html += `</table></div>`;
    return html;
  }

  private buildCompareExcelReq(): ExcelExportReq {
    const labels  = this.compareTableLabels;
    const headers = ['Section / Category', ...labels];
    const rows: ExcelExportRow[] = [];

    const sections = [
      { label: 'OPD',     data: this.cOpdTableRows     },
      { label: 'IPD',     data: this.cIpdTableRows     },
      { label: 'Surgery', data: this.cSurgeryTableRows  },
      { label: 'Revenue', data: this.cRevenueTableRows  },
    ];

    for (const sec of sections) {
      rows.push({ Label: sec.label, Values: [], IsTotal: false, IsCurrency: false, IsSection: true });
      for (const r of sec.data) {
        rows.push({ Label: r.label, Values: r.values, IsTotal: r.isTotal, IsCurrency: r.isCurrency, IsSection: false });
      }
    }

    return { Title: 'Hospital Performance — Comparison', Headers: headers, Rows: rows };
  }

  private getPeriodKey(tdate: string, granularity: string, fdate: string): { seq: number; label: string } {
    const d  = new Date(tdate);
    const fd = new Date(fdate);
    const dd = Math.floor((d.getTime() - fd.getTime()) / 86400000);

    switch (granularity) {
      case 'Daily':
        return {
          seq:   dd,
          label: d.getDate() + '-' + MONTH_NAMES[d.getMonth()] + '-' +
                 (d.getFullYear() % 100).toString().padStart(2, '0'),
        };
      case 'Weekly':
        return { seq: Math.floor(dd / 7), label: 'W' + (Math.floor(dd / 7) + 1) + ' ' + d.getFullYear() };
      case 'Monthly': {
        const ms = (d.getFullYear() - fd.getFullYear()) * 12 + d.getMonth() - fd.getMonth();
        return { seq: ms, label: MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear() };
      }
      case 'Quarterly': {
        const qs    = Math.floor(d.getMonth() / 3);
        const qfd   = Math.floor(fd.getMonth() / 3);
        const qseq  = (d.getFullYear() - fd.getFullYear()) * 4 + qs - qfd;
        return { seq: qseq, label: 'Q' + (qs + 1) + ' ' + d.getFullYear() };
      }
      case 'Yearly':
        return { seq: d.getFullYear() - fd.getFullYear(), label: d.getFullYear().toString() };
      default:
        return { seq: dd, label: tdate.substring(0, 10) };
    }
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subject, takeUntil } from 'rxjs';
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

import { DoctPerfService, ExcelExportReq, ExcelExportRow } from './doct-perf.service';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../core/toast/toast.service';
import {
  PerfRow, DoctPerfRow, DoctPerfReq, LookupItem, CategoryItem, TableRow, DoctorSummaryRow,
} from './doct-perf.models';

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
  selector: 'app-doct-perf',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './doct-perf.component.html',
})
export class DoctPerfComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  readonly todayIso        = new Date().toISOString().split('T')[0];
  readonly firstOfMonthIso = (() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  })();

  // Lookups
  depts:      LookupItem[]   = [];
  doctors:    LookupItem[]   = [];
  subdepts:   LookupItem[]   = [];
  categories: CategoryItem[] = [];

  // Filter panel
  fdate      = this.firstOfMonthIso;
  tdate      = this.todayIso;
  deptId:    number | null = null;
  subdeptId: number | null = null;
  doctorId:  number | null = null;
  doctcate   = 'S';

  // Shared state
  resultMode: 'none' | 'ready' = 'none';
  activeTab: 'summary' | 'doctor' = 'summary';
  loading = false;
  error: string | null = null;

  // ── Summary tab ───────────────────────────────────────────────────
  rawRows: PerfRow[] = [];

  readonly granularities = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];
  sGranularity = 'Monthly';

  tablePeriods:     string[]   = [];
  opdTableRows:     TableRow[] = [];
  ipdTableRows:     TableRow[] = [];
  surgeryTableRows: TableRow[] = [];
  revenueTableRows: TableRow[] = [];

  opdView:     'table' | 'chart' = 'chart';
  ipdView:     'table' | 'chart' = 'chart';
  surgeryView: 'table' | 'chart' = 'chart';
  revenueView: 'table' | 'chart' = 'chart';

  opdTab     = 'Total';
  ipdTab     = 'Total';
  surgeryTab = 'Total';
  revenueTab = 'Total';

  opdChart:     Partial<ChartOptions> | null = null;
  ipdChart:     Partial<ChartOptions> | null = null;
  surgeryChart: Partial<ChartOptions> | null = null;
  revenueChart: Partial<ChartOptions> | null = null;

  private aggResult: { periods: { seq: number; label: string }[]; data: { [k: string]: { [s: number]: number } } } | null = null;

  // ── Doctor-wise tab ───────────────────────────────────────────────
  rawDoctRows:     DoctPerfRow[]      = [];
  doctorRows:      DoctorSummaryRow[] = [];
  sortedDoctorRows: DoctorSummaryRow[] = [];

  sortField = 'opdTotal';
  sortDir: 'asc' | 'desc' = 'desc';

  topNMetric = 'opdTotal';
  topN       = 10;
  doctorChart: Partial<ChartOptions> | null = null;

  readonly topNMetricOptions = [
    { value: 'opdTotal', label: 'OPD Total' },
    { value: 'ipdTotal', label: 'IPD Total' },
    { value: 'surTotal', label: 'Surgery Total' },
    { value: 'revTotal', label: 'Revenue Total' },
  ];

  constructor(
    private service: DoctPerfService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.service.loadLookups().pipe(takeUntil(this.destroy$)).subscribe({
      next: lk => {
        this.depts      = lk.depts;
        this.doctors    = lk.doctors;
        this.subdepts   = lk.subdepts;
        this.categories = lk.categories;
      },
      error: () => { /* non-critical */ },
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  generate(): void {
    this.loading = true;
    this.error   = null;

    const req: DoctPerfReq = {
      Fdate:      this.fdate,
      Tdate:      this.tdate,
      Dept_id:    this.deptId,
      Subdept_id: this.subdeptId,
      Doctor_id:  this.doctorId,
      Doctcate:   this.doctcate,
    };

    forkJoin({
      summary:    this.service.getSummary(req),
      doctorWise: this.service.getDoctorWise(req),
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: result => {
        this.rawRows     = result.summary;
        this.rawDoctRows = result.doctorWise;
        this.loading     = false;
        this.opdView = this.ipdView = this.surgeryView = this.revenueView = 'chart';
        this.applyGranularity();
        this.buildDoctorTable();
        this.resultMode = 'ready';
        this.activeTab  = 'summary';
      },
      error: () => {
        this.loading = false;
        this.error   = 'Failed to load performance data.';
        this.toast.showLoadError('Doctor Performance');
      },
    });
  }

  // ── Summary tab logic (mirrors hosp-perf exactly) ─────────────────

  applyGranularity(): void {
    if (!this.rawRows.length) { return; }
    this.aggResult = this.aggregateRows(this.rawRows, this.sGranularity, this.fdate);
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
      const pk = this.getPeriodKey(r.TDate, granularity, fdate);
      periodMap[pk.seq] = pk.label;

      const key = r.Section + '|' + r.Category;
      if (!data[key]) { data[key] = {}; }
      data[key][pk.seq] = (data[key][pk.seq] || 0) + (r.Value || 0);

      const totKey = r.Section + '|Total';
      if (!data[totKey]) { data[totKey] = {}; }
      data[totKey][pk.seq] = (data[totKey][pk.seq] || 0) + (r.Value || 0);
    }

    const periods = Object.keys(periodMap)
      .map(k => ({ seq: +k, label: periodMap[+k] }))
      .sort((a, b) => a.seq - b.seq);

    return { periods, data };
  }

  private makeChart(section: string, category: string, color: string, isCurrency: boolean): Partial<ChartOptions> {
    if (!this.aggResult) { return {}; }
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
        const qs   = Math.floor(d.getMonth() / 3);
        const qfd  = Math.floor(fd.getMonth() / 3);
        const qseq = (d.getFullYear() - fd.getFullYear()) * 4 + qs - qfd;
        return { seq: qseq, label: 'Q' + (qs + 1) + ' ' + d.getFullYear() };
      }
      case 'Yearly':
        return { seq: d.getFullYear() - fd.getFullYear(), label: d.getFullYear().toString() };
      default:
        return { seq: dd, label: tdate.substring(0, 10) };
    }
  }

  setOpdTab(tab: string): void     { this.opdTab     = tab; this.opdChart     = this.makeChart('OPD',     tab, '#2563eb', false); }
  setIpdTab(tab: string): void     { this.ipdTab     = tab; this.ipdChart     = this.makeChart('IPD',     tab, '#0d9488', false); }
  setSurgeryTab(tab: string): void { this.surgeryTab  = tab; this.surgeryChart = this.makeChart('Surgery', tab, '#ea580c', false); }
  setRevenueTab(tab: string): void { this.revenueTab  = tab; this.revenueChart = this.makeChart('Revenue', tab, '#16a34a', true); }

  // ── Doctor-wise tab logic ─────────────────────────────────────────

  private buildDoctorTable(): void {
    const map = new Map<number, DoctorSummaryRow>();

    for (const r of this.rawDoctRows) {
      if (!map.has(r.Doctor_id)) {
        map.set(r.Doctor_id, {
          doctorId: r.Doctor_id, doctorNm: r.Doctor_nm,
          opdPmjay: 0, opdPrivate: 0, opdOthers: 0, opdTotal: 0,
          ipdPmjay: 0, ipdPrivate: 0, ipdOthers: 0, ipdTotal: 0,
          surSupra: 0, surMajor:   0, surMinor:  0, surTotal: 0,
          revHosp:  0, revDiag:    0, revPharm:  0, revTotal: 0,
        });
      }
      const row = map.get(r.Doctor_id)!;
      const v   = r.Value || 0;

      if (r.Section === 'OPD') {
        if (r.Category === 'PMJY+')   { row.opdPmjay  += v; }
        else if (r.Category === 'Private') { row.opdPrivate += v; }
        else if (r.Category === 'Others')  { row.opdOthers  += v; }
        row.opdTotal += v;
      } else if (r.Section === 'IPD') {
        if (r.Category === 'PMJY+')   { row.ipdPmjay  += v; }
        else if (r.Category === 'Private') { row.ipdPrivate += v; }
        else if (r.Category === 'Others')  { row.ipdOthers  += v; }
        row.ipdTotal += v;
      } else if (r.Section === 'Surgery') {
        if (r.Category === 'Supra')  { row.surSupra += v; }
        else if (r.Category === 'Major') { row.surMajor += v; }
        else if (r.Category === 'Minor') { row.surMinor += v; }
        row.surTotal += v;
      } else if (r.Section === 'Revenue') {
        if (r.Category === 'Hospital')   { row.revHosp  += v; }
        else if (r.Category === 'Diagnostic') { row.revDiag  += v; }
        else if (r.Category === 'Pharmacy')   { row.revPharm += v; }
        row.revTotal += v;
      }
    }

    this.doctorRows = Array.from(map.values());
    this.applySort();
    this.buildDoctorChart();
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir   = 'desc';
    }
    this.applySort();
  }

  private applySort(): void {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    this.sortedDoctorRows = [...this.doctorRows].sort((a, b) => {
      const av = (a as any)[this.sortField];
      const bv = (b as any)[this.sortField];
      if (typeof av === 'string') { return av.localeCompare(bv) * dir; }
      return ((av || 0) - (bv || 0)) * dir;
    });
  }

  buildDoctorChart(): void {
    const top = [...this.sortedDoctorRows]
      .sort((a, b) => ((b as any)[this.topNMetric] || 0) - ((a as any)[this.topNMetric] || 0))
      .slice(0, this.topN);

    const names  = top.map(r => r.doctorNm);
    const values = top.map(r => (r as any)[this.topNMetric] || 0);
    const metricLabel = this.topNMetricOptions.find(o => o.value === this.topNMetric)?.label ?? this.topNMetric;
    const isCurrency  = this.topNMetric === 'revTotal';

    this.doctorChart = {
      series:      [{ name: metricLabel, data: values }],
      chart:       { type: 'bar', height: Math.max(300, top.length * 28), toolbar: { show: false } },
      plotOptions: { bar: { borderRadius: 3, horizontal: true, barHeight: '60%' } },
      xaxis:       { categories: names, labels: { style: { fontSize: '11px' } } },
      yaxis:       { labels: { style: { fontSize: '11px' } } },
      dataLabels:  { enabled: true, style: { fontSize: '10px' } },
      colors:      ['#6366f1'],
      legend:      { show: false },
      tooltip:     { y: { formatter: (v: number) => isCurrency ? v.toLocaleString('en-IN') : v.toString() } },
      stroke:      { width: 0 },
    };
  }

  // ── Export ────────────────────────────────────────────────────────

  private toAbsoluteUrl(serverUrl: string): string {
    if (serverUrl.startsWith('/')) { return environment.apiUrl + serverUrl; }
    const file = serverUrl.replace(/\\/g, '/').split('/').filter(Boolean).pop() ?? serverUrl;
    return environment.apiUrl + '/Temp/' + file;
  }

  exportPdf(): void {
    const html = this.activeTab === 'doctor'
      ? this.buildDoctorExportHtml()
      : this.buildSummaryExportHtml();
    this.service.exportPdf(html)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: r => window.open(this.toAbsoluteUrl(r.url), '_blank') });
  }

  exportExcel(): void {
    const req = this.activeTab === 'doctor'
      ? this.buildDoctorExcelReq()
      : this.buildSummaryExcelReq();
    this.service.exportExcel(req)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: r => window.open(this.toAbsoluteUrl(r.url), '_blank') });
  }

  private filterTitle(): string {
    const dept = this.deptId    ? (this.depts.find(d => d.id === this.deptId)?.nm       ?? '') : 'All Departments';
    const sub  = this.subdeptId ? (this.subdepts.find(d => d.id === this.subdeptId)?.nm  ?? '') : '';
    const doc  = this.doctorId  ? ('Dr. ' + (this.doctors.find(d => d.id === this.doctorId)?.nm ?? '')) : 'All Doctors';
    const cat  = this.doctcate  ? (this.categories.find(c => c.Cd === this.doctcate)?.vals ?? this.doctcate) : 'All Categories';
    return ['Doctor Performance Report', dept, sub, cat, doc].filter(Boolean).join(' | ');
  }

  private buildSummaryExportHtml(): string {
    const title   = this.filterTitle();
    const period  = `Period: ${this.fdate} to ${this.tdate} &nbsp;|&nbsp; Granularity: ${this.sGranularity}`;
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

    let html = `<style>@page { size: A4 landscape; }</style>`;
    html += `<div style="font-family:Arial;padding:16px;">`;
    html += `<h2 style="font-size:15px;margin:0 0 4px;">${title}</h2>`;
    html += `<p style="font-size:10px;color:#475569;margin:0 0 12px;">${period}</p>`;
    html += `<table style="border-collapse:collapse;width:100%;">`;

    for (const sec of sections) {
      html += `<tr><td colspan="${colCount}" style="${secStyle}">${sec.label}</td></tr>`;
      html += `<tr><th style="${thLStyle}">Category</th>`;
      for (const p of periods) { html += `<th style="${thStyle}">${p}</th>`; }
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

  private buildSummaryExcelReq(): ExcelExportReq {
    const title   = this.filterTitle();
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

  private buildDoctorExportHtml(): string {
    const title  = this.filterTitle();
    const period = `Period: ${this.fdate} to ${this.tdate}`;

    const thS  = 'border:1px solid #94a3b8;padding:5px 8px;background:#1e3a5f;color:#fff;font-size:10px;text-align:right;white-space:nowrap;';
    const thLS = 'border:1px solid #94a3b8;padding:5px 8px;background:#1e3a5f;color:#fff;font-size:10px;text-align:left;white-space:nowrap;';
    const thG  = 'border:1px solid #94a3b8;padding:5px 8px;background:#334155;color:#fff;font-size:10px;text-align:center;white-space:nowrap;';
    const tdS  = 'border:1px solid #e2e8f0;padding:4px 8px;font-size:10px;text-align:right;';
    const tdLS = 'border:1px solid #e2e8f0;padding:4px 8px;font-size:10px;';
    const tdTB = 'font-weight:bold;';

    let html = `<style>@page { size: A4 landscape; }</style>`;
    html += `<div style="font-family:Arial;padding:16px;">`;
    html += `<h2 style="font-size:15px;margin:0 0 4px;">${title}</h2>`;
    html += `<p style="font-size:10px;color:#475569;margin:0 0 12px;">${period}</p>`;
    html += `<table style="border-collapse:collapse;width:100%;">`;
    html += `<tr>`;
    html += `<th rowspan="2" style="${thLS}">Doctor</th>`;
    html += `<th colspan="4" style="${thG}">OPD</th>`;
    html += `<th colspan="4" style="${thG}">IPD</th>`;
    html += `<th colspan="4" style="${thG}">Surgery</th>`;
    html += `<th colspan="4" style="${thG}">Revenue</th>`;
    html += `</tr><tr>`;
    for (const hdr of ['PMJAY+','Private','Others','Total','PMJAY+','Private','Others','Total','Supra','Major','Minor','Total','Hospital','Diagnostic','Pharmacy','Total']) {
      html += `<th style="${thS}">${hdr}</th>`;
    }
    html += `</tr>`;

    for (const r of this.sortedDoctorRows) {
      html += `<tr>`;
      html += `<td style="${tdLS}">${r.doctorNm}</td>`;
      html += `<td style="${tdS}">${r.opdPmjay}</td><td style="${tdS}">${r.opdPrivate}</td><td style="${tdS}">${r.opdOthers}</td><td style="${tdS}${tdTB}">${r.opdTotal}</td>`;
      html += `<td style="${tdS}">${r.ipdPmjay}</td><td style="${tdS}">${r.ipdPrivate}</td><td style="${tdS}">${r.ipdOthers}</td><td style="${tdS}${tdTB}">${r.ipdTotal}</td>`;
      html += `<td style="${tdS}">${r.surSupra}</td><td style="${tdS}">${r.surMajor}</td><td style="${tdS}">${r.surMinor}</td><td style="${tdS}${tdTB}">${r.surTotal}</td>`;
      html += `<td style="${tdS}">${r.revHosp.toLocaleString('en-IN')}</td><td style="${tdS}">${r.revDiag.toLocaleString('en-IN')}</td><td style="${tdS}">${r.revPharm.toLocaleString('en-IN')}</td><td style="${tdS}${tdTB}">${r.revTotal.toLocaleString('en-IN')}</td>`;
      html += `</tr>`;
    }
    html += `</table></div>`;
    return html;
  }

  private buildDoctorExcelReq(): ExcelExportReq {
    const title = this.filterTitle();
    const headers = [
      'Doctor',
      'OPD PMJAY+', 'OPD Private', 'OPD Others', 'OPD Total',
      'IPD PMJAY+', 'IPD Private', 'IPD Others', 'IPD Total',
      'Sur Supra',  'Sur Major',   'Sur Minor',  'Sur Total',
      'Rev Hospital','Rev Diagnostic','Rev Pharmacy','Rev Total',
    ];
    const rows: ExcelExportRow[] = this.sortedDoctorRows.map(r => ({
      Label:      r.doctorNm,
      Values:     [
        r.opdPmjay, r.opdPrivate, r.opdOthers, r.opdTotal,
        r.ipdPmjay, r.ipdPrivate, r.ipdOthers, r.ipdTotal,
        r.surSupra, r.surMajor,   r.surMinor,  r.surTotal,
        r.revHosp,  r.revDiag,    r.revPharm,  r.revTotal,
      ],
      IsTotal:    false,
      IsCurrency: false,
      IsSection:  false,
    }));
    return { Title: title, Headers: headers, Rows: rows };
  }
}

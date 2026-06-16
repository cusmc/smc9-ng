import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { HimsDashboardService } from './dashboard.service';
import { ToastService } from '../../core/toast/toast.service';
import {
  DashboardBundle,
  DailySummary,
  DeptDetail,
  InvestigationItem,
  PhysioItem,
  SurgeonItem,
} from './dashboard.models';

export type DonutOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  fill: ApexFill;
  tooltip: ApexTooltip;
  colors: string[];
  plotOptions: ApexPlotOptions;
};

export type BarOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  colors: string[];
  tooltip: ApexTooltip;
  legend: ApexLegend;
};

export type RadialOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke;
};

@Component({
  selector: 'app-hims-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class HimsDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  readonly todayIso = new Date().toISOString().split('T')[0];

  // selectedFromDate = this.todayIso;  // Uncomment after SP supports date range
  selectedToDate = this.todayIso;

  loading    = false;
  errorMsg: string | null = null;
  lastRefreshed: Date | null = null;

  // ── KPI counters ──────────────────────────────────────────────────────────
  totalOpdPatients      = 0;
  erPatients            = 0;
  totalAdmissions       = 0;
  totalDischarges       = 0;
  currentInpatients     = 0;
  inpatientRetentionPct = 0;   // Rem / (Rem + Dis) * 100 — proxy for census
  majorOt               = 0;
  minorOt               = 0;
  dayCareOt             = 0;
  totalOtCases          = 0;
  totalPathoCases       = 0;
  totalRadioCases       = 0;
  totalPhysio           = 0;
  totalOpdDept          = 0;
  totalMajor            = 0;
  totalMinor            = 0;
  totalDayCare          = 0;

  // ── Raw data ──────────────────────────────────────────────────────────────
  summary: DailySummary = { Opd_Gen: 0, Opd_Casu: 0 };
  deptDetails:    DeptDetail[]        = [];
  investigations: InvestigationItem[] = [];
  physioData:     PhysioItem[]        = [];
  surgeonData:    SurgeonItem[]       = [];

  // ── Charts ────────────────────────────────────────────────────────────────
  inpatientsGauge!:    Partial<RadialOptions>;
  opdBreakdownDonut!:  Partial<DonutOptions>;
  otDonut!:            Partial<DonutOptions>;
  invDonut!:           Partial<DonutOptions>;
  deptActivityBar!:    Partial<BarOptions>;
  pathBar!:            Partial<BarOptions>;
  radioBar!:           Partial<BarOptions>;
  physioBar!:          Partial<BarOptions>;
  surgeonBar!:         Partial<BarOptions>;
  inpatientBar!:       Partial<BarOptions>;

  constructor(
    private service: HimsDashboardService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void  { this.loadData(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  refresh(): void { this.loadData(); }

  loadData(): void {
    this.loading  = true;
    this.errorMsg = null;

    this.service.loadAll(
      this.selectedToDate,
      // this.selectedFromDate,  // Uncomment after SP supports date range
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bundle) => {
          this.processBundle(bundle);
          this.loading       = false;
          this.lastRefreshed = new Date();
        },
        error: () => {
          this.loading  = false;
          this.errorMsg = 'Failed to load dashboard data. Please try again.';
          this.toast.showLoadError('Dashboard');
        },
      });
  }

  private processBundle(b: DashboardBundle): void {
    this.summary        = b.summary?.[0]   ?? { Opd_Gen: 0, Opd_Casu: 0 };
    this.deptDetails    = b.deptDetails    ?? [];
    this.investigations = b.investigations ?? [];
    this.physioData     = b.physio         ?? [];
    this.surgeonData    = b.surgeons       ?? [];

    this.computeKpis();
    this.buildCharts();
  }

  private computeKpis(): void {
    const d = this.deptDetails;

    this.totalOpdPatients  = (this.summary.Opd_Gen || 0) + (this.summary.Opd_Casu || 0);
    this.erPatients        = this.summary.Opd_Casu || 0;
    this.totalAdmissions   = d.reduce((s, x) => s + (x.Adm     || 0), 0);
    this.totalDischarges   = d.reduce((s, x) => s + (x.Dis     || 0), 0);
    this.currentInpatients = d.reduce((s, x) => s + (x.Rem     || 0), 0);
    this.totalOpdDept      = d.reduce((s, x) => s + (x.Opd     || 0), 0);

    const caseBase = this.currentInpatients + this.totalDischarges;
    this.inpatientRetentionPct = caseBase > 0
      ? Math.round((this.currentInpatients / caseBase) * 100) : 0;

    this.majorOt    = d.reduce((s, x) => s + (x.Major   || 0), 0);
    this.minorOt    = d.reduce((s, x) => s + (x.Minor   || 0), 0);
    this.dayCareOt  = d.reduce((s, x) => s + (x.DayCare || 0), 0);
    this.totalOtCases = this.majorOt + this.minorOt + this.dayCareOt;
    this.totalMajor   = this.majorOt;
    this.totalMinor   = this.minorOt;
    this.totalDayCare = this.dayCareOt;

    const patho  = this.investigations.filter(i => i.Group_id === 1);
    const radio  = this.investigations.filter(i => i.Group_id === 2);
    this.totalPathoCases = patho.reduce((s, i) => s + (i.Qnt || 0), 0);
    this.totalRadioCases = radio.reduce((s, i) => s + (i.Qnt || 0), 0);
    this.totalPhysio     = this.physioData.reduce((s, p) => s + (p.Total || 0), 0);
  }

  private buildCharts(): void {
    this.inpatientsGauge = this.makeSemiGauge(
      this.inpatientRetentionPct, 'Inpatients', '#1e3a5f'
    );

    this.opdBreakdownDonut = this.makeDonut(
      ['General OPD', 'Casualty OPD'],
      [this.summary.Opd_Gen || 0, this.summary.Opd_Casu || 0],
      ['#2563eb', '#ea580c'],
      (v: number) => v + ' patients',
      'OPD'
    );

    this.otDonut = this.makeDonut(
      ['Major', 'Minor', 'Day Care'],
      [this.majorOt, this.minorOt, this.dayCareOt],
      ['#ea580c', '#f97316', '#fbbf24'],
      (v: number) => v + ' cases',
      'Total OT'
    );

    this.invDonut = this.makeDonut(
      ['Pathology', 'Radiology'],
      [this.totalPathoCases, this.totalRadioCases],
      ['#0d9488', '#7c3aed'],
      (v: number) => v + ' tests',
      'Tests'
    );

    this.deptActivityBar = this.makeDeptActivityBar();

    const patho = this.investigations.filter(i => i.Group_id === 1);
    const radio = this.investigations.filter(i => i.Group_id === 2);
    this.pathBar  = this.makeHorizBar(patho.map(i => i.Sgroup_nm), patho.map(i => i.Qnt), '#0d9488', 'Count');
    this.radioBar = this.makeHorizBar(radio.map(i => i.Sgroup_nm), radio.map(i => i.Qnt), '#7c3aed', 'Count');

    this.physioBar    = this.makePhysioBar();
    this.surgeonBar   = this.makeSurgeonBar();
    this.inpatientBar = this.makeInpatientBar();
  }

  // ── Semicircle gauge (matching the image's Bed Occupancy widget) ──────────
  private makeSemiGauge(pct: number, label: string, color: string): Partial<RadialOptions> {
    return {
      series:  [pct],
      chart:   { type: 'radialBar', height: 200, sparkline: { enabled: true } },
      labels:  [label],
      colors:  [color],
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle:    90,
          hollow:      { size: '62%' },
          track:       { background: '#e5e7eb', strokeWidth: '100%', margin: 5 } as any,
          dataLabels:  {
            name:  { show: false },
            value: {
              offsetY: -12,
              fontSize:   '28px',
              fontWeight: '800',
              color:      '#1e293b',
              formatter:  (v: number) => Math.round(v) + '%',
            },
          },
        },
      },
      fill:   { type: 'solid' },
      stroke: { lineCap: 'round' },
    };
  }

  // ── Donut with center label ───────────────────────────────────────────────
  private makeDonut(
    labels: string[], series: number[], colors: string[],
    tooltipFmt: (v: number) => string,
    centerLabel: string
  ): Partial<DonutOptions> {
    const total = series.reduce((a, b) => a + b, 0);
    return {
      series,
      chart:      { type: 'donut', height: 250, toolbar: { show: false } },
      labels,
      colors,
      legend:     { position: 'bottom', fontSize: '11px', itemMargin: { horizontal: 6 } },
      dataLabels: { enabled: false },
      stroke:     { width: 2 },
      fill:       { opacity: 1 },
      tooltip:    { y: { formatter: tooltipFmt } },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              total: {
                show:      true,
                showAlways: true,
                label:     centerLabel,
                fontSize:  '12px',
                color:     '#9ca3af',
                formatter: () => total.toString(),
              },
              value: {
                show:       true,
                fontSize:   '20px',
                fontWeight: '700',
                color:      '#1e293b',
              },
            },
          },
        },
      },
    };
  }

  // ── Grouped bar: OPD / Adm / Dis by dept ─────────────────────────────────
  private makeDeptActivityBar(): Partial<BarOptions> {
    const depts = this.deptDetails.filter(
      d => (d.Opd || 0) + (d.Adm || 0) + (d.Dis || 0) > 0
    );
    return {
      series: [
        { name: 'OPD',        data: depts.map(d => d.Opd || 0) },
        { name: 'Admissions', data: depts.map(d => d.Adm || 0) },
        { name: 'Discharges', data: depts.map(d => d.Dis || 0) },
      ],
      chart: { type: 'bar', height: 300, stacked: false, toolbar: { show: false } },
      plotOptions: { bar: { borderRadius: 3, columnWidth: '65%' } },
      xaxis: {
        categories: depts.map(d => d.DeptName),
        labels:     { rotate: -35, style: { fontSize: '10px' } },
      },
      yaxis:      { labels: { style: { fontSize: '11px' } } },
      dataLabels: { enabled: false },
      colors:     ['#2563eb', '#0d9488', '#ea580c'],
      legend:     { position: 'top', fontSize: '12px' },
      tooltip:    { shared: true, intersect: false },
    };
  }

  private makeInpatientBar(): Partial<BarOptions> {
    const depts = this.deptDetails.filter(d => (d.Rem || 0) > 0);
    return {
      series: [{ name: 'Inpatients', data: depts.map(d => d.Rem || 0) }],
      chart:  { type: 'bar', height: Math.max(160, depts.length * 34), toolbar: { show: false } },
      plotOptions: {
        bar: { horizontal: true, borderRadius: 4, dataLabels: { position: 'top' } },
      },
      xaxis:      { categories: depts.map(d => d.DeptName) },
      yaxis:      { labels: { style: { fontSize: '11px' } } },
      dataLabels: { enabled: true, offsetX: 6, style: { fontSize: '11px', colors: ['#444'] } },
      colors:     ['#1e3a5f'],
      legend:     { show: false },
      tooltip:    { y: { formatter: (v: number) => v + ' patients' } },
    };
  }

  private makeHorizBar(
    categories: string[], data: number[], color: string, seriesName: string
  ): Partial<BarOptions> {
    return {
      series: [{ name: seriesName, data }],
      chart:  { type: 'bar', height: Math.max(160, categories.length * 36), toolbar: { show: false } },
      plotOptions: {
        bar: { horizontal: true, borderRadius: 4, dataLabels: { position: 'top' } },
      },
      xaxis:      { categories },
      yaxis:      { labels: { style: { fontSize: '11px' } } },
      dataLabels: { enabled: true, offsetX: 6, style: { fontSize: '11px', colors: ['#444'] } },
      colors:     [color],
      legend:     { show: false },
      tooltip:    { y: { formatter: (v: number) => v.toString() } },
    };
  }

  private makePhysioBar(): Partial<BarOptions> {
    const data = this.physioData;
    return {
      series: [
        { name: 'New Cases', data: data.map(p => p.New_case || 0) },
        { name: 'Old Cases', data: data.map(p => p.Old_case || 0) },
      ],
      chart:       { type: 'bar', height: 260, stacked: false, toolbar: { show: false } },
      plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
      xaxis: {
        categories: data.map(p => p.DeptName),
        labels:     { rotate: -30, style: { fontSize: '10px' } },
      },
      yaxis:      { labels: { style: { fontSize: '11px' } } },
      dataLabels: { enabled: false },
      colors:     ['#7c3aed', '#c4b5fd'],
      legend:     { position: 'top', fontSize: '12px' },
      tooltip:    { shared: true, intersect: false },
    };
  }

  private makeSurgeonBar(): Partial<BarOptions> {
    const sorted = [...this.surgeonData]
      .sort((a, b) => (b.Total || 0) - (a.Total || 0))
      .slice(0, 15);
    return {
      series: [{ name: 'Surgeries', data: sorted.map(s => s.Total || 0) }],
      chart:  { type: 'bar', height: Math.max(200, sorted.length * 38), toolbar: { show: false } },
      plotOptions: {
        bar: { horizontal: true, borderRadius: 4, dataLabels: { position: 'top' } },
      },
      xaxis:      { categories: sorted.map(s => s.Doctname) },
      yaxis:      { labels: { style: { fontSize: '11px' } } },
      dataLabels: { enabled: true, offsetX: 6, style: { fontSize: '11px', colors: ['#444'] } },
      colors:     ['#ea580c'],
      legend:     { show: false },
      tooltip:    { y: { formatter: (v: number) => v.toString() } },
    };
  }
}

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
  // Note: Ward_bed / Icu_bed / Ward_rem / Icu_rem are NOT returned by hDashboardDt1 SP.
  // Use Rem (current inpatients) as the only reliable inpatient metric.
  totalOpdPatients  = 0;
  erPatients        = 0;
  totalAdmissions   = 0;
  totalDischarges   = 0;
  currentInpatients = 0;   // Σ Rem
  majorOt           = 0;
  minorOt           = 0;
  dayCareOt         = 0;
  totalOtCases      = 0;
  totalPathoCases   = 0;
  totalRadioCases   = 0;
  totalPhysio       = 0;
  totalOpdDept      = 0;
  totalMajor        = 0;
  totalMinor        = 0;
  totalDayCare      = 0;

  // ── Raw data ──────────────────────────────────────────────────────────────
  summary: DailySummary = { Opd_Gen: 0, Opd_Casu: 0 };
  deptDetails: DeptDetail[]       = [];
  investigations: InvestigationItem[] = [];
  physioData: PhysioItem[]        = [];
  surgeonData: SurgeonItem[]      = [];

  // ── Chart options ─────────────────────────────────────────────────────────
  opdBreakdownDonut!: Partial<DonutOptions>;   // Gen vs Casualty OPD
  deptActivityBar!:   Partial<BarOptions>;
  invDonut!:          Partial<DonutOptions>;
  otDonut!:           Partial<DonutOptions>;
  pathBar!:           Partial<BarOptions>;
  radioBar!:          Partial<BarOptions>;
  physioBar!:         Partial<BarOptions>;
  surgeonBar!:        Partial<BarOptions>;
  inpatientBar!:      Partial<BarOptions>;     // Rem by dept

  constructor(
    private service: HimsDashboardService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void  { this.loadData(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  refresh(): void { this.loadData(); }

  private loadData(): void {
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

    this.majorOt    = d.reduce((s, x) => s + (x.Major   || 0), 0);
    this.minorOt    = d.reduce((s, x) => s + (x.Minor   || 0), 0);
    this.dayCareOt  = d.reduce((s, x) => s + (x.DayCare || 0), 0);
    this.totalOtCases = this.majorOt + this.minorOt + this.dayCareOt;
    this.totalMajor   = this.majorOt;
    this.totalMinor   = this.minorOt;
    this.totalDayCare = this.dayCareOt;

    this.totalPathoCases = this.investigations
      .filter(i => i.Group_id === 1)
      .reduce((s, i) => s + (i.Qnt || 0), 0);
    this.totalRadioCases = this.investigations
      .filter(i => i.Group_id === 2)
      .reduce((s, i) => s + (i.Qnt || 0), 0);
    this.totalPhysio = this.physioData.reduce((s, p) => s + (p.Total || 0), 0);
  }

  private buildCharts(): void {
    this.opdBreakdownDonut = this.makeDonut(
      ['General OPD', 'Casualty OPD'],
      [this.summary.Opd_Gen || 0, this.summary.Opd_Casu || 0],
      ['#1a8f72', '#ef6c00'],
      (v: number) => v + ' patients'
    );
    this.deptActivityBar = this.makeDeptActivityBar();
    this.otDonut  = this.makeDonut(
      ['Major', 'Minor', 'Day Care'],
      [this.majorOt, this.minorOt, this.dayCareOt],
      ['#ef6c00', '#fb8c00', '#ffa726'],
      (v: number) => v + ' cases'
    );
    this.invDonut = this.makeDonut(
      ['Pathology', 'Radiology'],
      [this.totalPathoCases, this.totalRadioCases],
      ['#1a8f72', '#5c6bc0'],
      (v: number) => v + ' tests'
    );
    this.pathBar  = this.makeHorizBar(
      this.investigations.filter(i => i.Group_id === 1).map(i => i.Sgroup_nm),
      this.investigations.filter(i => i.Group_id === 1).map(i => i.Qnt),
      '#1a8f72', 'Tests'
    );
    this.radioBar = this.makeHorizBar(
      this.investigations.filter(i => i.Group_id === 2).map(i => i.Sgroup_nm),
      this.investigations.filter(i => i.Group_id === 2).map(i => i.Qnt),
      '#5c6bc0', 'Tests'
    );
    this.physioBar     = this.makePhysioBar();
    this.surgeonBar    = this.makeSurgeonBar();
    this.inpatientBar  = this.makeInpatientBar();
  }

  // ── Chart builders ────────────────────────────────────────────────────────

  private makeDonut(
    labels: string[], series: number[], colors: string[],
    tooltipFmt: (v: number) => string
  ): Partial<DonutOptions> {
    return {
      series,
      chart:      { type: 'donut', height: 240, toolbar: { show: false } },
      labels,
      colors,
      legend:     { position: 'bottom', fontSize: '12px' },
      dataLabels: { enabled: true, formatter: (v: number) => Math.round(v) + '%' },
      stroke:     { width: 2 },
      fill:       { opacity: 1 },
      tooltip:    { y: { formatter: tooltipFmt } },
    };
  }

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
      plotOptions: { bar: { borderRadius: 3, columnWidth: '60%' } },
      xaxis: {
        categories: depts.map(d => d.DeptName),
        labels:     { rotate: -35, style: { fontSize: '10px' } },
      },
      yaxis:      { labels: { style: { fontSize: '11px' } } },
      dataLabels: { enabled: false },
      colors:     ['#1a8f72', '#5c6bc0', '#ef6c00'],
      legend:     { position: 'top', fontSize: '12px' },
      tooltip:    { shared: true, intersect: false },
    };
  }

  private makeInpatientBar(): Partial<BarOptions> {
    const depts = this.deptDetails.filter(d => (d.Rem || 0) > 0);
    const height = Math.max(160, depts.length * 34);
    return {
      series: [{ name: 'Inpatients', data: depts.map(d => d.Rem || 0) }],
      chart:  { type: 'bar', height, toolbar: { show: false } },
      plotOptions: {
        bar: { horizontal: true, borderRadius: 4, dataLabels: { position: 'top' } },
      },
      xaxis:      { categories: depts.map(d => d.DeptName) },
      yaxis:      { labels: { style: { fontSize: '11px' } } },
      dataLabels: { enabled: true, offsetX: 6, style: { fontSize: '11px', colors: ['#444'] } },
      colors:     ['#1a8f72'],
      legend:     { show: false },
      tooltip:    { y: { formatter: (v: number) => v + ' patients' } },
    };
  }

  private makeHorizBar(
    categories: string[], data: number[], color: string, seriesName: string
  ): Partial<BarOptions> {
    const height = Math.max(160, categories.length * 36);
    return {
      series: [{ name: seriesName, data }],
      chart:  { type: 'bar', height, toolbar: { show: false } },
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
      colors:     ['#1a8f72', '#80cbc4'],
      legend:     { position: 'top', fontSize: '12px' },
      tooltip:    { shared: true, intersect: false },
    };
  }

  private makeSurgeonBar(): Partial<BarOptions> {
    const sorted = [...this.surgeonData]
      .sort((a, b) => (b.Total || 0) - (a.Total || 0))
      .slice(0, 15);
    const height = Math.max(200, sorted.length * 38);
    return {
      series: [{ name: 'Surgeries', data: sorted.map(s => s.Total || 0) }],
      chart:  { type: 'bar', height, toolbar: { show: false } },
      plotOptions: {
        bar: { horizontal: true, borderRadius: 4, dataLabels: { position: 'top' } },
      },
      xaxis:      { categories: sorted.map(s => s.Doctname) },
      yaxis:      { labels: { style: { fontSize: '11px' } } },
      dataLabels: { enabled: true, offsetX: 6, style: { fontSize: '11px', colors: ['#444'] } },
      colors:     ['#ef6c00'],
      legend:     { show: false },
      tooltip:    { y: { formatter: (v: number) => v.toString() } },
    };
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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

import { HostelDashboardService } from './hostel-dashboard.service';
import { PivotData, InstInfo } from './hostel-dashboard.models';

// One color per institute slot; reused cyclically if >6 institutes
const INST_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

export type StackedBarOptions = {
  series:      ApexAxisChartSeries;
  chart:       ApexChart;
  xaxis:       ApexXAxis;
  yaxis:       ApexYAxis;
  plotOptions: ApexPlotOptions;
  dataLabels:  ApexDataLabels;
  legend:      ApexLegend;
  fill:        ApexFill;
  colors:      string[];
  tooltip:     ApexTooltip;
  stroke:      ApexStroke;
};

export type DonutOptions = {
  series:      ApexNonAxisChartSeries;
  chart:       ApexChart;
  labels:      string[];
  legend:      ApexLegend;
  dataLabels:  ApexDataLabels;
  stroke:      ApexStroke;
  fill:        ApexFill;
  colors:      string[];
  tooltip:     ApexTooltip;
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'app-hostel-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './hostel-dashboard.component.html',
  styleUrls: ['./hostel-dashboard.component.scss'],
})
export class HostelDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading       = true;
  errorMsg: string | null = null;
  lastRefreshed: Date | null = null;

  pivot: PivotData | null = null;

  stackedBar: Partial<StackedBarOptions> = {};
  donut:      Partial<DonutOptions>      = {};
  genderBar:  Partial<StackedBarOptions> = {};
  horizBar:   Partial<StackedBarOptions> = {};

  constructor(private service: HostelDashboardService) {}

  ngOnInit(): void  { this.load(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  load(): void {
    this.loading  = true;
    this.errorMsg = null;
    this.service.load().pipe(takeUntil(this.destroy$)).subscribe({
      next: pivot => {
        this.pivot        = pivot;
        this.buildCharts(pivot);
        this.loading      = false;
        this.lastRefreshed = new Date();
      },
      error: () => {
        this.loading  = false;
        this.errorMsg = 'Failed to load hostel data. Please try again.';
      },
    });
  }

  instColor(idx: number): string {
    return INST_COLORS[idx % INST_COLORS.length];
  }

  cellKey(instCd: string, type: 'B' | 'G' | 'E'): string {
    return `${instCd}_${type}`;
  }

  formatInst(code: string): string {
    return code.split('_').join(' ');
  }

  private buildCharts(p: PivotData): void {
    const insts   = p.institutes;
    const bldgs   = p.buildings;
    const bNames  = bldgs.map(b => b.Building_nm);
    const colors  = insts.map((_, i) => INST_COLORS[i % INST_COLORS.length]);

    // ── 1. Stacked bar: institute total per building ──────────────────
    this.stackedBar = {
      series: insts.map(inst => ({
        name: this.formatInst(inst.Inst_cd),
        data: bldgs.map(b => b.instTotals[inst.Inst_id] ?? 0),
      })),
      chart: {
        type: 'bar', height: 310, stacked: true,
        toolbar: { show: false }, fontFamily: 'inherit',
      },
      xaxis:       { categories: bNames, labels: { style: { fontSize: '11px' } } },
      yaxis:       { labels: { formatter: (v: number) => String(v) } },
      plotOptions: { bar: { horizontal: false, columnWidth: '58%' } },
      dataLabels:  { enabled: false },
      legend:      { position: 'top', horizontalAlign: 'left', fontSize: '12px' },
      fill:        { opacity: 1 },
      stroke:      { width: 0 },
      colors,
      tooltip:     { y: { formatter: (v: number) => `${v} residents` } },
    };

    // ── 2. Donut: overall distribution by institute ───────────────────
    this.donut = {
      series: insts.map(inst => p.totalRow.instTotals[inst.Inst_id] ?? 0),
      chart:  { type: 'donut', height: 300, fontFamily: 'inherit' },
      labels: insts.map(i => this.formatInst(i.Inst_cd)),
      legend: { position: 'bottom', fontSize: '12px' },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${Math.round(val)}%`,
        style: { fontSize: '11px' },
      },
      stroke:      { width: 2, colors: ['#fff'] },
      fill:        { opacity: 1 },
      colors,
      tooltip:     { y: { formatter: (v: number) => `${v} residents` } },
      plotOptions: { pie: { donut: { size: '65%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '13px', fontWeight: 600 } } } } },
    };

    // ── 3. Grouped bar: Boys vs Girls per institute ───────────────────
    const boyData   = insts.map(inst =>
      bldgs.reduce((s, b) => s + (b.cells[`${inst.Inst_cd}_B`] ?? 0), 0));
    const girlData  = insts.map(inst =>
      bldgs.reduce((s, b) => s + (b.cells[`${inst.Inst_cd}_G`] ?? 0), 0));
    this.genderBar  = {
      series: [
        { name: 'Boys',  data: boyData  },
        { name: 'Girls', data: girlData },
      ],
      chart: {
        type: 'bar', height: 260,
        toolbar: { show: false }, fontFamily: 'inherit',
      },
      xaxis:       { categories: insts.map(i => this.formatInst(i.Inst_cd)), labels: { style: { fontSize: '11px' } } },
      yaxis:       { labels: { formatter: (v: number) => String(v) } },
      plotOptions: { bar: { horizontal: false, columnWidth: '50%', borderRadius: 3 } },
      dataLabels:  { enabled: true, style: { fontSize: '11px' } },
      stroke:      { width: 0 },
      fill:        { opacity: 0.9 },
      colors:      ['#3B82F6', '#EC4899'],
      legend:      { position: 'top' },
      tooltip:     { y: { formatter: (v: number) => `${v} students` } },
    };

    // ── 4. Horizontal bar: buildings sorted by total occupancy ────────
    const sorted = [...bldgs].sort((a, b) => b.total - a.total);
    this.horizBar = {
      series:      [{ name: 'Residents', data: sorted.map(b => b.total) }],
      chart: {
        type: 'bar', height: Math.max(220, sorted.length * 38),
        toolbar: { show: false }, fontFamily: 'inherit',
      },
      xaxis:       { categories: sorted.map(b => b.Building_nm), labels: { style: { fontSize: '11px' } } },
      yaxis:       {},
      plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 3 } },
      dataLabels:  { enabled: true, style: { fontSize: '11px', colors: ['#fff'] } },
      stroke:      { width: 0 },
      fill:        { opacity: 0.9 },
      colors:      ['#1e3a5f'],
      legend:      { show: false },
      tooltip:     { y: { formatter: (v: number) => `${v} residents` } },
    };
  }
}

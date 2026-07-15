import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import {
  ApexAnnotations,
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { AlosReportsService } from './alos-reports.service';
import { ToastService } from '../../core/toast/toast.service';
import {
  DeptAlosRow, DischargeStatusRow, IcuAlosRow, MonthlyTrendRow,
  DoctorAlosRow, BedCategoryAlosRow, UnitAlosRow,
} from './alos-reports.models';

export type TrendChartOptions = {
  series:      ApexAxisChartSeries;
  chart:       ApexChart;
  xaxis:       ApexXAxis;
  yaxis:       ApexYAxis;
  dataLabels:  ApexDataLabels;
  colors:      string[];
  legend:      ApexLegend;
  tooltip:     ApexTooltip;
  stroke:      ApexStroke;
  annotations: ApexAnnotations;
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

@Component({
  selector: 'app-alos-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './alos-reports.component.html',
  styleUrls: ['./alos-reports.component.scss'],
})
export class AlosReportsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  readonly todayIso = new Date().toISOString().split('T')[0];
  readonly firstOfMonthIso = (() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  })();
  readonly years = (() => {
    const y = new Date().getFullYear();
    return [y, y - 1, y - 2];
  })();

  fdate      = this.firstOfMonthIso;
  tdate      = this.todayIso;
  year       = new Date().getFullYear();
  targetAlos = 4;

  loading = false;
  loaded  = false;
  error: string | null = null;

  deptRows:        DeptAlosRow[]        = [];
  dischargeRows:    DischargeStatusRow[] = [];
  icuRows:          IcuAlosRow[]         = [];
  trendRows:        MonthlyTrendRow[]    = [];
  doctorRows:       DoctorAlosRow[]      = [];
  bedCategoryRows:  BedCategoryAlosRow[] = [];
  unitRows:         UnitAlosRow[]        = [];

  overallAlos      = 0;
  overallPatients  = 0;
  icuAlos          = 0;
  damaRate         = 0;
  dorRate          = 0;
  deathRate        = 0;
  absconRate       = 0;

  trendChart: Partial<TrendChartOptions> | null = null;

  constructor(
    private service: AlosReportsService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void { this.load(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  load(): void {
    this.loading = true;
    this.error   = null;

    forkJoin({
      dept:        this.service.getDeptWiseAlos(this.fdate, this.tdate),
      discharge:   this.service.getDischargeStatusRates(this.fdate, this.tdate),
      icu:         this.service.getIcuAlos(this.fdate, this.tdate),
      trend:       this.service.getMonthlyTrend(this.year),
      doctor:      this.service.getDoctorWiseAlos(this.fdate, this.tdate),
      bedCategory: this.service.getBedCategoryAlos(this.fdate, this.tdate),
      unit:        this.service.getUnitWiseAlos(this.fdate, this.tdate),
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: r => {
        this.deptRows         = r.dept;
        this.dischargeRows    = r.discharge;
        this.icuRows          = r.icu;
        this.trendRows        = r.trend;
        this.doctorRows       = r.doctor;
        this.bedCategoryRows  = r.bedCategory;
        this.unitRows         = r.unit;
        this.computeSummary();
        this.buildTrendChart();
        this.loading = false;
        this.loaded  = true;
      },
      error: () => {
        this.loading = false;
        this.error   = 'Failed to load ALOS report data.';
        this.toast.showLoadError('ALOS Reports');
      },
    });
  }

  onYearChange(): void {
    this.service.getMonthlyTrend(this.year)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: rows => { this.trendRows = rows; this.buildTrendChart(); },
        error: () => this.toast.showLoadError('Monthly Trend'),
      });
  }

  onTargetChange(): void {
    if (this.trendRows.length) this.buildTrendChart();
  }

  /** Individual ICU units, excluding the "ALL ICU" rollup row. */
  get icuUnitRows(): IcuAlosRow[] {
    return this.icuRows.filter(r => r.Nustno !== null);
  }

  private computeSummary(): void {
    let patients = 0;
    let weighted = 0;
    for (const r of this.deptRows) {
      patients += r.No_of_patient;
      weighted += r.No_of_patient * r.Alos;
    }
    this.overallPatients = patients;
    this.overallAlos     = patients > 0 ? Math.round((weighted / patients) * 100) / 100 : 0;

    const allIcu = this.icuRows.find(r => r.Nustno === null);
    this.icuAlos = allIcu ? allIcu.Alos : 0;

    const findRate = (type: string): number => {
      const row = this.dischargeRows.find(d => d.DisType === type);
      return row ? row.Pct : 0;
    };
    this.damaRate   = findRate('D.A.M.A.');
    this.dorRate    = findRate('D.O.R');
    this.deathRate  = findRate('Died');
    this.absconRate = findRate('Absconded');
  }

  private buildTrendChart(): void {
    const labels = this.trendRows.map(r => MONTH_NAMES[r.Mo - 1]);
    const values = this.trendRows.map(r => r.Alos);

    this.trendChart = {
      series:     [{ name: 'ALOS (days)', data: values }],
      chart:      { type: 'line', height: 300, toolbar: { show: false } },
      xaxis:      { categories: labels },
      yaxis:      { labels: { formatter: (v: number) => v.toFixed(1) } },
      dataLabels: { enabled: true, style: { fontSize: '10px' } },
      colors:     ['#0d9488'],
      legend:     { show: false },
      tooltip:    { y: { formatter: (v: number) => v.toFixed(2) + ' days' } },
      stroke:     { curve: 'smooth', width: 3 },
      annotations: {
        yaxis: [{
          y: this.targetAlos,
          borderColor: '#dc2626',
          strokeDashArray: 6,
          label: {
            text:  'Target: ' + this.targetAlos + 'd',
            style: { color: '#fff', background: '#dc2626' },
          },
        }],
      },
    };
  }
}

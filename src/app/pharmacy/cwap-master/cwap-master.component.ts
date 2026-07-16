import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CwapMasterService } from './cwap-master.service';
import { CompanyItem, OrigProductGroup, ProdListByCompItem } from './cwap-master.models';
import { PhSharedService, FirmOption, FirmYearItem, YearOption } from '../ph-shared.service';
import { ToastService } from '../../core/toast/toast.service';

interface ColumnFilters {
  code: string;
  product: string;
  company: string;
  mrp: string;
  rate: string;
  packing: string;
  ratio: string;
}

@Component({
  selector: 'app-cwap-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cwap-master.component.html',
  styleUrls: ['./cwap-master.component.scss']
})
export class CwapMasterComponent implements OnInit {
  private allFirmYears: FirmYearItem[] = [];
  firmList: FirmOption[] = [];
  yearList: YearOption[] = [];

  selectedFirm = '';
  selectedYear = '';

  companyList: CompanyItem[] = [];
  selectedCompany = 0;

  private rawData: ProdListByCompItem[] = [];
  groupedData: OrigProductGroup[] = [];

  filters: ColumnFilters = { code: '', product: '', company: '', mrp: '', rate: '', packing: '', ratio: '' };

  loading = false;
  exporting = false;
  currentPage = 1;
  readonly itemsPerPage = 15;

  constructor(
    private service: CwapMasterService,
    private shared: PhSharedService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.shared.getFirmYears().subscribe({
      next: (data) => {
        this.allFirmYears = data;
        this.firmList = this.shared.toFirmOptions(data);
        if (this.firmList.length > 0) {
          this.selectedFirm = this.firmList[0].id;
          this.refreshYearList();
          this.loadCompanyList();
        }
      },
      error: () => this.toast.show('Failed to load firm/year list.', { variant: 'error', duration: 5000 })
    });
  }

  onFirmChange(): void {
    this.refreshYearList();
    this.rawData = [];
    this.groupedData = [];
    this.selectedCompany = 0;
    this.loadCompanyList();
  }

  onYearChange(): void {
    this.rawData = [];
    this.groupedData = [];
  }

  private refreshYearList(): void {
    this.yearList = this.shared.toYearOptions(this.allFirmYears, this.selectedFirm);
    this.selectedYear = this.yearList.length > 0 ? this.yearList[0].id : '';
  }

  private loadCompanyList(): void {
    this.service.getCompanyList(this.selectedFirm).subscribe({
      next: (data) => {
        this.companyList = data;
        this.selectedCompany = data.length > 0 ? data[0].id : 0;
      },
      error: () => this.toast.show('Failed to load company list', { variant: 'error', duration: 5000 })
    });
  }

  loadData(): void {
    this.loading = true;

    this.service.getDatas({
      Firmx: this.selectedFirm,
      Yrx: this.selectedYear,
      Comp_id: this.selectedCompany,
      Output: 'SCREEN'
    }).subscribe({
      next: (data) => {
        this.rawData = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.toast.show('Failed to load product data', { variant: 'error', duration: 5000 });
        this.loading = false;
      }
    });
  }

  private groupByOrigProduct(rows: ProdListByCompItem[]): OrigProductGroup[] {
    const groups = new Map<number, OrigProductGroup>();
    for (const row of rows) {
      const key = row.Orig_prodno ?? 0;
      let group = groups.get(key);
      if (!group) {
        group = {
          Orig_prodno: row.Orig_prodno,
          Orig_prodname: row.Orig_prodname,
          Orig_comp: row.Orig_comp,
          Orig_mrp: row.Orig_mrp,
          Orig_taxableRate: row.Orig_taxableRate,
          alternatives: [],
          expanded: false
        };
        groups.set(key, group);
      }
      group.alternatives.push(row);
    }
    return Array.from(groups.values());
  }

  applyFilters(): void {
    const f = this.filters;
    const has = (value: unknown, text: string) =>
      !text || String(value ?? '').toLowerCase().includes(text.toLowerCase());

    const filtered = this.rawData.filter(row =>
      (has(row.Orig_prodno, f.code) || has(row.Alt_Prodno, f.code)) &&
      (has(row.Orig_prodname, f.product) || has(row.Alt_prodname, f.product)) &&
      (has(row.Orig_comp, f.company) || has(row.Alt_compname, f.company)) &&
      (has(row.Orig_mrp, f.mrp) || has(row.Alt_mrp, f.mrp)) &&
      (has(row.Orig_taxableRate, f.rate) || has(row.Alt_taxableRate, f.rate)) &&
      has(row.PACKING, f.packing) &&
      has(row.RATIO, f.ratio)
    );

    const groups = this.groupByOrigProduct(filtered);
    const hasActiveFilter = Object.values(f).some(v => !!v);
    if (hasActiveFilter) {
      groups.forEach(g => { g.expanded = true; });
    }

    this.groupedData = groups;
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.filters = { code: '', product: '', company: '', mrp: '', rate: '', packing: '', ratio: '' };
    this.applyFilters();
  }

  toggleGroup(group: OrigProductGroup): void {
    group.expanded = !group.expanded;
  }

  get pagedGroups(): OrigProductGroup[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.groupedData.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.groupedData.length / this.itemsPerPage);
  }

  private openBlob(blob: Blob, downloadName?: string): void {
    const url = URL.createObjectURL(blob);
    if (downloadName) {
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      a.click();
    } else {
      window.open(url, '_blank');
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  private exportReport(output: 'PDF' | 'XLS'): void {
    this.exporting = true;
    this.service.exportReport({
      Firmx: this.selectedFirm,
      Yrx: this.selectedYear,
      Comp_id: this.selectedCompany,
      Output: output
    }).subscribe({
      next: (blob) => {
        this.exporting = false;
        this.openBlob(blob, output === 'XLS' ? 'ProdListByComp.xlsx' : undefined);
      },
      error: () => {
        this.exporting = false;
        this.toast.show('Export failed', { variant: 'error', duration: 5000 });
      }
    });
  }

  viewPdf(): void {
    this.exportReport('PDF');
  }

  viewExcel(): void {
    this.exportReport('XLS');
  }
}

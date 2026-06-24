import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { PoRegisterService } from './po-register.service';
import { MfgItem, PartyItem, PoListItem, PrintRegBody, ProductItem } from './po-register.models';
import { PhSharedService, FirmOption, FirmYearItem, YearOption } from '../ph-shared.service';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-po-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './po-register.component.html',
  styleUrls: ['./po-register.component.scss']
})
export class PoRegisterComponent implements OnInit {
  private allFirmYears: FirmYearItem[] = [];
  firmList: FirmOption[] = [];
  yearList: YearOption[] = [];

  selectedFirm = '';
  selectedYear = '';

  allData: PoListItem[] = [];
  filteredData: PoListItem[] = [];
  mfgList: MfgItem[] = [];
  partyList: PartyItem[] = [];
  productList: ProductItem[] = [];

  selectedParty = 0;
  selectedProd  = 0;

  filterForm: FormGroup;
  partySearch = '';
  prodSearch  = '';

  loading  = false;
  printing = false;
  currentPage = 1;
  readonly itemsPerPage = 15;

  constructor(
    private service: PoRegisterService,
    private shared: PhSharedService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.filterForm = this.fb.group({
      status: ['A'],
      mfgId: [0]
    });
  }

  ngOnInit(): void {
    this.shared.getFirmYears().subscribe({
      next: (data) => {
        this.allFirmYears = data;
        this.firmList = this.shared.toFirmOptions(data);
        if (this.firmList.length > 0) {
          this.selectedFirm = this.firmList[0].id;
          this.refreshYearList();
          this.loadLookups();
        }
      },
      error: () => this.toast.show('Failed to load firm/year list.', { variant: 'error', duration: 5000 })
    });
  }

  onFirmChange(): void {
    this.refreshYearList();
    this.allData = [];
    this.filteredData = [];
    this.selectedParty = 0;
    this.selectedProd  = 0;
    this.loadLookups();
  }

  onYearChange(): void {
    this.allData = [];
    this.filteredData = [];
  }

  private refreshYearList(): void {
    this.yearList = this.shared.toYearOptions(this.allFirmYears, this.selectedFirm);
    this.selectedYear = this.yearList.length > 0 ? this.yearList[0].id : '';
  }

  private loadLookups(): void {
    this.service.getMfgList(this.selectedFirm).subscribe({
      next: (data) => { this.mfgList = data; },
      error: () => this.toast.show('Failed to load manufacturer list', { variant: 'error', duration: 5000 })
    });
    this.service.getPartyList(this.selectedFirm).subscribe({
      next: (data) => { this.partyList = data; },
      error: () => this.toast.show('Failed to load party list', { variant: 'error', duration: 5000 })
    });
    this.service.getProductList(this.selectedFirm).subscribe({
      next: (data) => { this.productList = data; },
      error: () => this.toast.show('Failed to load product list', { variant: 'error', duration: 5000 })
    });
  }

  loadData(): void {
    const { status, mfgId } = this.filterForm.value;
    this.loading = true;
    this.currentPage = 1;

    this.service.getDatas(
      this.selectedFirm, this.selectedYear,
      status || 'A',
      this.selectedProd, this.selectedParty, mfgId || 0
    ).subscribe({
      next: (data) => {
        this.allData = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.toast.show('Failed to load PO data', { variant: 'error', duration: 5000 });
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const party = this.partySearch.toLowerCase();
    const prod  = this.prodSearch.toLowerCase();
    this.filteredData = this.allData.filter(r =>
      (!party || (r.Account_nm ?? '').toLowerCase().includes(party)) &&
      (!prod  || (r.Prodname  ?? '').toLowerCase().includes(prod))
    );
    this.currentPage = 1;
  }

  get pagedData(): PoListItem[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  printReg(): void {
    const { status, mfgId } = this.filterForm.value;
    this.printing = true;

    this.service.printReg({
      Firm:       this.selectedFirm,
      Year:       this.selectedYear,
      Status:     status || 'A',
      Product_id: this.selectedProd,
      Party_id:   this.selectedParty,
      Int1:       mfgId || 0,
      Output:     'SCREEN'
    }).subscribe({
      next: (b64) => {
        this.printing = false;
        try {
          const binary = atob(b64);
          const bytes  = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes], { type: 'application/pdf' });
          window.open(URL.createObjectURL(blob), '_blank');
        } catch {
          this.toast.show('Failed to open PDF', { variant: 'error', duration: 5000 });
        }
      },
      error: () => {
        this.printing = false;
        this.toast.show('Print failed', { variant: 'error', duration: 5000 });
      }
    });
  }

  statusLabel(row: PoListItem): string {
    return (row.BalQnt ?? 0) === 0 ? 'Received' : 'Pending';
  }
}

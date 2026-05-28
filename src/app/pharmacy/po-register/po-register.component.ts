import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { PoRegisterService } from './po-register.service';
import { FirmItem, MfgItem, PoListItem } from './po-register.models';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-po-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './po-register.component.html',
  styleUrls: ['./po-register.component.scss']
})
export class PoRegisterComponent implements OnInit {
  allData: PoListItem[] = [];
  filteredData: PoListItem[] = [];
  mfgList: MfgItem[] = [];

  readonly firms: FirmItem[] = [
    { id: '0001', nm: 'Firm 1' },
    { id: '0002', nm: 'Firm 2' }
  ];
  selectedFirm = '0001';

  filterForm: FormGroup;
  partySearch = '';
  prodSearch = '';

  loading = false;
  printing = false;
  currentPage = 1;
  readonly itemsPerPage = 15;

  constructor(
    private service: PoRegisterService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.filterForm = this.fb.group({
      status: ['A'],
      mfgId: [0]
    });
  }

  ngOnInit(): void {
    this.service.getFirm().subscribe({
      next: (firm) => { this.selectedFirm = firm; },
      error: () => {}
    });
    this.loadMfgList();
  }

  onFirmChange(): void {
    this.service.setFirm(this.selectedFirm).subscribe({
      next: () => {
        this.allData = [];
        this.filteredData = [];
        this.loadMfgList();
      },
      error: () => this.toast.show('Failed to switch firm', { variant: 'error', duration: 5000 })
    });
  }

  private loadMfgList(): void {
    this.service.getMfgList().subscribe({
      next: (data) => { this.mfgList = data; },
      error: () => this.toast.show('Failed to load manufacturer list', { variant: 'error', duration: 5000 })
    });
  }

  loadData(): void {
    const { status, mfgId } = this.filterForm.value;
    this.loading = true;
    this.currentPage = 1;

    this.service.getDatas(status || 'A', mfgId || 0).subscribe({
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
      Status:     status || 'A',
      Product_id: 0,
      Party_id:   0,
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

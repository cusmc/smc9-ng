import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { RcMasterService } from './rc-master.service';
import { ToastService } from '../../core/toast/toast.service';
import { PhSharedService, FirmOption, FirmYearItem } from '../ph-shared.service';
import { IdNm, RcMastListItem, RcMastSaveDto, RcTranDto } from './rc-master.models';
import { RcLineDialogComponent } from './rc-line-dialog.component';

function partyOrMfgRequired(control: AbstractControl): ValidationErrors | null {
  const partyId = control.get('Party_id')?.value;
  const mfgId   = control.get('Mfg_id')?.value;
  return partyId || mfgId ? null : { partyOrMfgRequired: true };
}

function toDateAfterFromDate(control: AbstractControl): ValidationErrors | null {
  const fdate = control.get('Fdate')?.value;
  const tdate = control.get('Tdate')?.value;
  if (fdate && tdate && tdate < fdate) {
    return { toBeforeFrom: true };
  }
  return null;
}

@Component({
  selector: 'app-rc-master',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './rc-master.component.html',
  styleUrls: ['./rc-master.component.scss']
})
export class RcMasterComponent implements OnInit {
  view: 'list' | 'form' = 'list';
  mode: 'new' | 'edit' = 'new';
  currentId = 0;
  loading  = false;
  saving   = false;

  list: RcMastListItem[] = [];
  lines: RcTranDto[] = [];

  firms: FirmOption[] = [];
  selectedFirm = '';

  parties:  IdNm[] = [];
  mfgList:  IdNm[] = [];
  products: IdNm[] = [];
  rcTypes:  IdNm[] = [];

  searchText = '';

  form: FormGroup;

  get filteredList(): RcMastListItem[] {
    if (!this.searchText) { return this.list; }
    const q = this.searchText.toLowerCase();
    return this.list.filter(r =>
      (r.Account_nm || '').toLowerCase().includes(q) ||
      (r.Mfg_nm    || '').toLowerCase().includes(q) ||
      (r.Rc_no     || '').toLowerCase().includes(q) ||
      (r.Rc_type_nm|| '').toLowerCase().includes(q) ||
      (r.Status    || '').toLowerCase().includes(q) ||
      (r.Create_by || '').toLowerCase().includes(q)
    );
  }

  get activeLineCount(): number {
    return this.lines.filter(l => l.CanTag !== 'Y').length;
  }

  constructor(
    private service: RcMasterService,
    private shared: PhSharedService,
    private dialog: Dialog,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      Party_id:   [null],
      Mfg_id:     [null],
      Rc_no:      ['', Validators.required],
      Rc_type_id: [null, Validators.required],
      Fdate:      ['', Validators.required],
      Tdate:      ['', Validators.required],
      Status:     ['A', Validators.required]
    }, { validators: [partyOrMfgRequired, toDateAfterFromDate] });
  }

  ngOnInit(): void {
    this.shared.getFirmYears().subscribe({
      next: (data: FirmYearItem[]) => {
        this.firms = this.shared.toFirmOptions(data);
        if (this.firms.length > 0) {
          this.selectedFirm = this.firms[0].id;
          this.loadLookups();
          this.loadList();
        }
      },
      error: () => this.toast.show('Failed to load firm list', { variant: 'error', duration: 4000 })
    });

    this.service.getRcTypeList().subscribe({
      next: d => this.rcTypes = d,
      error: () => {}
    });
  }

  onFirmChange(): void {
    this.loadLookups();
    this.loadList();
    if (this.view === 'form') { this.view = 'list'; }
  }

  private loadLookups(): void {
    this.service.getPartyList(this.selectedFirm).subscribe({
      next: d => this.parties = d,
      error: () => this.toast.show('Failed to load parties', { variant: 'error', duration: 4000 })
    });
    this.service.getMfgList(this.selectedFirm).subscribe({
      next: d => this.mfgList = d,
      error: () => this.toast.show('Failed to load manufacturer list', { variant: 'error', duration: 4000 })
    });
    this.service.getProductList(this.selectedFirm).subscribe({
      next: d => this.products = d,
      error: () => {}
    });
  }

  loadList(): void {
    if (!this.selectedFirm) { return; }
    this.loading = true;
    this.service.getList(this.selectedFirm).subscribe({
      next: d => { this.list = d; this.loading = false; },
      error: () => { this.toast.show('Failed to load RC list', { variant: 'error', duration: 4000 }); this.loading = false; }
    });
  }

  addNew(): void {
    this.mode = 'new';
    this.currentId = 0;
    this.lines = [];
    this.form.reset({ Party_id: null, Mfg_id: null, Rc_no: '', Rc_type_id: null, Fdate: this.today(), Tdate: '', Status: 'A' });
    this.view = 'form';
  }

  editRecord(rc: RcMastListItem): void {
    this.mode = 'edit';
    this.currentId = rc.Rc_id;
    this.lines = [];
    this.service.getById(this.selectedFirm, rc.Rc_id).subscribe({
      next: d => {
        this.form.patchValue({
          Party_id:   d.Party_id,
          Mfg_id:     d.Mfg_id,
          Rc_no:      d.Rc_no,
          Rc_type_id: d.Rc_type_id,
          Fdate:      d.Fdate?.substring(0, 10) || '',
          Tdate:      d.Tdate?.substring(0, 10) || '',
          Status:     d.Status
        });
        this.lines = (d.SubData || []).map((l: any) => ({
          ...l,
          CanTag: 'N',
          Prod_nm: this.getProductName(l.Prod_id)
        }));
        this.view = 'form';
      },
      error: () => this.toast.show('Failed to load RC record', { variant: 'error', duration: 4000 })
    });
  }

  backToList(): void {
    this.view = 'list';
  }

  openLineDialog(line: RcTranDto | null = null): void {
    const ref = this.dialog.open<RcTranDto | null>(RcLineDialogComponent, {
      data: { line, products: this.products }
    });
    ref.closed.subscribe(result => {
      if (!result) { return; }
      if (line) {
        const idx = this.lines.indexOf(line);
        if (idx >= 0) { this.lines[idx] = result; }
        this.lines = [...this.lines];
      } else {
        this.lines = [...this.lines, result];
      }
    });
  }

  removeLine(line: RcTranDto): void {
    if (line.Rctran_id > 0) {
      this.lines = this.lines.map(l => l === line ? { ...l, CanTag: 'Y' } : l);
    } else {
      this.lines = this.lines.filter(l => l !== line);
    }
  }

  getProductName(prodId: number | null): string {
    if (!prodId) { return ''; }
    const p = this.products.find(x => x.id === prodId);
    return p ? p.nm : prodId.toString();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.hasError('partyOrMfgRequired')) {
        this.toast.show('Select at least a Party or Manufacturer', { variant: 'error', duration: 4000 });
      } else if (this.form.hasError('toBeforeFrom')) {
        this.toast.show('To Date must be on or after From Date', { variant: 'error', duration: 4000 });
      } else {
        this.toast.show('Please fill all required fields', { variant: 'error', duration: 4000 });
      }
      return;
    }

    if (this.activeLineCount === 0) {
      this.toast.show('Add at least one product line', { variant: 'error', duration: 4000 });
      return;
    }

    const f = this.form.value;
    const dto: RcMastSaveDto = {
      Rc_id:      this.currentId,
      Party_id:   f.Party_id || null,
      Mfg_id:     f.Mfg_id   || null,
      Rc_no:      f.Rc_no,
      Rc_type_id: f.Rc_type_id,
      Fdate:      f.Fdate,
      Tdate:      f.Tdate,
      Status:     f.Status,
      SubData:    this.lines
    };

    this.saving = true;
    this.service.save(this.selectedFirm, dto).subscribe({
      next: id => {
        this.currentId = id;
        this.mode = 'edit';
        this.saving = false;
        this.toast.show('RC saved successfully', { variant: 'success', duration: 3000 });
        this.loadList();
      },
      error: err => {
        this.toast.show(err?.error || 'Save failed', { variant: 'error', duration: 5000 });
        this.saving = false;
      }
    });
  }

  delete(): void {
    if (!this.currentId) { return; }
    if (!confirm('Delete this RC record and all its lines?')) { return; }
    this.service.delete(this.selectedFirm, this.currentId).subscribe({
      next: () => {
        this.toast.show('RC deleted', { variant: 'success', duration: 3000 });
        this.list = this.list.filter(r => r.Rc_id !== this.currentId);
        this.view = 'list';
      },
      error: err => this.toast.show(err?.error || 'Delete failed', { variant: 'error', duration: 5000 })
    });
  }

  statusLabel(s: string): string {
    return s === 'A' ? 'Active' : 'Inactive';
  }

  private today(): string {
    return new Date().toISOString().substring(0, 10);
  }
}

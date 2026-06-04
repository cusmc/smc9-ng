import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { WorkOrderService } from './work-order.service';
import { ToastService } from '../../core/toast/toast.service';
import {
  DeptItem,
  PartyItem,
  ProductItem,
  TenderItem,
  WorkOrderLineDto,
  WorkOrderListItem,
  WorkOrderSaveDto
} from './work-order.models';
import { WoLineDialogComponent } from './wo-line-dialog.component';
import { WoHistoryDialogComponent } from './wo-history-dialog.component';

@Component({
  selector: 'app-work-order',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './work-order.component.html',
  styleUrls: ['./work-order.component.scss']
})
export class WorkOrderComponent implements OnInit {
  form: FormGroup;
  lines: WorkOrderLineDto[] = [];

  parties: PartyItem[] = [];
  products: ProductItem[] = [];
  depts: DeptItem[] = [];
  tenders: TenderItem[] = [];

  saving  = false;
  mode: 'new' | 'edit' = 'new';
  currentPkId = 0;

  get totals() {
    const basic   = this.lines.reduce((s, l) => s + (l.Amount   || 0), 0);
    const disc    = this.lines.reduce((s, l) => s + (l.Disc_amt || 0), 0);
    const sgst    = this.lines.reduce((s, l) => s + (l.St_amt   || 0), 0);
    const cgst    = this.lines.reduce((s, l) => s + (l.Ex_amt   || 0), 0);
    const igst    = this.lines.reduce((s, l) => s + (l.Cst_amt  || 0), 0);
    const freight = +this.form.get('Freight')?.value || 0;
    const packing = +this.form.get('Packing')?.value || 0;
    const netbill = basic - disc + sgst + cgst + igst + freight + packing;
    return { basic, disc, sgst, cgst, igst, freight, packing, netbill };
  }

  constructor(
    private service: WorkOrderService,
    private dialog: Dialog,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      Wo_no:      [{ value: 0, disabled: true }],
      Wo_dt:      [this.todayStr(), Validators.required],
      Party_id:   [null, Validators.required],
      Party_nm:   [''],
      Dept_id:    [null],
      Account_id: [null],
      Quotno:     [''],
      Quotdt:     [null],
      Tendor_no:  [''],
      Tendor_dt:  [null],
      Delivery:   [''],
      Payterm:    [null],
      Payterms:   [''],
      Compl_dt:   [null],
      Narration:  [''],
      Sanc_by:    [''],
      Freight:    [0],
      Packing:    [0]
    });
  }

  ngOnInit(): void {
    this.loadLookups();
    this.newWO();
  }

  private loadLookups(): void {
    this.service.getPartyList().subscribe({
      next: d => this.parties = d,
      error: () => this.toast.show('Failed to load parties', { variant: 'error', duration: 4000 })
    });
    this.service.getProductList().subscribe({ next: d => this.products = d, error: () => {} });
    this.service.getDeptList().subscribe({ next: d => this.depts = d, error: () => {} });
    this.service.getTenderList().subscribe({ next: d => this.tenders = d, error: () => {} });
  }

  newWO(): void {
    this.mode = 'new';
    this.currentPkId = 0;
    this.lines = [];
    this.form.reset({
      Wo_no: 0, Wo_dt: this.todayStr(), Party_id: null, Party_nm: '',
      Dept_id: null, Account_id: null, Quotno: '', Quotdt: null,
      Tendor_no: '', Tendor_dt: null, Delivery: '', Payterm: null,
      Payterms: '', Compl_dt: null, Narration: '', Sanc_by: '',
      Freight: 0, Packing: 0
    });
    this.service.getNextWoNo().subscribe({
      next: n => this.form.patchValue({ Wo_no: n }),
      error: () => {}
    });
  }

  openHistory(): void {
    const ref = this.dialog.open<WorkOrderListItem | null>(WoHistoryDialogComponent, {
      data: { parties: this.parties }
    });
    ref.closed.subscribe(row => {
      if (!row) return;
      this.loadWO(row.Pk_id);
    });
  }

  private loadWO(pkId: number): void {
    this.service.getById(pkId).subscribe({
      next: detail => {
        this.mode = 'edit';
        this.currentPkId = pkId;
        const h = detail.Header;
        this.form.patchValue({
          Wo_no:      h.Wo_no,
          Wo_dt:      h.Wo_dt?.substring(0, 10),
          Party_id:   h.Party_id,
          Party_nm:   h.Party_nm,
          Dept_id:    h.Dept_id,
          Account_id: h.Account_id,
          Quotno:     h.Quotno,
          Quotdt:     h.Quotdt?.substring(0, 10) ?? null,
          Tendor_no:  h.Tendor_no,
          Tendor_dt:  h.Tendor_dt?.substring(0, 10) ?? null,
          Delivery:   h.Delivery,
          Payterm:    h.Payterm,
          Payterms:   h.Payterms,
          Compl_dt:   h.Compl_dt?.substring(0, 10) ?? null,
          Narration:  h.Narration,
          Sanc_by:    h.Sanc_by,
          Freight:    h.Freight,
          Packing:    h.Packing
        });
        this.lines = detail.Lines;
      },
      error: () => this.toast.show('Failed to load Work Order', { variant: 'error', duration: 4000 })
    });
  }

  onPartyChange(): void {
    const pid = this.form.get('Party_id')?.value;
    const found = this.parties.find(p => p.Party_id == pid);
    this.form.patchValue({ Party_nm: found ? found.Party_nm : '' });
  }

  openLineDialog(line: WorkOrderLineDto | null = null): void {
    const ref = this.dialog.open<WorkOrderLineDto | null>(WoLineDialogComponent, {
      data: { line, products: this.products, depts: this.depts, tenders: this.tenders }
    });
    ref.closed.subscribe(result => {
      if (!result) return;
      if (line) {
        const idx = this.lines.indexOf(line);
        if (idx >= 0) this.lines[idx] = result;
        this.lines = [...this.lines];
      } else {
        this.lines = [...this.lines, result];
      }
    });
  }

  removeLine(line: WorkOrderLineDto): void {
    this.lines = this.lines.filter(l => l !== line);
  }

  getProductName(prodno: number): string {
    const p = this.products.find(x => x.Prodno === prodno);
    return p ? p.Prodname : prodno.toString();
  }

  save(): void {
    if (this.form.invalid) { this.toast.show('Please fill required fields', { variant: 'error', duration: 4000 }); return; }
    if (this.lines.length === 0) { this.toast.show('Add at least one item', { variant: 'error', duration: 4000 }); return; }

    const t = this.totals;
    const dto: WorkOrderSaveDto = {
      Pk_id:      this.currentPkId,
      Wo_no:      this.form.get('Wo_no')?.value || 0,
      Wo_dt:      this.form.get('Wo_dt')?.value,
      Party_id:   this.form.get('Party_id')?.value,
      Party_nm:   this.form.get('Party_nm')?.value,
      Dept_id:    this.form.get('Dept_id')?.value,
      Account_id: this.form.get('Account_id')?.value,
      Quotno:     this.form.get('Quotno')?.value,
      Quotdt:     this.form.get('Quotdt')?.value || null,
      Tendor_no:  this.form.get('Tendor_no')?.value,
      Tendor_dt:  this.form.get('Tendor_dt')?.value || null,
      Delivery:   this.form.get('Delivery')?.value,
      Payterm:    this.form.get('Payterm')?.value,
      Payterms:   this.form.get('Payterms')?.value,
      Compl_dt:   this.form.get('Compl_dt')?.value || null,
      Narration:  this.form.get('Narration')?.value,
      Sanc_by:    this.form.get('Sanc_by')?.value,
      Totbill:    t.basic,
      Disc:       t.disc,
      Netbill:    t.netbill,
      Freight:    t.freight,
      Packing:    t.packing,
      Lines:      this.lines
    };

    this.saving = true;
    if (this.mode === 'new') {
      this.service.save(dto).subscribe({
        next: res => {
          this.toast.show('Work Order saved successfully', { variant: 'success', duration: 3000 });
          this.currentPkId = res.Pk_id;
          this.mode = 'edit';
          this.saving = false;
        },
        error: err => {
          this.toast.show(err?.error || 'Save failed', { variant: 'error', duration: 5000 });
          this.saving = false;
        }
      });
    } else {
      this.service.update(this.currentPkId, dto).subscribe({
        next: () => {
          this.toast.show('Work Order updated', { variant: 'success', duration: 3000 });
          this.saving = false;
        },
        error: err => {
          this.toast.show(err?.error || 'Update failed', { variant: 'error', duration: 5000 });
          this.saving = false;
        }
      });
    }
  }

  deleteWO(): void {
    if (!this.currentPkId) return;
    if (!confirm('Delete this Work Order?')) return;
    this.service.remove(this.currentPkId).subscribe({
      next: () => {
        this.toast.show('Work Order deleted', { variant: 'success', duration: 3000 });
        this.newWO();
      },
      error: err => this.toast.show(err?.error || 'Delete failed', { variant: 'error', duration: 5000 })
    });
  }

  private todayStr(): string {
    return new Date().toISOString().substring(0, 10);
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DeptItem, ProductItem, TenderItem, WorkOrderLineDto } from './work-order.models';

interface DialogData {
  line: WorkOrderLineDto | null;
  products: ProductItem[];
  depts: DeptItem[];
  tenders: TenderItem[];
}

@Component({
  selector: 'app-wo-line-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './wo-line-dialog.component.html',
  styleUrls: ['./wo-line-dialog.component.scss']
})
export class WoLineDialogComponent implements OnInit {
  form: FormGroup;
  prodSearch = '';

  get filteredProducts(): ProductItem[] {
    if (!this.prodSearch || this.prodSearch.length < 2) return [];
    const q = this.prodSearch.toLowerCase();
    return this.data.products.filter(p => p.Prodname.toLowerCase().includes(q));
  }

  constructor(
    @Inject(DIALOG_DATA) public data: DialogData,
    private dialogRef: DialogRef<WorkOrderLineDto | null, WoLineDialogComponent>,
    private fb: FormBuilder
  ) {
    const l = data.line;
    this.form = this.fb.group({
      Prodno:    [l ? l.Prodno : null, Validators.required],
      Descri:    [l ? l.Descri : ''],
      Speci:     [l ? l.Speci  : ''],
      Qnt:       [l ? l.Qnt    : 0,  Validators.required],
      Rate:      [l ? l.Rate   : 0,  Validators.required],
      Amount:    [l ? l.Amount : 0],
      Disc_per:  [l ? l.Disc_per : 0],
      Disc_amt:  [l ? l.Disc_amt : 0],
      St_per:    [l ? l.St_per   : 0],
      St_amt:    [l ? l.St_amt   : 0],
      Ex_per:    [l ? l.Ex_per   : 0],
      Ex_amt:    [l ? l.Ex_amt   : 0],
      Cst_per:   [l ? l.Cst_per  : 0],
      Cst_amt:   [l ? l.Cst_amt  : 0],
      Vat_per:   [l ? l.Vat_per  : 0],
      Vat_amt:   [l ? l.Vat_amt  : 0],
      Total:     [l ? l.Total    : 0],
      Ratio:     [l ? l.Ratio    : null],
      Dept_id:   [l ? l.Dept_id  : null],
      Tender_id: [l ? l.Tender_id : null],
      Make:      [l ? l.Make     : ''],
      Pk_id:     [l ? l.Pk_id    : 0]
    });
  }

  ngOnInit(): void {
    if (this.data.line) {
      const p = this.data.products.find(x => x.Prodno === this.data.line!.Prodno);
      if (p) this.prodSearch = p.Prodname;
    }
  }

  onProductChange(): void {
    this.recalc();
  }

  recalc(): void {
    const f = this.form.value;
    const qnt  = +f.Qnt  || 0;
    const rate = +f.Rate || 0;
    const amount = qnt * rate;

    const disc_per = +f.Disc_per || 0;
    const disc_amt = amount * disc_per / 100;
    const taxable  = amount - disc_amt;

    const st_per  = +f.St_per  || 0;
    const ex_per  = +f.Ex_per  || 0;
    const cst_per = +f.Cst_per || 0;

    const st_amt  = taxable * st_per  / 100;
    const ex_amt  = taxable * ex_per  / 100;
    const cst_amt = taxable * cst_per / 100;
    const vat_per = st_per + ex_per + cst_per;
    const vat_amt = st_amt + ex_amt + cst_amt;
    const total   = taxable + vat_amt;

    this.form.patchValue({
      Amount: +amount.toFixed(2),
      Disc_amt: +disc_amt.toFixed(2),
      St_amt:   +st_amt.toFixed(2),
      Ex_amt:   +ex_amt.toFixed(2),
      Cst_amt:  +cst_amt.toFixed(2),
      Vat_per:  +vat_per.toFixed(2),
      Vat_amt:  +vat_amt.toFixed(2),
      Total:    +total.toFixed(2)
    }, { emitEvent: false });
  }

  save(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value as WorkOrderLineDto);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}

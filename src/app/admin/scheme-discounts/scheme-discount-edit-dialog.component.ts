import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { forkJoin } from 'rxjs';
import { SchemeDiscountService } from './scheme-discount.service';
import { SchemeItem, DropdownItem } from './scheme-discount.models';
import { ToastService } from '../../core/toast/toast.service';

export interface SchDiscountDialogData {
  schmastId: number | null;
  rowId: number | null;
}

@Component({
  selector: 'app-scheme-discount-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './scheme-discount-edit-dialog.component.html',
})
export class SchemeDiscountEditDialogComponent implements OnInit {
  form!: FormGroup;
  schemeList: SchemeItem[] = [];
  sgroupList: DropdownItem[] = [];
  headList: DropdownItem[] = [];
  loading = false;
  saving = false;

  get isEdit(): boolean { return !!this.data.rowId; }

  constructor(
    private fb: FormBuilder,
    private service: SchemeDiscountService,
    private dialogRef: DialogRef<boolean, SchemeDiscountEditDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: SchDiscountDialogData,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      Schmast_id:  [this.data.schmastId, [Validators.required]],
      Level:       ['Item',              [Validators.required]],
      Narrcode:    [null as number | null],
      Sgroup_id:   [null as number | null],
      Group_id:    [null as number | null],
      Rate_nm:     [null as string | null],
      DiscountPct: [null, [Validators.required, Validators.min(0.01), Validators.max(100)]],
      Wef_dt:      ['',  [Validators.required]],
      Expdt:       [null as string | null],
    });

    this.loading = true;
    const lookups$ = forkJoin({
      schemes: this.service.getSchemeList(),
      sgroups: this.service.getSgroupList(),
      heads:   this.service.getHeadList(),
    });

    if (this.isEdit) {
      forkJoin({ lookups: lookups$, row: this.service.getById(this.data.rowId!) }).subscribe({
        next: ({ lookups, row }) => {
          this.schemeList = lookups.schemes;
          this.sgroupList = lookups.sgroups;
          this.headList   = lookups.heads;
          const level = row.Narrcode != null ? 'Item' : row.Sgroup_id != null ? 'Sub-Group' : 'Head Group';
          this.form.patchValue({
            Schmast_id:  row.Schmast_id,
            Level:       level,
            Narrcode:    row.Narrcode,
            Sgroup_id:   row.Sgroup_id,
            Group_id:    row.Group_id,
            Rate_nm:     row.Rate_nm || null,
            DiscountPct: row.DiscountPct,
            Wef_dt:      row.Wef_dt ? row.Wef_dt.substring(0, 10) : '',
            Expdt:       row.Expdt  ? row.Expdt.substring(0, 10)  : null,
          });
          this.loading = false;
        },
        error: () => {
          this.toast.show('Error loading rule data', { variant: 'error', duration: 3000 });
          this.loading = false;
        },
      });
    } else {
      lookups$.subscribe({
        next: ({ schemes, sgroups, heads }) => {
          this.schemeList = schemes;
          this.sgroupList = sgroups;
          this.headList   = heads;
          this.loading    = false;
        },
        error: () => {
          this.toast.show('Error loading lookup data', { variant: 'error', duration: 3000 });
          this.loading = false;
        },
      });
    }
  }

  onLevelChange(): void {
    this.form.patchValue({ Narrcode: null, Sgroup_id: null, Group_id: null });
  }

  get level(): string { return this.form.get('Level')?.value ?? ''; }

  onSave(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.getRawValue();
    const level: string = v.Level;

    if (level === 'Item'      && !v.Narrcode)  { this.toast.show('Enter a narration code.', { variant: 'error', duration: 3000 }); return; }
    if (level === 'Sub-Group' && !v.Sgroup_id) { this.toast.show('Select a sub-group.', { variant: 'error', duration: 3000 }); return; }
    if (level === 'Head Group' && !v.Group_id) { this.toast.show('Select a head group.', { variant: 'error', duration: 3000 }); return; }

    const payload = {
      Pk_id:       this.isEdit ? this.data.rowId! : 0,
      Schmast_id:  v.Schmast_id,
      Narrcode:    level === 'Item'      ? v.Narrcode  : null,
      Sgroup_id:   level === 'Sub-Group' ? v.Sgroup_id : null,
      Group_id:    level === 'Head Group'? v.Group_id  : null,
      Rate_nm:     v.Rate_nm || null,
      DiscountPct: v.DiscountPct,
      Wef_dt:      v.Wef_dt,
      Expdt:       v.Expdt || null,
    };

    this.saving = true;
    this.service.save(payload).subscribe({
      next: () => {
        this.toast.show(this.isEdit ? 'Rule updated' : 'Rule added', { variant: 'success', duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.toast.show(err?.error?.Message || 'Error saving rule', { variant: 'error', duration: 3000 });
        this.saving = false;
      },
    });
  }

  onCancel(): void { this.dialogRef.close(); }
}

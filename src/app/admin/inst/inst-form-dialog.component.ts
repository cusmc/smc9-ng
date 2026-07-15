import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { InstService } from './inst.service';
import { Inst } from './inst.models';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-inst-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inst-form-dialog.component.html',
})
export class InstFormDialogComponent implements OnInit {
  form!: FormGroup;
  saving = false;

  get isEdit(): boolean { return !!this.data; }

  constructor(
    private fb: FormBuilder,
    private service: InstService,
    private dialogRef: DialogRef<boolean, InstFormDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: Inst | null,
  ) {}

  ngOnInit(): void {
    const d = this.data;
    this.form = this.fb.group({
      Inst_id:     [d?.Inst_id ?? 0],
      Inst_nm:     [d?.Inst_nm ?? '',     [Validators.maxLength(50)]],
      Alias_nm:    [d?.Alias_nm ?? '',    [Validators.maxLength(10)]],
      Coll_nm:     [d?.Coll_nm ?? '',     [Validators.maxLength(50)]],
      Pg_inst:     [d?.Pg_inst ?? 0],
      Hosp_nm:     [d?.Hosp_nm ?? '',     [Validators.maxLength(50)]],
      Add1:        [d?.Add1 ?? '',        [Validators.maxLength(100)]],
      Add2:        [d?.Add2 ?? '',        [Validators.maxLength(100)]],
      Add3:        [d?.Add3 ?? '',        [Validators.maxLength(100)]],
      City:        [d?.City ?? '',        [Validators.maxLength(50)]],
      Mobile:      [d?.Mobile ?? '',      [Validators.maxLength(25)]],
      Email:       [d?.Email ?? '',       [Validators.maxLength(100)]],
      Phone:       [d?.Phone ?? '',       [Validators.maxLength(100)]],
      Active:      [d?.Active ?? true],
      Pfno:        [d?.Pfno ?? '',        [Validators.maxLength(20)]],
      Desg:        [d?.Desg ?? '',        [Validators.maxLength(50)]],
      En:          [d?.En ?? '',          [Validators.maxLength(4)]],
      Amp_pan_no:  [d?.Amp_pan_no ?? '',  [Validators.maxLength(10)]],
      Amp_tds_no:  [d?.Amp_tds_no ?? '',  [Validators.maxLength(10)]],
      Amp_tds_c:   [d?.Amp_tds_c ?? '',   [Validators.maxLength(10)]],
      F16_person:  [d?.F16_person ?? '',  [Validators.maxLength(30)]],
      F16_parent:  [d?.F16_parent ?? '',  [Validators.maxLength(30)]],
      F16_desg:    [d?.F16_desg ?? '',    [Validators.maxLength(30)]],
      Inst_cd:     [d?.Inst_cd ?? '',     [Validators.maxLength(10)]],
      Sign1:       [d?.Sign1 ?? '',       [Validators.maxLength(25)]],
      Sign2:       [d?.Sign2 ?? '',       [Validators.maxLength(25)]],
      Sign3:       [d?.Sign3 ?? '',       [Validators.maxLength(25)]],
      Sign4:       [d?.Sign4 ?? '',       [Validators.maxLength(25)]],
      Sign5:       [d?.Sign5 ?? '',       [Validators.maxLength(25)]],
      Sign6:       [d?.Sign6 ?? '',       [Validators.maxLength(25)]],
      Stud:        [d?.Stud ?? false],
      Host:        [d?.Host ?? false],
      Stor:        [d?.Stor ?? false],
      Payr:        [d?.Payr ?? false],
      Acnt:        [d?.Acnt ?? false],
      Tally_cmp:   [d?.Tally_cmp ?? '',   [Validators.maxLength(100)]],
      Gst_no:      [d?.Gst_no ?? '',      [Validators.maxLength(30)]],
      Pan:         [d?.Pan ?? '',         [Validators.maxLength(10)]],
      Bank_name:   [d?.Bank_name ?? '',   [Validators.maxLength(100)]],
      Bank_acno:   [d?.Bank_acno ?? '',   [Validators.maxLength(100)]],
      Bank_ifsc:   [d?.Bank_ifsc ?? '',   [Validators.maxLength(100)]],
      Smc_nm:      [d?.Smc_nm ?? '',      [Validators.maxLength(100)]],
      Latefee:     [d?.Latefee ?? false],
      Hospital:    [d?.Hospital ?? false],
      College:     [d?.College ?? false],
    });
  }

  onSave(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.service.save(this.form.value).subscribe({
      next: () => {
        this.toast.show(this.isEdit ? 'Institute updated' : 'Institute created', { variant: 'success', duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.toast.show(err?.error?.Message || 'Error saving institute', { variant: 'error', duration: 3000 });
        this.saving = false;
      },
    });
  }

  onCancel(): void { this.dialogRef.close(); }
}

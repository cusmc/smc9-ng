import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { AutocompleteComponent } from '../../shared/autocomplete/autocomplete.component';
import { IdNm, RcTranDto } from './rc-master.models';

interface DialogData {
  line: RcTranDto | null;
  products: IdNm[];
}

@Component({
  selector: 'app-rc-line-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AutocompleteComponent],
  templateUrl: './rc-line-dialog.component.html',
  styleUrls: ['./rc-line-dialog.component.scss']
})
export class RcLineDialogComponent {
  form: FormGroup;

  constructor(
    @Inject(DIALOG_DATA) public data: DialogData,
    private dialogRef: DialogRef<RcTranDto | null, RcLineDialogComponent>,
    private fb: FormBuilder
  ) {
    const l = data.line;
    this.form = this.fb.group({
      Rctran_id: [l ? l.Rctran_id : 0],
      Rc_id:     [l ? l.Rc_id     : 0],
      Prod_id:   [l ? l.Prod_id   : null, Validators.required],
      Prod_nm:   [l ? l.Prod_nm   : ''],
      Prate:     [l ? l.Prate     : 0],
      Max_qty:   [l ? l.Max_qty   : null],
      Fq_base:   [l ? l.Fq_base   : null],
      Fq_free:   [l ? l.Fq_free   : null],
      CanTag:    ['N']
    });

    this.form.get('Prod_id')!.valueChanges.subscribe(id => {
      const found = this.data.products.find(p => p.id == id);
      this.form.patchValue({ Prod_nm: found ? found.nm : '' }, { emitEvent: false });
    });
  }

  save(): void {
    if (this.form.invalid) { return; }
    this.dialogRef.close(this.form.value as RcTranDto);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}

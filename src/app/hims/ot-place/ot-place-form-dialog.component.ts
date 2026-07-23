import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { AutocompleteComponent, AcItem } from '../../shared/autocomplete/autocomplete.component';
import { OtPlaceService } from './ot-place.service';
import { Otplace, OprTableRow } from './ot-place.models';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-ot-place-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AutocompleteComponent],
  templateUrl: './ot-place-form-dialog.component.html',
})
export class OtPlaceFormDialogComponent implements OnInit {
  form!: FormGroup;
  saving = false;

  roomId = 0;
  deptList: AcItem[] = [];
  tables: OprTableRow[] = [];

  readonly billModeList = [
    { cd: null, nm: 'No Auto-Billing' },
    { cd: 'O', nm: 'OT-wise (flat charge)' },
    { cd: 'G', nm: 'Grade-wise (Surgeon/Anaesthesia/OT)' },
  ];

  get isEdit(): boolean { return this.roomId > 0; }

  constructor(
    private fb: FormBuilder,
    private service: OtPlaceService,
    private dialogRef: DialogRef<boolean, OtPlaceFormDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: Otplace | null,
  ) {}

  ngOnInit(): void {
    const d = this.data;
    this.roomId = d?.Pk_id ?? 0;
    this.form = this.fb.group({
      Pk_id:    [d?.Pk_id ?? 0],
      Dept_id:  [d?.Dept_id ?? null, Validators.required],
      Place:    [d?.Place ?? '', [Validators.required, Validators.maxLength(10)]],
      Userx:    [d?.Userx ?? '', [Validators.maxLength(100)]],
      BillMode: [d?.BillMode ?? null],
    });

    this.service.getDepts().subscribe(list => this.deptList = list);

    if (this.isEdit) {
      this.loadTables();
    }
  }

  onSave(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const wasNew = !this.isEdit;
    this.saving = true;
    this.service.save(this.form.value).subscribe({
      next: (newId) => {
        this.saving = false;
        this.toast.show(wasNew ? 'OT Place created' : 'OT Place updated', { variant: 'success', duration: 3000 });
        if (wasNew) {
          this.roomId = newId;
          this.form.patchValue({ Pk_id: this.roomId }, { emitEvent: false });
          this.loadTables();
        } else {
          this.dialogRef.close(true);
        }
      },
      error: (err) => {
        this.saving = false;
        this.toast.show(err?.error?.Message || 'Error saving OT Place', { variant: 'error', duration: 3000 });
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(this.roomId > 0);
  }

  // --- Operating Tables (OprTable + OtPlaceDept) ---

  loadTables(): void {
    if (!this.roomId) { return; }
    this.service.getTablesByOtplaceId(this.roomId).subscribe(rows => this.tables = rows);
  }

  addTable(): void {
    this.tables.push({
      Pk_id: 0,
      Otplace_id: this.roomId,
      TableNo: '',
      TableName: '',
      Major: false,
      Minor: false,
      Supra: false,
      Procx: false,
      Invx: false,
      IsActive: true,
      Remarks: '',
      DeptIds: [],
    });
  }

  isDeptChecked(row: OprTableRow, deptId: number): boolean {
    return !!row.DeptIds && row.DeptIds.includes(deptId);
  }

  toggleDept(row: OprTableRow, deptId: number): void {
    if (!row.DeptIds) { row.DeptIds = []; }
    const idx = row.DeptIds.indexOf(deptId);
    if (idx > -1) {
      row.DeptIds.splice(idx, 1);
    } else {
      row.DeptIds.push(deptId);
    }
  }

  saveTable(row: OprTableRow): void {
    if (!row.TableNo) {
      this.toast.show('Table No is required', { variant: 'error', duration: 3000 });
      return;
    }
    this.service.saveTable(row).subscribe({
      next: () => {
        this.toast.show('Table saved', { variant: 'success', duration: 3000 });
        this.loadTables();
      },
      error: (err) => this.toast.show(err?.error?.Message || 'Error saving table', { variant: 'error', duration: 3000 }),
    });
  }

  deleteTable(row: OprTableRow): void {
    if (!(row.Pk_id > 0)) {
      this.tables.splice(this.tables.indexOf(row), 1);
      return;
    }
    if (!confirm('Are you sure you want to delete this table?')) { return; }
    this.service.deleteTable(row.Pk_id).subscribe({
      next: () => {
        this.toast.show('Table deleted', { variant: 'success', duration: 3000 });
        this.loadTables();
      },
      error: (err) => this.toast.show(err?.error?.Message || 'Error deleting table', { variant: 'error', duration: 3000 }),
    });
  }
}

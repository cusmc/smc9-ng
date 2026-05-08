import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { WebModulesService } from './web-modules.service';
import { Wmodule } from './web-modules.models';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-web-modules-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './web-modules-edit-dialog.component.html',
  styleUrls: ['./web-modules-edit-dialog.component.scss'],
})
export class WebModulesEditDialogComponent implements OnInit {
  form!: FormGroup;
  saving = false;
  deleting = false;

  get isEdit(): boolean { return !!this.data; }

  constructor(
    private fb: FormBuilder,
    private service: WebModulesService,
    private dialogRef: DialogRef<boolean, WebModulesEditDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: Wmodule | null,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      Wmodule_id: [this.data?.Wmodule_id ?? 0],
      Wmodule_nm: [this.data?.Wmodule_nm ?? '', [Validators.required]],
      Cont_name:  [this.data?.Cont_name ?? '',  [Validators.required]],
      View_name:  [this.data?.View_name ?? '',  [Validators.required]],
      Params:     [this.data?.Params ?? ''],
      Parent_id:  [this.data?.Parent_id ?? null],
      Priority:   [this.data?.Priority ?? null],
    });
  }

  onSave(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.service.save(this.form.value).subscribe({
      next: () => {
        this.toast.show(this.isEdit ? 'Module updated' : 'Module created', { variant: 'success', duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.toast.show(err?.error?.Message || 'Error saving module', { variant: 'error', duration: 3000 });
        this.saving = false;
      },
    });
  }

  onDelete(): void {
    if (!this.data?.Wmodule_id) return;
    if (!confirm(`Delete module "${this.data.Wmodule_nm}"? This will also remove all associated rights.`)) return;
    this.deleting = true;
    this.service.delete(this.data.Wmodule_id).subscribe({
      next: () => {
        this.toast.show('Module deleted', { variant: 'success', duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.toast.show(err?.error?.Message || 'Error deleting module', { variant: 'error', duration: 3000 });
        this.deleting = false;
      },
    });
  }

  onCancel(): void { this.dialogRef.close(); }
}

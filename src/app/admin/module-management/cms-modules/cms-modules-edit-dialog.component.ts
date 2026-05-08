import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { CmsModulesService } from './cms-modules.service';
import { Cmodule } from './cms-modules.models';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-cms-modules-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cms-modules-edit-dialog.component.html',
  styleUrls: ['./cms-modules-edit-dialog.component.scss'],
})
export class CmsModulesEditDialogComponent implements OnInit {
  form!: FormGroup;
  saving = false;
  deleting = false;

  get isEdit(): boolean { return !!this.data; }

  constructor(
    private fb: FormBuilder,
    private service: CmsModulesService,
    private dialogRef: DialogRef<boolean, CmsModulesEditDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: Cmodule | null,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      Module_id: [this.data?.Module_id ?? 0],
      Name:      [this.data?.Name ?? '',    [Validators.required]],
      Prompt:    [this.data?.Prompt ?? '',  [Validators.required]],
      Command:   [this.data?.Command ?? ''],
      Objcode:   [this.data?.Objcode ?? ''],
      Levelname: [this.data?.Levelname ?? ''],
      Defrights: [this.data?.Defrights ?? ''],
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
    if (!this.data?.Module_id) return;
    if (!confirm('Delete module "' + this.data.Name + '"? This will also remove all associated rights.')) return;
    this.deleting = true;
    this.service.delete(this.data.Module_id).subscribe({
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

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { SubgroupMasterService } from './subgroup-master.service';
import { Subgroup } from './subgroup-master.models';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-subgroup-master-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subgroup-master-dialog.component.html',
  styleUrls: ['./subgroup-master-dialog.component.scss']
})
export class SubgroupMasterDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: SubgroupMasterService,
    private dialogRef: DialogRef<boolean, SubgroupMasterDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: { subgroupType: string; subgroup: Subgroup | null }
  ) {
    this.form = this.fb.group({
      Subgroup_id: [data.subgroup?.Subgroup_id || 0],
      Subgroup_nm: [data.subgroup?.Subgroup_nm || '', Validators.required],
      Subgroup_type: [data.subgroup?.Subgroup_type || data.subgroupType],
      Subject_id: [data.subgroup?.Subject_id || '']
    });
  }

  onSave(): void {
    if (!this.form.valid) return;

    this.service.saveSubgroup(this.form.value).subscribe({
      next: () => {
        this.toast.show('Saved successfully', { variant: 'success', duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.toast.show(err?.error?.error_description || 'Error saving', { variant: 'error', duration: 3000 });
      }
    });
  }

  onDelete(): void {
    if (!this.data.subgroup?.Subgroup_id) return;
    if (confirm('Are you sure you want to delete this item?')) {
      this.service.deleteSubgroup(this.data.subgroup.Subgroup_id).subscribe({
        next: () => {
          this.toast.show('Deleted successfully', { variant: 'success', duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => this.toast.show('Error deleting item', { variant: 'error', duration: 3000 })
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

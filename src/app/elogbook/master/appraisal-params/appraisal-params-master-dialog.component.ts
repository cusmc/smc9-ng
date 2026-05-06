import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { AppraisalParametersMasterService } from './appraisal-params-master.service';
import { AppraisalParameter } from './appraisal-params-master.models';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-appraisal-params-master-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appraisal-params-master-dialog.component.html',
  styleUrls: ['./appraisal-params-master-dialog.component.scss']
})
export class AppraisalParametersMasterDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: AppraisalParametersMasterService,
    private dialogRef: DialogRef<boolean, AppraisalParametersMasterDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: AppraisalParameter | null
  ) {
    this.form = this.fb.group({
      Parameterid: [data?.Parameterid || 0],
      Code: [data?.Code || ''],
      Descr: [data?.Descr || ''],
      Course_id: [data?.Course_id || ''],
      Maxscore: [data?.Maxscore || ''],
      Isheader: [data?.Isheader || 'N'],
      Ismandatory: [data?.Ismandatory || 'N'],
      Displayorder: [data?.Displayorder || ''],
      Isactive: [data?.Isactive || 'Y']
    });
  }

  onSave(): void {
    if (!this.form.valid) return;
    this.service.saveParameter(this.form.value).subscribe({
      next: () => {
        this.toast.show('Parameter saved successfully', { variant: 'success', duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.toast.show(err?.error?.error_description || 'Error saving parameter', { variant: 'error', duration: 3000 });
      }
    });
  }

  onDelete(): void {
    if (!this.data?.Parameterid) return;
    if (confirm('Are you sure you want to delete this parameter?')) {
      this.service.deleteParameter(this.data.Parameterid).subscribe({
        next: () => {
          this.toast.show('Parameter deleted successfully', { variant: 'success', duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => this.toast.show('Error deleting parameter', { variant: 'error', duration: 3000 })
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

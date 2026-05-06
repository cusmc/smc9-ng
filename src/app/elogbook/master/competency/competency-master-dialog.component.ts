import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CompetencyMasterService } from './competency-master.service';
import { Competency } from './competency-master.models';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-competency-master-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './competency-master-dialog.component.html',
  styleUrls: ['./competency-master-dialog.component.scss']
})
export class CompetencyMasterDialogComponent implements OnInit {
  form!: FormGroup;
  competency: Competency | null = null;

  constructor(
    private fb: FormBuilder,
    private service: CompetencyMasterService,
    private dialogRef: DialogRef<boolean, CompetencyMasterDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: Competency | null
  ) {
    this.competency = data;
    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.competency) {
      this.loadCompetencyDetails();
    }
  }

  initializeForm(): void {
    this.form = this.fb.group({
      Competencyid: [this.competency?.Competencyid || 0],
      Description: [this.competency?.Description || ''],
      Subdesc: [this.competency?.Subdesc || ''],
      Section_id: [this.competency?.Section_id || ''],
      Course_id: [this.competency?.Course_id || ''],
      Subject_id: [this.competency?.Subject_id || ''],
      Mode_id: [this.competency?.Mode_id || ''],
      Yr: [this.competency?.Yr || '']
    });
  }

  loadCompetencyDetails(): void {
    if (!this.competency) return;

    this.service.getCompetencyById(this.competency.Competencyid).subscribe({
      next: (data) => {
        this.form.patchValue({
          Competencyid: data.Competencyid,
          Description: data.Description,
          Subdesc: data.Subdesc,
          Section_id: data.Section_id,
          Course_id: data.Course_id,
          Subject_id: data.Subject_id,
          Mode_id: data.Mode_id,
          Yr: data.Yr
        });
      },
      error: () => this.toast.show('Error loading competency details', { variant: 'error', duration: 3000 })
    });
  }

  onSave(): void {
    if (!this.form.valid) return;

    const payload = this.form.value;
    this.service.saveCompetency(payload).subscribe({
      next: () => {
        this.toast.show('Competency saved successfully', { variant: 'success', duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.toast.show(err?.error?.error_description || 'Error saving competency', { variant: 'error', duration: 3000 });
      }
    });
  }

  onDelete(): void {
    if (!this.competency?.Competencyid) return;
    if (confirm('Are you sure you want to delete this competency?')) {
      this.service.deleteCompetency(this.competency.Competencyid).subscribe({
        next: () => {
          this.toast.show('Competency deleted successfully', { variant: 'success', duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => this.toast.show('Error deleting competency', { variant: 'error', duration: 3000 })
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

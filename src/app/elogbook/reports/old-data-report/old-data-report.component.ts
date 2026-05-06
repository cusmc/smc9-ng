import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LookupService } from '../../shared/lookup.service';
import { ApiService } from '../../../shared/api.service';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-old-data-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './old-data-report.component.html',
  styleUrls: ['./old-data-report.component.scss']
})
export class OldDataReportComponent implements OnInit {
  form: FormGroup;
  students: any[] = [];
  outputOptions: any[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private lookupService: LookupService,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      Studno: [null, Validators.required],
      Output: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.lookupService.getAllStudents().subscribe({
      next: (data) => {
        this.students = data;
      },
      error: () => this.toast.show('Error loading students', { variant: 'error', duration: 3000 })
    });

    this.lookupService.getCodeList('OUTPUTTO').subscribe({
      next: (data) => {
        this.outputOptions = data;
      },
      error: () => this.toast.show('Error loading output options', { variant: 'error', duration: 3000 })
    });
  }

  generate(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const { Studno, Output } = this.form.value;

    this.apiService.getBlob('/api/Campus/studentcompetencysAPI/LogBookOldData', { Studno, Output }).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error generating report', { variant: 'error', duration: 3000 });
        this.loading = false;
      }
    });
  }
}

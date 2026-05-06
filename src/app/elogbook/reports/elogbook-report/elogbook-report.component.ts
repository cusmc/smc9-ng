import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LookupService } from '../../shared/lookup.service';
import { AuthService } from '../../../auth/auth.service';
import { ApiService } from '../../../shared/api.service';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-elogbook-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './elogbook-report.component.html',
  styleUrls: ['./elogbook-report.component.scss']
})
export class ElogbookReportComponent implements OnInit {
  form: FormGroup;
  subjects: any[] = [];
  students: any[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private lookupService: LookupService,
    private authService: AuthService,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      Subject_id: [null, Validators.required],
      Studno: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    const empid = this.authService.getUsername() || '';
    this.lookupService.getSubjectsByEmpid(empid).subscribe({
      next: (data) => {
        this.subjects = data;
      },
      error: () => this.toast.show('Error loading subjects', { variant: 'error', duration: 3000 })
    });

    this.form.get('Subject_id')?.valueChanges.subscribe((subjectId) => {
      if (subjectId) {
        this.lookupService.getStudentsByCourse(subjectId).subscribe({
          next: (data) => {
            this.students = data;
            this.form.patchValue({ Studno: null });
          }
        });
      }
    });
  }

  generate(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const { Subject_id, Studno } = this.form.value;

    this.apiService.postBlob('/api/Campus/competenciessAPI/ElogbookRpt', { Studno, Subject_id }).subscribe({
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

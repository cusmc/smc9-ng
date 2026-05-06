import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { LookupService } from '../../shared/lookup.service';
import { ApprovingAuthorityMasterService } from './approving-authority-master.service';
import { Student } from './approving-authority-master.models';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-approving-authority-master',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './approving-authority-master.component.html',
  styleUrls: ['./approving-authority-master.component.scss']
})
export class ApprovingAuthorityMasterComponent implements OnInit {
  form!: FormGroup;
  subjects: any[] = [];
  students: Student[] = [];
  selectedSubjectId: number | null = null;
  selectedStudentNo: string = '';
  loading = false;
  username = '';

  constructor(
    private authService: AuthService,
    private lookup: LookupService,
    private fb: FormBuilder,
    private service: ApprovingAuthorityMasterService,
    private toast: ToastService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
    this.lookup.getSubjectsByEmpid(this.username).subscribe((data) => {
      this.subjects = data;
      if (data.length > 0) {
        this.selectedSubjectId = data[0].Subject_id;
        this.onSubjectChange();
      }
    });
  }

  initializeForm(): void {
    this.form = this.fb.group({
      guides: this.fb.array([])
    });
  }

  get guides(): FormArray {
    return this.form.get('guides') as FormArray;
  }

  onSubjectChange(): void {
    if (!this.selectedSubjectId) return;
    this.selectedStudentNo = '';
    this.guides.clear();
    this.lookup.getStudentsByCourse(this.selectedSubjectId).subscribe((data) => {
      this.students = data;
    });
  }

  onStudentChange(): void {
    this.guides.clear();
    if (!this.selectedStudentNo) return;

    this.loading = true;

    this.service.getStudGuidesByStudent(this.selectedStudentNo).subscribe({
      next: (data) => {
        data.forEach((guide) => {
          this.guides.push(
            this.fb.group({
              Pk_id: [guide.Pk_id || 0],
              Studno: [guide.Studno],
              Empid: [guide.Empid, Validators.required],
              CanTag: [guide.CanTag === 'Y' ? true : false]
            })
          );
        });
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error loading guides', { variant: 'error', duration: 3000 });
        this.loading = false;
      }
    });
  }

  addGuide(): void {
    const guide = this.fb.group({
      Pk_id: [0],
      Studno: [this.selectedStudentNo],
      Empid: ['', Validators.required],
      CanTag: [false]
    });
    this.guides.push(guide);
  }

  markForDeletion(index: number): void {
    this.guides.at(index).patchValue({ CanTag: true });
  }

  onSave(): void {
    this.loading = true;
    const payload = this.guides.value.map((guide: { CanTag: boolean; Pk_id: number; Studno: string; Empid: string }) => ({
      ...guide,
      CanTag: guide.CanTag ? 'Y' : 'N'
    }));

    this.service.saveStudGuides(payload).subscribe({
      next: () => {
        this.toast.show('Guides saved successfully', { variant: 'success', duration: 3000 });
        this.loading = false;
        if (this.selectedStudentNo) {
          this.onStudentChange();
        }
      },
      error: (err) => {
        this.toast.show(err?.error?.error_description || 'Error saving guides', { variant: 'error', duration: 3000 });
        this.loading = false;
      }
    });
  }
}

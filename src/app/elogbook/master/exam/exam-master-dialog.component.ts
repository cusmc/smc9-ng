import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ExamMasterService } from './exam-master.service';
import { ExamMast, Course, Subject, Section } from './exam-master.models';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-exam-master-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exam-master-dialog.component.html',
  styleUrls: ['./exam-master-dialog.component.scss']
})
export class ExamMasterDialogComponent implements OnInit {
  form!: FormGroup;
  exam: ExamMast | null = null;
  courses: Course[] = [];
  subjects: Subject[] = [];
  sections: Section[] = [];

  constructor(
    private fb: FormBuilder,
    private service: ExamMasterService,
    private dialogRef: DialogRef<boolean, ExamMasterDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: ExamMast | null
  ) {
    this.exam = data;
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCourses();
    if (this.exam) {
      this.loadExamDetails();
    }
  }

  initializeForm(): void {
    this.form = this.fb.group({
      Exam_id: [this.exam?.Exam_id || 0],
      Exam_nm: [this.exam?.Exam_nm || '', Validators.required],
      Course_id: [this.exam?.Course_id || '', Validators.required],
      Subject_id: [this.exam?.Subject_id || ''],
      Section_id: [this.exam?.Section_id || ''],
      Admyear: [this.exam?.Admyear || ''],
      Maxmarkst: [this.exam?.Maxmarkst || ''],
      Minmarkst: [this.exam?.Minmarkst || ''],
      Maxmarksp: [this.exam?.Maxmarksp || ''],
      Minmarksp: [this.exam?.Minmarksp || ''],
      Remarks: [this.exam?.Remarks || '']
    });
  }

  loadCourses(): void {
    this.service.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
      },
      error: () => this.toast.show('Error loading courses', { variant: 'error', duration: 3000 })
    });
  }

  loadExamDetails(): void {
    if (!this.exam) return;

    this.service.getExamById(this.exam.Exam_id).subscribe({
      next: (data) => {
        this.form.patchValue({
          Exam_id: data.Exam_id,
          Exam_nm: data.Exam_nm,
          Course_id: data.Course_id,
          Subject_id: data.Subject_id,
          Section_id: data.Section_id,
          Admyear: data.Admyear,
          Maxmarkst: data.Maxmarkst,
          Minmarkst: data.Minmarkst,
          Maxmarksp: data.Maxmarksp,
          Minmarksp: data.Minmarksp,
          Remarks: data.Remarks
        });

        // Load dependent dropdowns without clearing the already-patched values
        if (data.Course_id) {
          this.service.getSubjectsByCourse(data.Course_id).subscribe({
            next: (subjects) => {
              this.subjects = subjects;
              if (data.Subject_id) {
                this.service.getSectionsBySubject(data.Subject_id).subscribe({
                  next: (sections) => { this.sections = sections; }
                });
              }
            },
            error: () => this.toast.show('Error loading subjects', { variant: 'error', duration: 3000 })
          });
        }
      },
      error: () => this.toast.show('Error loading exam details', { variant: 'error', duration: 3000 })
    });
  }

  onCourseChange(): void {
    const courseId = this.form.get('Course_id')?.value;
    if (!courseId) return;
    this.subjects = [];
    this.sections = [];
    this.form.patchValue({ Subject_id: '', Section_id: '' });
    this.service.getSubjectsByCourse(courseId).subscribe({
      next: (data) => { this.subjects = data; },
      error: () => this.toast.show('Error loading subjects', { variant: 'error', duration: 3000 })
    });
  }

  onSubjectChange(): void {
    const subjectId = this.form.get('Subject_id')?.value;
    if (!subjectId) return;
    this.sections = [];
    this.form.patchValue({ Section_id: '' });
    this.service.getSectionsBySubject(subjectId).subscribe({
      next: (data) => { this.sections = data; },
      error: () => this.toast.show('Error loading sections', { variant: 'error', duration: 3000 })
    });
  }

  onSave(): void {
    if (!this.form.valid) return;

    this.service.saveExam(this.form.value).subscribe({
      next: () => {
        this.toast.show('Exam saved successfully', { variant: 'success', duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.toast.show(err?.error?.error_description || 'Error saving exam', { variant: 'error', duration: 3000 });
      }
    });
  }

  onDelete(): void {
    if (!this.exam?.Exam_id) return;
    if (confirm('Are you sure you want to delete this exam?')) {
      this.service.deleteExam(this.exam.Exam_id).subscribe({
        next: () => {
          this.toast.show('Exam deleted successfully', { variant: 'success', duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => this.toast.show('Error deleting exam', { variant: 'error', duration: 3000 })
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

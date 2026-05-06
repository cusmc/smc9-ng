import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { PostingService } from './posting.service';
import { LookupService } from '../../shared/lookup.service';
import { Speciality, Faculty } from './posting.models';
import { ToastService } from '../../../core/toast/toast.service';

interface DialogData {
  Pk_id: number;
  username: string;
}

@Component({
  selector: 'app-posting-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './posting-dialog.component.html',
  styleUrls: ['./posting-dialog.component.scss']
})
export class PostingDialogComponent implements OnInit {
  form: FormGroup;
  subjects: any[] = [];
  students: any[] = [];
  specialities: Speciality[] = [];
  facultyList: Faculty[] = [];
  saving = false;
  itemno = -9999;

  specialityPanelOpen = false;
  newSpecialityNm = '';

  get rows(): FormArray {
    return this.form.get('SubData') as FormArray;
  }

  get visibleRows() {
    return this.rows.controls.filter((c) => c.get('CanTag')?.value !== 'Y');
  }

  constructor(
    @Inject(DIALOG_DATA) public data: DialogData,
    private dialogRef: DialogRef<boolean, PostingDialogComponent>,
    private service: PostingService,
    private lookup: LookupService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      Subject_id: [null, Validators.required],
      Studno: [null, Validators.required],
      Remarks: [''],
      SubData: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.lookup.getSubjectsByEmpid(this.data.username).subscribe((data) => {
      this.subjects = data;
      if (this.data.Pk_id === -1 && data.length > 0) {
        this.form.patchValue({ Subject_id: data[0].Subject_id });
        this.onSubjectChange();
      }
    });

    if (this.data.Pk_id !== -1) {
      this.service.getPostingsByStudno('').subscribe();
    }
  }

  onSubjectChange(): void {
    const subjectId = this.form.get('Subject_id')?.value;
    if (!subjectId) return;
    this.lookup.getStudentsByCourse(subjectId).subscribe((d) => (this.students = d));
    this.loadSpecialities(subjectId);
    this.lookup.getFacultyBySubject(subjectId).subscribe((d) => (this.facultyList = d));
  }

  onStudnoChange(): void {
    const studno = this.form.get('Studno')?.value;
    if (!studno) return;
    this.service.getPostingsByStudno(studno).subscribe((rows) => {
      this.rows.clear();
      rows.forEach((r) => {
        this.itemno++;
        this.rows.push(
          this.fb.group({
            Pk_id: [r.Pk_id],
            Startdate: [this.toDateInput(r.Startdate)],
            Enddate: [this.toDateInput(r.Enddate)],
            Specialty_id: [r.Specialty_id],
            Empid: [r.Empid?.toString()],
            CanTag: ['N'],
            itemno: [this.itemno]
          })
        );
      });
    });
  }

  private loadSpecialities(subjectId: number): void {
    this.service.getSpecialities(subjectId).subscribe((d) => (this.specialities = d));
  }

  private toDateInput(v: unknown): string {
    if (!v) return '';
    const dt = v instanceof Date ? v : new Date(v as string | number);
    if (isNaN(dt.getTime())) return '';
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  }

  addRow(): void {
    this.itemno++;
    const lastRow = this.visibleRows[this.visibleRows.length - 1];
    let start = new Date();
    if (lastRow) {
      const prevEnd = lastRow.get('Enddate')?.value;
      if (prevEnd) {
        start = new Date(prevEnd + 'T12:00:00');
        start.setDate(start.getDate() + 1);
      }
    }
    const startStr = this.toDateInput(start);
    this.rows.push(
      this.fb.group({
        Pk_id: [0],
        Startdate: [startStr],
        Enddate: [startStr],
        Specialty_id: [-1],
        Empid: [''],
        CanTag: ['N'],
        itemno: [this.itemno]
      })
    );
  }

  removeRow(itemno: number): void {
    const ctrl = this.rows.controls.find((c) => c.get('itemno')?.value === itemno);
    if (ctrl) ctrl.patchValue({ CanTag: 'Y' });
  }

  saveSpeciality(): void {
    const subjectId = this.form.get('Subject_id')?.value;
    if (!this.newSpecialityNm || !subjectId) return;
    this.service.saveSpeciality(this.newSpecialityNm, subjectId).subscribe({
      next: () => {
        this.loadSpecialities(subjectId);
        this.newSpecialityNm = '';
        this.specialityPanelOpen = false;
      },
      error: () => this.toast.show('Failed to save speciality', { variant: 'error', duration: 3000 })
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const { Subject_id, Studno, Remarks } = this.form.value;

    const payload = this.rows.controls.map((c) => ({
      ...c.value,
      Studno,
      Remarks,
      Subject_id,
      Startdate: this.formatDate(c.get('Startdate')?.value),
      Enddate: this.formatDate(c.get('Enddate')?.value)
    }));

    this.service.savePostings(payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.toast.show(err?.error?.message || 'Save failed', { variant: 'error', duration: 4000 });
        this.saving = false;
      }
    });
  }

  private formatDate(d: unknown): string {
    if (!d) return '';
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
    const dt = new Date(d as string | number | Date);
    if (isNaN(dt.getTime())) return '';
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { AppraisalService } from './appraisal.service';
import { LookupService } from '../../shared/lookup.service';
import { Course } from './appraisal.models';
import { ToastService } from '../../../core/toast/toast.service';

interface DialogData {
  Studno: string | number;
  username: string;
}

@Component({
  selector: 'app-appraisal-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './appraisal-dialog.component.html',
  styleUrls: ['./appraisal-dialog.component.scss']
})
export class AppraisalDialogComponent implements OnInit {
  form: FormGroup;
  courses: Course[] = [];
  students: any[] = [];
  saving = false;
  itemno = -9999;

  get details(): FormArray {
    return this.form.get('Details') as FormArray;
  }

  get visibleDetails() {
    return this.details.controls.filter((c) => c.get('CanTag')?.value !== 'Y');
  }

  constructor(
    @Inject(DIALOG_DATA) public data: DialogData,
    private dialogRef: DialogRef<boolean, AppraisalDialogComponent>,
    private service: AppraisalService,
    private lookup: LookupService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      Courseid: [null],
      Studno: [null],
      Remarks: [''],
      Details: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.service.getCourses().subscribe((d) => {
      this.courses = d;
      if (this.data.Studno !== -1) this.loadExisting();
    });
  }

  onCourseChange(): void {
    const courseId = this.form.get('Courseid')?.value;
    if (courseId) {
      this.lookup.getStudentsByCourse(courseId).subscribe((d) => (this.students = d));
    }
  }

  onStudnoChange(): void {
    this.loadParams();
  }

  private loadExisting(): void {
    this.service.getAppraisalByStudno(String(this.data.Studno)).subscribe((res) => {
      if (!res || res.length === 0) return;
      const first = res[0];
      this.form.patchValue({
        Courseid: first.Courseid,
        Studno: first.Studno,
        Remarks: first.Overallcomments || ''
      });
      this.onCourseChange();
      this.details.clear();
      res.forEach((r) => {
        this.itemno++;
        this.details.push(
          this.makeDetailRow({
            Detailid: r.Detailid,
            Appraisalid: r.Appraisalid,
            Parameterid: r.Parameterid,
            Score: r.Score,
            Comments: r.Comments,
            CanTag: 'N',
            Descr: r.Descr,
            Code: r.Code,
            Maxscore: r.Maxscore,
            Isheader: r.Isheader
          })
        );
      });
    });
  }

  private loadParams(): void {
    const { Courseid, Studno } = this.form.value;
    if (!Courseid || !Studno) return;
    this.service.getParamsByCourse(Courseid, Studno).subscribe((params) => {
      this.details.clear();
      params.forEach((item) => {
        this.itemno++;
        this.details.push(
          this.makeDetailRow({
            Detailid: item.Detailid || 0,
            Appraisalid: item.Appraisalid || 0,
            Parameterid: item.Parameterid,
            Score: item.Score || null,
            Comments: item.Comments || '',
            CanTag: item.CanTag || 'N',
            Descr: item.Descr,
            Code: item.Code,
            Maxscore: item.Maxscore,
            Isheader: item.Isheader
          })
        );
      });
    });
  }

  private makeDetailRow(d: Record<string, unknown>): FormGroup {
    this.itemno++;
    return this.fb.group({
      Detailid: [d['Detailid']],
      Appraisalid: [d['Appraisalid']],
      Parameterid: [d['Parameterid']],
      Score: [d['Score'] === 0 ? null : d['Score']],
      Comments: [d['Comments']],
      CanTag: [d['CanTag']],
      itemno: [this.itemno],
      Descr: [d['Descr']],
      Code: [d['Code']],
      Maxscore: [d['Maxscore']],
      Isheader: [d['Isheader']]
    });
  }

  save(): void {
    this.saving = true;
    const { Courseid, Studno, Remarks } = this.form.value;
    const vm = {
      Header: {
        Appraisalid: 0,
        Studno,
        Courseid,
        Overallcomments: Remarks,
        Appraisaldate: new Date().toISOString()
      },
      Details: this.details.controls.map((c) => ({
        Detailid: c.get('Detailid')?.value,
        Appraisalid: c.get('Appraisalid')?.value,
        Parameterid: c.get('Parameterid')?.value,
        Score: c.get('Score')?.value || 0,
        Comments: c.get('Comments')?.value || '',
        CanTag: c.get('CanTag')?.value,
        itemno: c.get('itemno')?.value,
        Descr: c.get('Descr')?.value,
        Code: c.get('Code')?.value,
        Maxscore: c.get('Maxscore')?.value,
        Isheader: c.get('Isheader')?.value
      }))
    };
    this.service.saveAppraisal(vm, this.data.username).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.toast.show(err?.error?.message || 'Save failed', { variant: 'error', duration: 4000 });
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { StudentViewService } from './student-view.service';
import { StudentListItem, StudentResultRecord } from './student-view.models';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-student-result-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-result-dialog.component.html',
  styleUrls: ['./student-result-dialog.component.scss'],
})
export class StudentResultDialogComponent implements OnInit {
  records: StudentResultRecord[] = [];
  loading = false;

  constructor(
    private service: StudentViewService,
    private dialogRef: DialogRef<void, StudentResultDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: StudentListItem,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.service.getResult(this.data.no, this.data.Inst_id).subscribe({
      next: (data) => { this.records = data; this.loading = false; },
      error: () => {
        this.toast.show('Error loading result', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  onClose(): void { this.dialogRef.close(); }
}

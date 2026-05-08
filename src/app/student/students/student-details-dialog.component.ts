import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { StudentViewService } from './student-view.service';
import { StudentListItem, StudentDetail } from './student-view.models';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-student-details-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-details-dialog.component.html',
  styleUrls: ['./student-details-dialog.component.scss'],
})
export class StudentDetailsDialogComponent implements OnInit {
  student: StudentDetail | null = null;
  photoUrl = '';
  loading = false;
  activeTab = 1;

  constructor(
    private service: StudentViewService,
    private dialogRef: DialogRef<void, StudentDetailsDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: StudentListItem,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.service.getById(this.data.no).subscribe({
      next: (res) => {
        this.student = res.student;
        this.photoUrl = res.base64String1 ? 'data:image/jpeg;base64,' + res.base64String1 : '';
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error loading student details', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  onClose(): void { this.dialogRef.close(); }
}

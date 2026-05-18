import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { UserListingService } from './user-listing.service';
import { UserDetail } from './user-listing.models';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-user-listing-photo-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-listing-photo-dialog.component.html',
  styleUrls: ['./user-listing-photo-dialog.component.scss'],
})
export class UserListingPhotoDialogComponent implements OnInit {
  photoUrl = '';
  loading = false;

  constructor(
    private service: UserListingService,
    private dialogRef: DialogRef<void, UserListingPhotoDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: UserDetail,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.service.getEmployeeImage(this.data.UserName).subscribe({
      next: (base64) => {
        this.photoUrl = base64 ? 'data:image/jpeg;base64,' + base64 : '';
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error loading photo', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  onClose(): void { this.dialogRef.close(); }
}

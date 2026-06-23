import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { UserListingService } from './user-listing.service';
import { UserDetail } from './user-listing.models';
import { ToastService } from '../../core/toast/toast.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-user-listing-photo-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-listing-photo-dialog.component.html',
  styleUrls: ['./user-listing-photo-dialog.component.scss'],
})
export class UserListingPhotoDialogComponent implements OnInit {
  photoUrl: SafeUrl | null = null;
  loading = true;

  constructor(
    private service: UserListingService,
    private dialogRef: DialogRef<void, UserListingPhotoDialogComponent>,
    private toast: ToastService,
    private sanitizer: DomSanitizer,
    @Inject(DIALOG_DATA) public data: UserDetail,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.service.getEmployeeImage(this.data.UserName).subscribe({
      next: (base64) => {
        if (base64) {
          const cleaned = base64.trim().replace(/^["']|["']$/g, '');
          this.photoUrl = 'data:image/jpeg;base64,' + cleaned;
        } else {
          this.photoUrl = null;
        }
        this.loading = false;
      },
      error: () => {
        this.toast.show('photo is not available', {
          variant: 'info',
          duration: 3000,
        });
        this.photoUrl = null;
        this.loading = false;
      },
    });
  }
  onClose(): void {
    this.dialogRef.close();
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { NotificationService } from '../../core/notifications/notification.service';
import { NotificationItem, NotificationPayload } from '../../core/notifications/notification.models';
import { AcItem, AutocompleteComponent } from '../../shared/autocomplete/autocomplete.component';
import { ToastService } from '../../core/toast/toast.service';
import { KNOWN_VTYPES } from './notification-mgmt.models';

@Component({
  selector: 'app-notification-mgmt-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutocompleteComponent],
  templateUrl: './notification-mgmt-dialog.component.html',
  styleUrls: ['./notification-mgmt-dialog.component.scss'],
})
export class NotificationMgmtDialogComponent implements OnInit {
  form: FormGroup;
  empItems: AcItem[] = [];
  readonly knownVtypes = KNOWN_VTYPES;
  private readonly originalReadon: string | null;

  constructor(
    private fb: FormBuilder,
    private service: NotificationService,
    private dialogRef: DialogRef<boolean, NotificationMgmtDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: NotificationItem | null,
  ) {
    this.originalReadon = data?.Readon ?? null;
    this.form = this.fb.group({
      Notification_id: [data?.Notification_id || 0],
      Vtype: [data?.Vtype || '', [Validators.required, Validators.maxLength(6)]],
      Username: [data?.Username || '', Validators.required],
      Msg: [data?.Msg || '', Validators.required],
    });
  }

  ngOnInit(): void {
    this.service.getEmpPicker().subscribe({
      next: (items) => {
        this.empItems = items;
      },
      error: () => this.toast.show('Error loading employee list', { variant: 'error', duration: 3000 }),
    });
  }

  get statusLabel(): string {
    return this.originalReadon ? 'Read' : 'Unread';
  }

  pickVtype(v: string): void {
    this.form.patchValue({ Vtype: v });
  }

  onSave(): void {
    if (!this.form.valid) return;
    const payload: NotificationPayload = {
      ...this.form.value,
      Inst_id: null,
      Readon: this.originalReadon,
    };
    this.service.save(payload).subscribe({
      next: () => {
        this.toast.show('Notification saved successfully', { variant: 'success', duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => this.toast.show('Error saving notification', { variant: 'error', duration: 3000 }),
    });
  }

  onDelete(): void {
    if (!this.data?.Notification_id) return;
    if (confirm('Are you sure you want to delete this notification?')) {
      this.service.deleteNotification(this.data.Notification_id).subscribe({
        next: () => {
          this.toast.show('Notification deleted successfully', { variant: 'success', duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => this.toast.show('Error deleting notification', { variant: 'error', duration: 3000 }),
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

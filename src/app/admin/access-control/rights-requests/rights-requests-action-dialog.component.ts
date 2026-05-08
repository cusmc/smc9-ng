import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import {
  ActionDialogData,
  ActionDialogResult,
  RoleDto,
} from './rights-requests.models';

@Component({
  selector: 'app-rights-requests-action-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rights-requests-action-dialog.component.html',
  styleUrls: ['./rights-requests-action-dialog.component.scss'],
})
export class RightsRequestsActionDialogComponent {
  remarks = '';
  selectedRole: RoleDto | null = null;

  get title(): string {
    switch (this.data.mode) {
      case 'approve-user': return 'Approve for User';
      case 'approve-role': return 'Approve for Role';
      case 'reject':       return 'Reject Request';
    }
  }

  get confirmLabel(): string {
    switch (this.data.mode) {
      case 'approve-user': return 'Approve';
      case 'approve-role': return 'Approve for Role';
      case 'reject':       return 'Reject';
    }
  }

  get confirmClass(): string {
    return this.data.mode === 'reject'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-[var(--app-primary)] hover:bg-[var(--app-primary-dark)] text-white';
  }

  get canConfirm(): boolean {
    if (this.data.mode === 'approve-role') return !!this.selectedRole;
    return true;
  }

  constructor(
    private dialogRef: DialogRef<ActionDialogResult, RightsRequestsActionDialogComponent>,
    @Inject(DIALOG_DATA) public data: ActionDialogData,
  ) {}

  onConfirm(): void {
    this.dialogRef.close({
      mode: this.data.mode,
      selectedRole: this.selectedRole ?? undefined,
      remarks: this.remarks.trim(),
    });
  }

  onCancel(): void { this.dialogRef.close(); }
}

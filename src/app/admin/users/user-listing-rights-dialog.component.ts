import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { UserListingService } from './user-listing.service';
import { UserDetail, UserRightsRecord } from './user-listing.models';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-user-listing-rights-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-listing-rights-dialog.component.html',
  styleUrls: ['./user-listing-rights-dialog.component.scss'],
})
export class UserListingRightsDialogComponent implements OnInit {
  records: UserRightsRecord[] = [];
  loading = false;

  search = {
    WModule_id: '',
    WModule_nm: '',
    permission: '',
    RoleName: '',
    RightType: '',
  };

  get filteredRecords(): UserRightsRecord[] {
    return this.records.filter(
      (r) =>
        (!this.search.WModule_id ||
          String(r.WModule_id ?? '').includes(this.search.WModule_id)) &&
        (!this.search.WModule_nm ||
          (r.WModule_nm ?? '').toLowerCase().includes(this.search.WModule_nm.toLowerCase())) &&
        (!this.search.permission ||
          (r.permission ?? '').toLowerCase().includes(this.search.permission.toLowerCase())) &&
        (!this.search.RoleName ||
          (r.RoleName ?? '').toLowerCase().includes(this.search.RoleName.toLowerCase())) &&
        (!this.search.RightType ||
          (r.RightType ?? '').toLowerCase().includes(this.search.RightType.toLowerCase())),
    );
  }

  constructor(
    private service: UserListingService,
    private dialogRef: DialogRef<void, UserListingRightsDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: UserDetail,
  ) {}

  ngOnInit(): void {
    this.loadRights();
  }

  loadRights(): void {
    this.loading = true;
    this.service.getRightsByUser(this.data.UserName).subscribe({
      next: (data) => { this.records = data; this.loading = false; },
      error: () => {
        this.toast.show('Error loading rights', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  exportCsv(): void {
    if (!this.records.length) return;
    const headers = ['Module ID', 'Module Name', 'Permission', 'Role Name', 'Rights Type'];
    const rows = this.filteredRecords.map((r) =>
      [r.WModule_id, r.WModule_nm, r.permission, r.RoleName, r.RightType]
        .map((v) => '"' + (v ?? '').toString().replace(/"/g, '""') + '"')
        .join(','),
    );
    const csv = [headers.join(',')].concat(rows).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rights_' + this.data.UserName + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  onClose(): void { this.dialogRef.close(); }
}

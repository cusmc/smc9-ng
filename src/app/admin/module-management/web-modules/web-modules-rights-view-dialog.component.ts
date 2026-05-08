import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { WebModulesService } from './web-modules.service';
import { Wmodule, RightsRecord } from './web-modules.models';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-web-modules-rights-view-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './web-modules-rights-view-dialog.component.html',
  styleUrls: ['./web-modules-rights-view-dialog.component.scss'],
})
export class WebModulesRightsViewDialogComponent implements OnInit {
  records: RightsRecord[] = [];
  loading = false;
  search = '';

  get filteredRecords(): RightsRecord[] {
    if (!this.search) return this.records;
    const q = this.search.toLowerCase();
    return this.records.filter(
      (r) =>
        r.UserName.toLowerCase().includes(q) ||
        r.FullName.toLowerCase().includes(q) ||
        (r.RoleName ?? '').toLowerCase().includes(q),
    );
  }

  constructor(
    private service: WebModulesService,
    private dialogRef: DialogRef<void, WebModulesRightsViewDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: Wmodule,
  ) {}

  ngOnInit(): void {
    this.loadRights();
  }

  loadRights(): void {
    this.loading = true;
    this.service.getRightsByModule(this.data.Wmodule_id).subscribe({
      next: (data) => { this.records = data; this.loading = false; },
      error: () => {
        this.toast.show('Error loading rights', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  exportCsv(): void {
    if (!this.records.length) return;
    const headers = ['Username', 'Full Name', 'Module', 'Permission', 'Role', 'Type'];
    const rows = this.filteredRecords.map((r) =>
      [r.UserName, r.FullName, r.Wmodule_nm, r.Permission, r.RoleName, r.Type]
        .map((v) => `"${(v ?? '').replace(/"/g, '""')}"`)
        .join(','),
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rights_${this.data.Wmodule_nm}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onClose(): void { this.dialogRef.close(); }
}

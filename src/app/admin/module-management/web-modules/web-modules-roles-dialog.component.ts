import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { WebModulesService } from './web-modules.service';
import { Wmodule, GroupWright } from './web-modules.models';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-web-modules-roles-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './web-modules-roles-dialog.component.html',
  styleUrls: ['./web-modules-roles-dialog.component.scss'],
})
export class WebModulesRolesDialogComponent implements OnInit {
  groups: GroupWright[] = [];
  loading = false;
  saving = false;

  constructor(
    private service: WebModulesService,
    private dialogRef: DialogRef<void, WebModulesRolesDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: Wmodule,
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.service.getAllGroups(this.data.Wmodule_id).subscribe({
      next: (data) => { this.groups = data; this.loading = false; },
      error: () => {
        this.toast.show('Error loading roles', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  onSave(): void {
    this.saving = true;
    // The legacy API takes roleid + list; we send the full groups array
    // SaveModulesByrole expects roleid (not used for bulk) + list of Wrights
    this.service.saveRoleRights('', this.groups).subscribe({
      next: () => {
        this.toast.show('Role rights saved', { variant: 'success', duration: 3000 });
        this.saving = false;
      },
      error: (err) => {
        this.toast.show(err?.error?.Message || 'Error saving rights', { variant: 'error', duration: 3000 });
        this.saving = false;
      },
    });
  }

  onClose(): void { this.dialogRef.close(); }
}

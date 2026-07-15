import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { WebModulesService } from './web-modules.service';
import { Wmodule, MenuGroupOption, GroupLabelOption } from './web-modules.models';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-web-modules-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './web-modules-edit-dialog.component.html',
  styleUrls: ['./web-modules-edit-dialog.component.scss'],
})
export class WebModulesEditDialogComponent implements OnInit {
  form!: FormGroup;
  saving = false;
  deleting = false;

  menuGroups: MenuGroupOption[] = [];
  groupLabels: GroupLabelOption[] = [];

  get isEdit(): boolean { return !!this.data; }

  constructor(
    private fb: FormBuilder,
    private service: WebModulesService,
    private dialogRef: DialogRef<boolean, WebModulesEditDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: Wmodule | null,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      Wmodule_id: [this.data?.Wmodule_id ?? 0],
      Wmodule_nm: [this.data?.Wmodule_nm ?? '', [Validators.required]],
      Cont_name:  [this.data?.Cont_name ?? '',  [Validators.required]],
      View_name:  [this.data?.View_name ?? '',  [Validators.required]],
      Params:     [this.data?.Params ?? ''],
      Parent_id:  [this.data?.Parent_id ?? null],
      Priority:   [this.data?.Priority ?? null],
      Portal_id:  [this.data?.Portal_id ?? null],
      NavModule_Subcode_id: [this.data?.NavModule_Subcode_id ?? null],
      NavGroupLabel: [this.data?.NavGroupLabel ?? ''],
      NavGroupIcon:  [this.data?.NavGroupIcon ?? ''],
      NavIcon:    [this.data?.NavIcon ?? ''],
      NgRoute:    [this.data?.NgRoute ?? ''],
      ShowInMenu: [this.data?.ShowInMenu ?? false],
    });

    this.service.getMenuGroups().subscribe({
      next: (groups) => {
        this.menuGroups = groups;
        if (this.form.value.NavModule_Subcode_id) {
          this.loadGroupLabels(this.form.value.NavModule_Subcode_id);
        }
      },
    });

    this.form.get('NavModule_Subcode_id')!.valueChanges.subscribe((id: number | null) => {
      this.groupLabels = [];
      if (id) { this.loadGroupLabels(id); }
    });
  }

  private loadGroupLabels(navModuleSubcodeId: number): void {
    this.service.getGroupLabels(navModuleSubcodeId).subscribe({
      next: (labels) => { this.groupLabels = labels; },
    });
  }

  onGroupLabelPicked(label: string): void {
    const match = this.groupLabels.find((g) => g.Label === label);
    this.form.patchValue({
      NavGroupLabel: label,
      NavGroupIcon: match?.Icon ?? this.form.value.NavGroupIcon,
    });
  }

  onSave(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.service.save(this.form.value).subscribe({
      next: () => {
        this.toast.show(this.isEdit ? 'Module updated' : 'Module created', { variant: 'success', duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.toast.show(err?.error?.Message || 'Error saving module', { variant: 'error', duration: 3000 });
        this.saving = false;
      },
    });
  }

  onDelete(): void {
    if (!this.data?.Wmodule_id) return;
    if (!confirm(`Delete module "${this.data.Wmodule_nm}"? This will also remove all associated rights.`)) return;
    this.deleting = true;
    this.service.delete(this.data.Wmodule_id).subscribe({
      next: () => {
        this.toast.show('Module deleted', { variant: 'success', duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.toast.show(err?.error?.Message || 'Error deleting module', { variant: 'error', duration: 3000 });
        this.deleting = false;
      },
    });
  }

  onCancel(): void { this.dialogRef.close(); }
}

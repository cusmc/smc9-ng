import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { forkJoin } from 'rxjs';
import { UserListingService } from './user-listing.service';
import { AppUser, RoleItem } from './user-listing.models';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-user-listing-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-listing-edit-dialog.component.html',
  styleUrls: ['./user-listing-edit-dialog.component.scss'],
})
export class UserListingEditDialogComponent implements OnInit {
  form!: FormGroup;
  roleList: RoleItem[] = [];
  roleSearch = '';
  loading = false;
  saving = false;

  get isEdit(): boolean { return !!this.username; }

  get is30Series(): boolean {
    const un: string = this.form ? (this.form.getRawValue().Username || '') : '';
    return un.startsWith('30');
  }

  get filteredRoles(): RoleItem[] {
    if (!this.roleSearch) return this.roleList;
    const q = this.roleSearch.toLowerCase();
    return this.roleList.filter((r) => r.name.toLowerCase().includes(q));
  }

  constructor(
    private fb: FormBuilder,
    private service: UserListingService,
    private dialogRef: DialogRef<boolean, UserListingEditDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public username: string | null,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      Username: [{ value: '', disabled: this.isEdit }, [Validators.required]],
      FullName: ['', [Validators.required]],
      PhoneNumber: [''],
      Email: [''],
      Status: ['Y', [Validators.required]],
      UserType: [''],
      AllowLogin: [false],
    });

    if (this.isEdit) {
      this.loading = true;
      forkJoin({
        user: this.service.getById(this.username!),
        roles: this.service.getAllRoles(),
      }).subscribe({
        next: ({ user, roles }) => {
          this.form.patchValue({
            Username: user.UserName,
            FullName: user.fullname,
            PhoneNumber: user.PhoneNumber,
            Email: user.Email,
            Status: user.Status || 'Y',
            UserType: user.usertype,
            AllowLogin: user.AllowLogin || false,
          });
          const assignedIds = new Set((user.Roles || []).map((r) => r.RoleId));
          this.roleList = (roles as any[]).map((r) => ({
            id: r.id,
            name: r.name,
            Roleid: r.id,
            Assigned: assignedIds.has(r.id),
            Old_Assigned: assignedIds.has(r.id),
          }));
          this.loading = false;
        },
        error: () => {
          this.toast.show('Error loading user data', { variant: 'error', duration: 3000 });
          this.loading = false;
        },
      });
    }
  }

  onSave(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const raw = this.form.getRawValue();
    const payload = {
      Username: raw.Username,
      FullName: raw.FullName,
      PhoneNumber: raw.PhoneNumber,
      Email: raw.Email,
      Status: raw.Status,
      UserType: raw.UserType,
      AllowLogin: raw.AllowLogin || false,
      Roles: this.isEdit ? this.roleList : undefined,
    };
    this.service.saveUser(payload).subscribe({
      next: () => {
        this.toast.show(this.isEdit ? 'User updated' : 'User created', { variant: 'success', duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.toast.show(err?.error?.Message || 'Error saving user', { variant: 'error', duration: 3000 });
        this.saving = false;
      },
    });
  }

  onCancel(): void { this.dialogRef.close(); }
}

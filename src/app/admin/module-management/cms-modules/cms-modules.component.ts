import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { CmsModulesService } from './cms-modules.service';
import { Cmodule } from './cms-modules.models';
import { CmsModulesEditDialogComponent } from './cms-modules-edit-dialog.component';
import { CmsModulesUsersDialogComponent } from './cms-modules-users-dialog.component';
import { CmsModulesRolesDialogComponent } from './cms-modules-roles-dialog.component';
import { CmsModulesRightsViewDialogComponent } from './cms-modules-rights-view-dialog.component';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-cms-modules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cms-modules.component.html',
  styleUrls: ['./cms-modules.component.scss'],
})
export class CmsModulesComponent implements OnInit {
  modules: Cmodule[] = [];
  loading = false;
  currentPage = 1;
  readonly itemsPerPage = 10;

  search = {
    Objcode: '',
    NamePrompt: '',
    Command: '',
    Levelname: '',
  };

  constructor(
    private service: CmsModulesService,
    private dialog: Dialog,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadModules();
  }

  loadModules(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (data) => {
        this.modules = data;
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error loading CMS modules', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  get searchedData(): Cmodule[] {
    return this.modules.filter(
      (m) =>
        (!this.search.Objcode ||
          (m.Objcode ?? '').toLowerCase().includes(this.search.Objcode.toLowerCase())) &&
        (!this.search.NamePrompt ||
          ((m.Name ?? '') + ' ' + (m.Prompt ?? '')).toLowerCase().includes(this.search.NamePrompt.toLowerCase())) &&
        (!this.search.Command ||
          (m.Command ?? '').toLowerCase().includes(this.search.Command.toLowerCase())) &&
        (!this.search.Levelname ||
          (m.Levelname ?? '').toLowerCase().includes(this.search.Levelname.toLowerCase())),
    );
  }

  get pagedData(): Cmodule[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.searchedData.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.searchedData.length / this.itemsPerPage));
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  openAddDialog(): void {
    const ref = this.dialog.open(CmsModulesEditDialogComponent, { width: '520px', data: null });
    ref.closed.subscribe((saved) => { if (saved) this.loadModules(); });
  }

  openEditDialog(mod: Cmodule): void {
    const ref = this.dialog.open(CmsModulesEditDialogComponent, { width: '520px', data: mod });
    ref.closed.subscribe((saved) => { if (saved) this.loadModules(); });
  }

  openUsersDialog(mod: Cmodule): void {
    this.dialog.open(CmsModulesUsersDialogComponent, { width: '800px', data: mod });
  }

  openRolesDialog(mod: Cmodule): void {
    this.dialog.open(CmsModulesRolesDialogComponent, { width: '700px', data: mod });
  }

  openRightsView(mod: Cmodule): void {
    this.dialog.open(CmsModulesRightsViewDialogComponent, { width: '860px', data: mod });
  }
}

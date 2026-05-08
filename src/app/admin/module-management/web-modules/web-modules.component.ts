import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { WebModulesService } from './web-modules.service';
import { Wmodule } from './web-modules.models';
import { WebModulesEditDialogComponent } from './web-modules-edit-dialog.component';
import { WebModulesUsersDialogComponent } from './web-modules-users-dialog.component';
import { WebModulesRolesDialogComponent } from './web-modules-roles-dialog.component';
import { WebModulesRightsViewDialogComponent } from './web-modules-rights-view-dialog.component';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-web-modules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './web-modules.component.html',
  styleUrls: ['./web-modules.component.scss'],
})
export class WebModulesComponent implements OnInit {
  modules: Wmodule[] = [];
  loading = false;
  currentPage = 1;
  readonly itemsPerPage = 10;

  search = {
    Wmodule_nm: '',
    Cont_name: '',
    View_name: '',
    Params: '',
  };

  constructor(
    private service: WebModulesService,
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
        this.toast.show('Error loading web modules', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  get searchedData(): Wmodule[] {
    return this.modules.filter(
      (m) =>
        (!this.search.Wmodule_nm ||
          (m.Wmodule_nm ?? '').toLowerCase().includes(this.search.Wmodule_nm.toLowerCase())) &&
        (!this.search.Cont_name ||
          (m.Cont_name ?? '').toLowerCase().includes(this.search.Cont_name.toLowerCase())) &&
        (!this.search.View_name ||
          (m.View_name ?? '').toLowerCase().includes(this.search.View_name.toLowerCase())) &&
        (!this.search.Params ||
          (m.Params ?? '').toLowerCase().includes(this.search.Params.toLowerCase())),
    );
  }

  get pagedData(): Wmodule[] {
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
    const ref = this.dialog.open(WebModulesEditDialogComponent, { width: '560px', data: null });
    ref.closed.subscribe((saved) => { if (saved) this.loadModules(); });
  }

  openEditDialog(mod: Wmodule): void {
    const ref = this.dialog.open(WebModulesEditDialogComponent, { width: '560px', data: mod });
    ref.closed.subscribe((saved) => { if (saved) this.loadModules(); });
  }

  openUsersDialog(mod: Wmodule): void {
    this.dialog.open(WebModulesUsersDialogComponent, { width: '800px', data: mod });
  }

  openRolesDialog(mod: Wmodule): void {
    this.dialog.open(WebModulesRolesDialogComponent, { width: '700px', data: mod });
  }

  openRightsView(mod: Wmodule): void {
    this.dialog.open(WebModulesRightsViewDialogComponent, { width: '860px', data: mod });
  }
}

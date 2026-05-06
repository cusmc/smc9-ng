import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { ActivatedRoute } from '@angular/router';
import { SubgroupMasterService } from './subgroup-master.service';
import { Subgroup } from './subgroup-master.models';
import { SubgroupMasterDialogComponent } from './subgroup-master-dialog.component';
import { LookupService } from '../../shared/lookup.service';
import { AuthService } from '../../../auth/auth.service';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-subgroup-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subgroup-master.component.html',
  styleUrls: ['./subgroup-master.component.scss']
})
export class SubgroupMasterComponent implements OnInit {
  subgroups: Subgroup[] = [];
  subjects: any[] = [];
  selectedSubjectId: number | null = null;
  search = { Subgroup_nm: '', Subgroup_type: '', Create_by: '', Create_dt: '' };
  currentPage = 1;
  readonly itemsPerPage = 10;
  loading = false;
  subgroupType = '';

  constructor(
    private service: SubgroupMasterService,
    private lookupService: LookupService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private dialog: Dialog,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.subgroupType = params['type'] || 'Section';
      const empid = this.authService.getUsername() || '';
      this.lookupService.getSubjectsByEmpid(empid).subscribe({
        next: (data) => {
          this.subjects = data;
          if (data.length > 0) {
            this.selectedSubjectId = data[0].Subject_id;
            this.loadSubgroups();
          }
        },
        error: () => this.toast.show('Error loading subjects', { variant: 'error', duration: 3000 })
      });
    });
  }

  onSubjectChange(subjectId: number): void {
    this.selectedSubjectId = subjectId;
    this.currentPage = 1;
    this.loadSubgroups();
  }

  loadSubgroups(): void {
    if (!this.selectedSubjectId) return;
    this.loading = true;
    this.service.getSubgroups(this.subgroupType, this.selectedSubjectId).subscribe({
      next: (data) => {
        this.subgroups = data;
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error loading subgroups', { variant: 'error', duration: 3000 });
        this.loading = false;
      }
    });
  }

  get searchedData(): Subgroup[] {
    return this.subgroups.filter(s =>
      (!this.search.Subgroup_nm   || (s.Subgroup_nm   ?? '').toLowerCase().includes(this.search.Subgroup_nm.toLowerCase())) &&
      (!this.search.Subgroup_type || (s.Subgroup_type ?? '').toLowerCase().includes(this.search.Subgroup_type.toLowerCase())) &&
      (!this.search.Create_by     || (s.Create_by     ?? '').toLowerCase().includes(this.search.Create_by.toLowerCase())) &&
      (!this.search.Create_dt     || (s.Create_dt     ?? '').includes(this.search.Create_dt))
    );
  }

  get pagedSubgroups(): Subgroup[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.searchedData.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.searchedData.length / this.itemsPerPage);
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  getTypeLabel(): string {
    return this.subgroupType.charAt(0).toUpperCase() + this.subgroupType.slice(1);
  }

  openAddDialog(): void {
    const ref = this.dialog.open(SubgroupMasterDialogComponent, {
      width: '500px',
      data: { subgroupType: this.subgroupType, subgroup: null }
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadSubgroups();
    });
  }

  openEditDialog(subgroup: Subgroup): void {
    const ref = this.dialog.open(SubgroupMasterDialogComponent, {
      width: '500px',
      data: { subgroupType: this.subgroupType, subgroup }
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadSubgroups();
    });
  }

  deleteSubgroup(id: number): void {
    if (confirm('Are you sure you want to delete this item?')) {
      this.service.deleteSubgroup(id).subscribe({
        next: () => {
          this.toast.show('Item deleted successfully', { variant: 'success', duration: 3000 });
          this.loadSubgroups();
        },
        error: () => this.toast.show('Error deleting item', { variant: 'error', duration: 3000 })
      });
    }
  }
}

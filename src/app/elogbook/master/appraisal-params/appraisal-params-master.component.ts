import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { AuthService } from '../../../auth/auth.service';
import { LookupService } from '../../shared/lookup.service';
import { AppraisalParametersMasterService } from './appraisal-params-master.service';
import { AppraisalParameter } from './appraisal-params-master.models';
import { AppraisalParametersMasterDialogComponent } from './appraisal-params-master-dialog.component';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-appraisal-params-master',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './appraisal-params-master.component.html',
  styleUrls: ['./appraisal-params-master.component.scss']
})
export class AppraisalParametersMasterComponent implements OnInit {
  parameters: AppraisalParameter[] = [];
  filteredParameters: AppraisalParameter[] = [];
  subjects: any[] = [];
  filterForm: FormGroup;
  search = { Course_nm: '', Code: '', Descr: '', Displayorder: '' };
  loading = false;
  currentPage = 1;
  readonly itemsPerPage = 10;
  username = '';

  constructor(
    private authService: AuthService,
    private lookup: LookupService,
    private service: AppraisalParametersMasterService,
    private dialog: Dialog,
    private toast: ToastService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({ Subject_id: [null] });
  }

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
    this.lookup.getSubjectsByEmpid(this.username).subscribe((data) => {
      this.subjects = data;
      if (data.length > 0) {
        this.filterForm.patchValue({ Subject_id: data[0].Subject_id });
        this.loadParameters();
      }
    });
  }

  loadParameters(): void {
    const subjectId = this.filterForm.get('Subject_id')?.value;
    if (!subjectId) return;
    this.loading = true;
    this.service.getParameters().subscribe({
      next: (data) => {
        this.parameters = data;
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error loading parameters', { variant: 'error', duration: 3000 });
        this.loading = false;
      }
    });
  }

  get searchedData(): AppraisalParameter[] {
    return this.parameters.filter(p =>
      (!this.search.Course_nm  || (p.Course_nm  ?? '').toLowerCase().includes(this.search.Course_nm.toLowerCase())) &&
      (!this.search.Code       || (p.Code       ?? '').toLowerCase().includes(this.search.Code.toLowerCase())) &&
      (!this.search.Descr      || (p.Descr      ?? '').toLowerCase().includes(this.search.Descr.toLowerCase())) &&
      (!this.search.Displayorder || String(p.Displayorder ?? '').includes(this.search.Displayorder))
    );
  }

  get pagedParameters(): AppraisalParameter[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.searchedData.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.searchedData.length / this.itemsPerPage);
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  openAddDialog(): void {
    const ref = this.dialog.open(AppraisalParametersMasterDialogComponent, { width: '600px', maxWidth: '95vw', disableClose: true, data: null });
    ref.closed.subscribe((result) => {
      if (result) this.loadParameters();
    });
  }

  openEditDialog(parameter: AppraisalParameter): void {
    const ref = this.dialog.open(AppraisalParametersMasterDialogComponent, { width: '600px', maxWidth: '95vw', disableClose: true, data: parameter });
    ref.closed.subscribe((result) => {
      if (result) this.loadParameters();
    });
  }

  formatBoolean(value: any): string {
    return (value === 'Y' || value === true) ? 'Yes' : 'No';
  }

  formatActive(value: any): string {
    return (value === 'Y' || value === true) ? 'Active' : 'Inactive';
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/api.service';
import { ToastService } from '../../core/toast/toast.service';
import { AutocompleteComponent, AcItem } from '../../shared/autocomplete/autocomplete.component';
import { DeclarationFormService } from './declaration-form.service';

@Component({
  selector: 'app-declaration-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AutocompleteComponent],
  templateUrl: './declaration-form.component.html',
})
export class DeclarationFormComponent implements OnInit {
  empItems: AcItem[] = [];
  selectedEmpId: number | null = null;

  withSign = true;
  withAtt = false;

  loading = false;

  constructor(
    private api: ApiService,
    private service: DeclarationFormService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.api.get<AcItem[]>('/api/HR/EmpmastsAPI/GetEmpList_DrpDwn').subscribe({
      next: (data) => (this.empItems = data),
      error: () => this.toast.show('Failed to load employee list', { variant: 'error' }),
    });
  }

  generateWord(): void {
    if (!this.selectedEmpId) {
      this.toast.show('Please select an employee', { variant: 'warning' });
      return;
    }
    this.loading = true;
    this.service.generateWord(this.selectedEmpId, this.withSign, this.withAtt).subscribe({
      next: (res) => {
        this.loading = false;
        const url = this.service.toAbsoluteUrl(res.url);
        const a = document.createElement('a');
        a.href = url;
        a.download = '';
        document.body.appendChild(a);
        a.click();
        a.remove();
      },
      error: (err) => {
        this.loading = false;
        this.toast.show(err?.error || 'Failed to generate declaration form', { variant: 'error' });
      },
    });
  }
}

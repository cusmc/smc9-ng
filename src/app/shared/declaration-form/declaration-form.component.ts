import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../shared/api.service';
import { ToastService } from '../../core/toast/toast.service';
import { AuthService } from '../../auth/auth.service';
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

  // Self-service mode (route data: { lockToSelf: true }, set on /profile/declaration-form):
  // the employee picker is locked to the caller's own record and GenerateMyWord is used
  // instead of GenerateWord, so there is no client-editable empid at all in this mode.
  lockToSelf = false;

  constructor(
    private api: ApiService,
    private service: DeclarationFormService,
    private toast: ToastService,
    private auth: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.lockToSelf = this.route.snapshot.data['lockToSelf'] === true;

    this.api.get<AcItem[]>('/api/HR/EmpmastsAPI/GetEmpList_DrpDwn').subscribe({
      next: (data) => {
        this.empItems = data;
        if (this.lockToSelf) {
          // This system's login username is the employee's own Empid (see
          // EmpmastsAPIController.GetMyDocu) -- used here only to preselect the display
          // name in the (disabled) autocomplete; the actual generation request carries no
          // empid at all.
          const myEmpId = Number(this.auth.getUsername());
          this.selectedEmpId = Number.isFinite(myEmpId) ? myEmpId : null;
        }
      },
      error: () => this.toast.show('Failed to load employee list', { variant: 'error' }),
    });
  }

  generateWord(): void {
    if (!this.lockToSelf && !this.selectedEmpId) {
      this.toast.show('Please select an employee', { variant: 'warning' });
      return;
    }
    this.loading = true;
    const request$ = this.lockToSelf
      ? this.service.generateMyWord(this.withSign, this.withAtt)
      : this.service.generateWord(this.selectedEmpId!, this.withSign, this.withAtt);

    request$.subscribe({
      next: (blob) => {
        this.loading = false;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Declaration.docx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      },
      error: (err) => {
        this.loading = false;
        this.showGenerateError(err);
      },
    });
  }

  // With responseType: 'blob', error bodies come back as a Blob too (not text) -- read it
  // back out so the toast shows the actual server message instead of "[object Blob]".
  private showGenerateError(err: any): void {
    const fallback = 'Failed to generate declaration form';
    if (err?.error instanceof Blob) {
      err.error.text().then((text: string) => {
        this.toast.show(text || fallback, { variant: 'error' });
      }).catch(() => {
        this.toast.show(fallback, { variant: 'error' });
      });
    } else {
      this.toast.show(err?.error || fallback, { variant: 'error' });
    }
  }
}

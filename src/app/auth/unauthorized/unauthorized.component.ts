import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RightsService } from '../rights.service';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unauthorized.component.html'
})
export class UnauthorizedComponent implements OnInit {
  moduleName   = '';
  wmoduleId    = 0;
  remarks      = '';
  requesting   = false;
  requested    = false;
  requestError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rightsService: RightsService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    const cont     = this.route.snapshot.queryParamMap.get('cont')     ?? '';
    const view     = this.route.snapshot.queryParamMap.get('view')     ?? '';
    const menupara = this.route.snapshot.queryParamMap.get('menupara') ?? '';
    if (cont && view) {
      this.rightsService.getModuleInfo(cont, view, menupara).subscribe(info => {
        this.wmoduleId  = info.Wmodule_id;
        this.moduleName = info.Wmodule_nm || (cont + ' / ' + view);
      });
    }
  }

  requestAccess(): void {
    if (!this.wmoduleId) return;
    this.requesting   = true;
    this.requestError = '';
    this.api.post<string>('/api/Admin/RightsRequestAPI/AddRequest',
      { Wmodule_id: this.wmoduleId, Remarks: this.remarks }
    ).subscribe({
      next:  ()    => { this.requested  = true;  this.requesting = false; },
      error: (err) => {
        this.requestError = (typeof err?.error === 'string' ? err.error : null)
          ?? 'Could not send request. Please try again.';
        this.requesting = false;
      }
    });
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/elogbook/activities']);
    }
  }

  loginDifferent(): void {
    this.router.navigate(['/login']);
  }
}

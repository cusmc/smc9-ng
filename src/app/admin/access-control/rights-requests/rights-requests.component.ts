import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { RightsRequestsService } from './rights-requests.service';
import { RightsReqView, RoleDto, ActionDialogData, ActionDialogResult } from './rights-requests.models';
import { RightsRequestsActionDialogComponent } from './rights-requests-action-dialog.component';
import { ToastService } from '../../../core/toast/toast.service';

type Tab = 'pending' | 'history';

@Component({
  selector: 'app-rights-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rights-requests.component.html',
  styleUrls: ['./rights-requests.component.scss'],
})
export class RightsRequestsComponent implements OnInit {
  activeTab: Tab = 'pending';

  pendingList: RightsReqView[] = [];
  historyList: RightsReqView[] = [];

  loadingPending = false;
  loadingHistory = false;
  histLoaded = false;

  constructor(
    private service: RightsRequestsService,
    private dialog: Dialog,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadPending();
  }

  switchTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'history' && !this.histLoaded) {
      this.loadHistory();
    }
  }

  loadPending(): void {
    this.loadingPending = true;
    this.service.getPending().subscribe({
      next: (data) => { this.pendingList = data; this.loadingPending = false; },
      error: () => {
        this.toast.show('Error loading pending requests', { variant: 'error', duration: 3000 });
        this.loadingPending = false;
      },
    });
  }

  loadHistory(): void {
    this.loadingHistory = true;
    this.service.getHistory().subscribe({
      next: (data) => { this.historyList = data; this.loadingHistory = false; this.histLoaded = true; },
      error: () => {
        this.toast.show('Error loading history', { variant: 'error', duration: 3000 });
        this.loadingHistory = false;
      },
    });
  }

  // ── Approve for User ──────────────────────────────────────────────────
  openApproveUser(req: RightsReqView): void {
    const data: ActionDialogData = { mode: 'approve-user', request: req };
    const ref = this.dialog.open<ActionDialogResult>(RightsRequestsActionDialogComponent, {
      width: '480px',
      data,
    });
    ref.closed.subscribe((result) => {
      if (!result) return;
      this.service.approveUser({ RightsReq_id: req.RightsReq_id, Action_remarks: result.remarks }).subscribe({
        next: () => {
          this.toast.show(`Access granted to user "${req.Username}"`, { variant: 'success', duration: 4000 });
          this.removePending(req.RightsReq_id);
        },
        error: (err) => this.toast.show(err?.error?.Message || 'Error approving request', { variant: 'error', duration: 3000 }),
      });
    });
  }

  // ── Approve for Role ──────────────────────────────────────────────────
  openApproveRole(req: RightsReqView): void {
    this.service.getUserRoles(req.Username).subscribe({
      next: (roles) => {
        const data: ActionDialogData = { mode: 'approve-role', request: req, roles };
        const ref = this.dialog.open<ActionDialogResult>(RightsRequestsActionDialogComponent, {
          width: '520px',
          data,
        });
        ref.closed.subscribe((result) => {
          if (!result || !result.selectedRole) return;
          this.service.approveRole({
            RightsReq_id: req.RightsReq_id,
            RoleId: result.selectedRole.Id,
            RoleName: result.selectedRole.Name,
            Action_remarks: result.remarks,
          }).subscribe({
            next: () => {
              this.toast.show(`Access granted to role "${result.selectedRole!.Name}"`, { variant: 'success', duration: 4000 });
              this.removePending(req.RightsReq_id);
            },
            error: (err) => this.toast.show(err?.error?.Message || 'Error approving for role', { variant: 'error', duration: 3000 }),
          });
        });
      },
      error: () => this.toast.show('Could not load roles for this user', { variant: 'error', duration: 3000 }),
    });
  }

  // ── Reject ────────────────────────────────────────────────────────────
  openReject(req: RightsReqView): void {
    const data: ActionDialogData = { mode: 'reject', request: req };
    const ref = this.dialog.open<ActionDialogResult>(RightsRequestsActionDialogComponent, {
      width: '480px',
      data,
    });
    ref.closed.subscribe((result) => {
      if (!result) return;
      this.service.reject({ RightsReq_id: req.RightsReq_id, Action_remarks: result.remarks }).subscribe({
        next: () => {
          this.toast.show(`Request from "${req.Username}" rejected`, { variant: 'info', duration: 4000 });
          this.removePending(req.RightsReq_id);
        },
        error: (err) => this.toast.show(err?.error?.Message || 'Error rejecting request', { variant: 'error', duration: 3000 }),
      });
    });
  }

  private removePending(id: number): void {
    this.pendingList = this.pendingList.filter((r) => r.RightsReq_id !== id);
    this.histLoaded = false; // force history reload next visit
  }

  statusLabel(s: string): string {
    return s === 'A' ? 'Approved' : s === 'R' ? 'Rejected' : 'Pending';
  }
}

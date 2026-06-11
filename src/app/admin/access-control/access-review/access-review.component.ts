import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccessReviewService } from './access-review.service';
import { AccessReviewRow, UserReviewRow } from './access-review.models';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-access-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './access-review.component.html',
})
export class AccessReviewComponent implements OnInit {
  activeTab: 'users' | 'matrix' = 'users';

  users: UserReviewRow[] = [];
  matrix: AccessReviewRow[] = [];

  loadingUsers = false;
  loadingMatrix = false;
  matrixLoaded = false;

  userSearch = { UserName: '', Fullname: '', DeptName: '', Status: '' };
  matrixSearch = { Username: '', ModuleName: '' };

  currentPageU = 1;
  currentPageM = 1;
  readonly pageSize = 15;

  readonly permLabels = ['V', 'A', 'E', 'D', 'A1', 'A2'];

  constructor(
    private service: AccessReviewService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.service.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.currentPageU = 1;
        this.loadingUsers = false;
      },
      error: () => {
        this.toast.show('Error loading users', { variant: 'error', duration: 3000 });
        this.loadingUsers = false;
      },
    });
  }

  loadMatrix(): void {
    this.loadingMatrix = true;
    this.service.getAccessMatrix().subscribe({
      next: (data) => {
        this.matrix = data;
        this.currentPageM = 1;
        this.loadingMatrix = false;
        this.matrixLoaded = true;
      },
      error: () => {
        this.toast.show('Error loading access matrix', { variant: 'error', duration: 3000 });
        this.loadingMatrix = false;
      },
    });
  }

  switchTab(tab: 'users' | 'matrix'): void {
    this.activeTab = tab;
    if (tab === 'matrix' && !this.matrixLoaded) {
      this.loadMatrix();
    }
  }

  hasPerm(perm: string, pos: number): boolean {
    return perm?.length > pos && perm[pos] === 'Y';
  }

  get activeUserCount(): number { return this.users.filter(u => u.Status === 'Y').length; }
  get inactiveUserCount(): number { return this.users.filter(u => u.Status !== 'Y').length; }
  get blockedUserCount(): number { return this.users.filter(u => !u.AllowLogin).length; }

  get filteredUsers(): UserReviewRow[] {
    const s = this.userSearch;
    return this.users.filter(u =>
      (!s.UserName || u.UserName.toLowerCase().includes(s.UserName.toLowerCase())) &&
      (!s.Fullname || u.Fullname.toLowerCase().includes(s.Fullname.toLowerCase())) &&
      (!s.DeptName || u.DeptName?.toLowerCase().includes(s.DeptName.toLowerCase())) &&
      (!s.Status || u.Status === s.Status),
    );
  }

  get pagedUsers(): UserReviewRow[] {
    const start = (this.currentPageU - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPagesU(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
  }

  get filteredMatrix(): AccessReviewRow[] {
    const s = this.matrixSearch;
    return this.matrix.filter(r =>
      (!s.Username || r.Username.toLowerCase().includes(s.Username.toLowerCase())) &&
      (!s.ModuleName || r.ModuleName?.toLowerCase().includes(s.ModuleName.toLowerCase())),
    );
  }

  get pagedMatrix(): AccessReviewRow[] {
    const start = (this.currentPageM - 1) * this.pageSize;
    return this.filteredMatrix.slice(start, start + this.pageSize);
  }

  get totalPagesM(): number {
    return Math.max(1, Math.ceil(this.filteredMatrix.length / this.pageSize));
  }
}

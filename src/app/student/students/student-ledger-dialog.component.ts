import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { StudentViewService } from './student-view.service';
import { StudentListItem, StudentLedgerRecord } from './student-view.models';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-student-ledger-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-ledger-dialog.component.html',
  styleUrls: ['./student-ledger-dialog.component.scss'],
})
export class StudentLedgerDialogComponent implements OnInit {
  records: StudentLedgerRecord[] = [];
  loading = false;

  get balance(): number {
    return this.records.reduce(
      (acc, r) => acc + (r.crdb === 1 ? r.amt : -r.amt),
      0,
    );
  }

  constructor(
    private service: StudentViewService,
    private dialogRef: DialogRef<void, StudentLedgerDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: StudentListItem,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.service.getLedger(this.data.no, this.data.Inst_id).subscribe({
      next: (data) => { this.records = data; this.loading = false; },
      error: () => {
        this.toast.show('Error loading ledger', { variant: 'error', duration: 3000 });
        this.loading = false;
      },
    });
  }

  onClose(): void { this.dialogRef.close(); }
}

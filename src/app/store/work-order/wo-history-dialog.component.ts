import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { WorkOrderService } from './work-order.service';
import { PartyItem, WorkOrderListItem } from './work-order.models';

interface DialogData {
  parties: PartyItem[];
}

@Component({
  selector: 'app-wo-history-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wo-history-dialog.component.html',
  styleUrls: ['./wo-history-dialog.component.scss']
})
export class WoHistoryDialogComponent implements OnInit {
  listData: WorkOrderListItem[] = [];
  loading = false;

  fromDt   = this.monthStartStr();
  toDt     = this.todayStr();
  partyId  = 0;
  status   = 'A';

  readonly statusOptions = [
    { value: 'A', label: 'All' },
    { value: 'P', label: 'Pending' },
    { value: 'C', label: 'Closed' }
  ];

  constructor(
    @Inject(DIALOG_DATA) public data: DialogData,
    private dialogRef: DialogRef<WorkOrderListItem | null, WoHistoryDialogComponent>,
    private service: WorkOrderService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getList(this.fromDt, this.toDt, this.partyId, this.status).subscribe({
      next: data => { this.listData = data; this.loading = false; },
      error: ()   => { this.loading = false; }
    });
  }

  select(row: WorkOrderListItem): void {
    this.dialogRef.close(row);
  }

  close(): void {
    this.dialogRef.close(null);
  }

  private todayStr(): string {
    return new Date().toISOString().substring(0, 10);
  }

  private monthStartStr(): string {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().substring(0, 10);
  }
}

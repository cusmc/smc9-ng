import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
  selector: 'app-webpages-history-dialog',
  standalone: true,
  templateUrl: './webpages-history-dialog.component.html',
})
export class WebpagesHistoryDialogComponent {
  constructor(
    private dialogRef: DialogRef<void, WebpagesHistoryDialogComponent>,
    @Inject(DIALOG_DATA) public webpageId: number,
  ) {}

  close(): void { this.dialogRef.close(); }
}

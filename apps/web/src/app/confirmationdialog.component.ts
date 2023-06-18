import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export class ConfirmationDialogData {
  constructor(public title: string, public message: string) { }
}

@Component({
  selector: 'app-confirmationdialog',
  templateUrl: './confirmationdialog.component.html',
  styleUrls: ['./confirmationdialog.component.sass']
})
export class ConfirmationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData, public dialogRef: MatDialogRef<ConfirmationDialogComponent>) {
    dialogRef.beforeClosed().subscribe((r: any) => {
      // Set the result to false if the dialog is closed with something other than a boolean
      // (clicking outside the dialog returns undefined, clicking cancel returns an empty string)
      if (typeof r !== 'boolean') {
        this.dialogRef.close(false);
      }
    });
  }

  ngOnInit(): void { }
}
